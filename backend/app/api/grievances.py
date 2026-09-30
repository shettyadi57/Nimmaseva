"""
grievances.py — Public Grievance Redressal API Endpoints.

Endpoints:
  POST /grievances         — Submit a new citizen grievance (creates DB record + audit log)
  GET  /grievances/{ticket_id}  — Track status of a submitted grievance by ticket ID
  GET  /grievances         — Admin: list all grievances with filters (requires auth)
"""
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime
import html
import re

from app.core.database import get_db
from app.models.models import Grievance, AuditLog
from app.core.dependencies import require_admin
from app.models.models import User

router = APIRouter(prefix="/grievances", tags=["Grievances"])


def sanitize_str(v: str) -> str:
    return html.escape(v.strip()) if isinstance(v, str) else v


# ── Schemas ────────────────────────────────────────────────────────────────────

class GrievanceCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')

    citizen_name: str = Field(..., min_length=2, max_length=100)
    mobile: str = Field(..., min_length=10, max_length=15)
    token_number: Optional[str] = Field(None, max_length=30)
    center_name: str = Field(..., min_length=2, max_length=200)
    category: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=10, max_length=2000)

    @field_validator('mobile')
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        cleaned = re.sub(r'\D', '', v)
        if len(cleaned) < 10:
            raise ValueError('Mobile number must be at least 10 digits')
        return cleaned

    @field_validator('citizen_name', 'center_name', 'category', 'description', 'token_number')
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_str(v) if v else v


class GrievanceOut(BaseModel):
    ticket_id: str
    citizen_name: str
    mobile: str
    token_number: Optional[str]
    center_name: str
    category: str
    description: str
    status: str
    resolution_notes: Optional[str]
    submitted_at: datetime
    resolved_at: Optional[datetime]


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("", response_model=GrievanceOut, status_code=201)
def submit_grievance(payload: GrievanceCreate, db: Session = Depends(get_db)):
    """
    Submit a new citizen grievance.
    Generates a unique GRV-XXXXXX ticket ID and stores in DB.
    Also creates an audit log entry so admins can see the submission.
    """
    # Generate a cryptographically unique ticket ID
    ticket_id = f"GRV-{secrets.randbelow(900000) + 100000}"

    grievance = Grievance(
        ticket_id=ticket_id,
        citizen_name=payload.citizen_name,
        mobile=payload.mobile,
        token_number=payload.token_number,
        center_name=payload.center_name,
        category=payload.category,
        description=payload.description,
        status="Submitted",
    )
    db.add(grievance)

    db.add(AuditLog(
        user_name=f"Citizen:{payload.mobile}",
        action="grievance_submitted",
        details=(
            f"Grievance {ticket_id} submitted by {payload.citizen_name} | "
            f"Category: {payload.category} | Center: {payload.center_name}"
            + (f" | Token: {payload.token_number}" if payload.token_number else "")
        )
    ))
    db.commit()
    db.refresh(grievance)
    return grievance


@router.get("/track/{ticket_id}", response_model=GrievanceOut)
def track_grievance(ticket_id: str, db: Session = Depends(get_db)):
    """
    Public endpoint: Citizen can track their grievance status using the ticket ID.
    Does NOT require authentication.
    """
    grievance = db.query(Grievance).filter(Grievance.ticket_id == ticket_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail=f"Ticket '{ticket_id}' not found. Please check and try again.")
    return grievance


@router.get("", response_model=List[GrievanceOut])
def list_grievances(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin-only: List all grievances with optional status filter and pagination."""
    query = db.query(Grievance).order_by(Grievance.submitted_at.desc())
    if status:
        query = query.filter(Grievance.status == status)
    return query.offset((page - 1) * limit).limit(limit).all()


@router.patch("/{ticket_id}/resolve")
def resolve_grievance(
    ticket_id: str,
    resolution_notes: str,
    new_status: str = "Resolved",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin-only: Resolve or reject a grievance with resolution notes."""
    allowed_statuses = ["Under Review", "Resolved", "Rejected"]
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {allowed_statuses}")

    grievance = db.query(Grievance).filter(Grievance.ticket_id == ticket_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail=f"Ticket '{ticket_id}' not found")

    grievance.status = new_status
    grievance.resolution_notes = html.escape(resolution_notes.strip())
    if new_status in ["Resolved", "Rejected"]:
        grievance.resolved_at = datetime.utcnow()

    db.add(AuditLog(
        user_name=current_user.full_name,
        action="grievance_resolved",
        details=f"Grievance {ticket_id} marked as '{new_status}' by {current_user.full_name}. Notes: {resolution_notes[:100]}"
    ))
    db.commit()
    db.refresh(grievance)
    return {"status": "success", "ticket_id": ticket_id, "new_status": new_status}
