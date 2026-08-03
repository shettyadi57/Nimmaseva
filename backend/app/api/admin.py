from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import csv
import io
from app.core.database import get_db
from app.models.models import Booking, Office, Service, AuditLog
from app.schemas.schemas import BookingOut, AnalyticsSummary

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/summary", response_model=AnalyticsSummary)
def get_admin_summary(office_id: Optional[int] = None, db: Session = Depends(get_db)):
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    query = db.query(Booking).filter(Booking.visit_date == today_str)
    if office_id:
        query = query.filter(Booking.office_id == office_id)

    bookings = query.all()
    
    today_bookings = len(bookings)
    today_revenue = sum(b.amount_paid for b in bookings)
    completed_tokens = sum(1 for b in bookings if b.status == "Completed")
    cancelled_tokens = sum(1 for b in bookings if b.status == "Cancelled")
    pending_tokens = sum(1 for b in bookings if b.status == "Pending")
    walkin_tokens = sum(1 for b in bookings if b.booking_type == "Offline")
    online_tokens = sum(1 for b in bookings if b.booking_type == "Online")
    priority_tokens = sum(1 for b in bookings if b.is_priority)
    current_queue_len = pending_tokens

    # Calculate no show %
    no_shows = sum(1 for b in bookings if b.status == "No-Show")
    no_show_pct = (no_shows / today_bookings * 100) if today_bookings > 0 else 0.0

    return AnalyticsSummary(
        today_bookings=today_bookings,
        today_revenue=today_revenue,
        completed_tokens=completed_tokens,
        cancelled_tokens=cancelled_tokens,
        pending_tokens=pending_tokens,
        walkin_tokens=walkin_tokens,
        online_tokens=online_tokens,
        priority_tokens=priority_tokens,
        current_queue_len=current_queue_len,
        avg_wait_time_mins=14.5,
        no_show_percentage=round(no_show_pct, 1),
        most_requested_service="Income Certificate",
        peak_hour="10:00 AM - 11:00 AM"
    )

@router.get("/bookings", response_model=List[BookingOut])
def get_all_bookings(
    status: Optional[str] = None,
    office_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    if office_id:
        query = query.filter(Booking.office_id == office_id)

    bookings = query.order_by(Booking.id.desc()).limit(100).all()
    
    result = []
    for b in bookings:
        off = db.query(Office).filter(Office.id == b.office_id).first()
        srv = db.query(Service).filter(Service.id == b.service_id).first()
        
        b_out = BookingOut(
            id=b.id,
            token_number=b.token_number,
            verification_code=b.verification_code,
            citizen_name=b.citizen_name,
            phone=b.phone,
            aadhaar=b.aadhaar,
            age=b.age,
            gender=b.gender,
            is_priority=b.is_priority,
            priority_reason=b.priority_reason,
            booking_type=b.booking_type,
            office_id=b.office_id,
            service_id=b.service_id,
            booking_date=b.booking_date,
            visit_date=b.visit_date,
            visit_time=b.visit_time,
            status=b.status,
            counter_number=b.counter_number,
            amount_paid=b.amount_paid,
            tatkal_probability=b.tatkal_probability,
            created_at=b.created_at,
            office_name=off.name if off else "",
            service_name=srv.name if srv else "",
            people_ahead=0,
            avg_wait_mins=15
        )
        result.append(b_out)

    return result

@router.get("/export/csv")
def export_bookings_csv(db: Session = Depends(get_db)):
    bookings = db.query(Booking).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Token Number", "Citizen Name", "Phone", "Age", "Gender", 
        "Priority", "Booking Type", "Office ID", "Service ID", 
        "Visit Date", "Visit Time", "Status", "Amount Paid"
    ])

    for b in bookings:
        writer.writerow([
            b.token_number, b.citizen_name, b.phone, b.age, b.gender,
            "Yes" if b.is_priority else "No", b.booking_type, b.office_id,
            b.service_id, b.visit_date, b.visit_time, b.status, b.amount_paid
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=shivamogga_seva_bookings.csv"}
    )
