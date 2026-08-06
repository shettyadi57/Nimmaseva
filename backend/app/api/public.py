"""
public.py — Public (unauthenticated) stats endpoint for the Home hero section.
Returns only aggregate counts — no PII, no admin-only data.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Booking

router = APIRouter(prefix="/public", tags=["Public"])

@router.get("/stats")
def get_public_stats(db: Session = Depends(get_db)):
    """
    Returns aggregate civic stats displayed on the Home hero section.
    No authentication required. No PII exposed.
    """
    total_tokens = db.query(Booking).count()
    completed = db.query(Booking).filter(Booking.status == "Completed").count()
    total_non_cancelled = db.query(Booking).filter(Booking.status != "Cancelled").count()

    completion_rate = (
        round((completed / total_non_cancelled) * 100, 1)
        if total_non_cancelled > 0
        else 0.0
    )

    return {
        "total_tokens_issued": total_tokens,
        "avg_wait_time_mins": 12.0,   # TODO: compute from actual completed booking timestamps
        "completion_rate_pct": completion_rate,
    }
