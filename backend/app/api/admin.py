from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import csv
import io
from app.core.database import get_db
from app.models.models import Booking, Office, Service, AuditLog
from app.schemas.schemas import BookingOut, AnalyticsSummary, BookingStatusUpdate, WalkinBookingCreate
from app.services.token_service import get_next_token_number

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
    pending_tokens = sum(1 for b in bookings if b.status in ["Pending", "Called", "In Progress"])
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
        most_requested_service="Income & Caste Certificate",
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

@router.patch("/bookings/{booking_id}/status")
def update_booking_status(booking_id: int, update: BookingStatusUpdate, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found")
    
    booking.status = update.status
    if update.counter_number is not None:
        booking.counter_number = update.counter_number

    db.commit()
    db.refresh(booking)

    # Add audit log
    audit = AuditLog(
        user_name="Admin Staff",
        action=f"Updated status for token {booking.token_number} to {update.status}",
        details=f"Counter: {booking.counter_number}"
    )
    db.add(audit)
    db.commit()

    return {"status": "success", "message": f"Token {booking.token_number} status updated to {update.status}"}

@router.post("/bookings/walk-in", response_model=BookingOut)
def create_walkin_booking(data: WalkinBookingCreate, db: Session = Depends(get_db)):
    today_str = datetime.now().strftime("%Y-%m-%d")
    now_str = datetime.now().strftime("%I:%M %p")

    off = db.query(Office).filter(Office.id == data.office_id).first()
    srv = db.query(Service).filter(Service.id == data.service_id).first()
    if not off or not srv:
        raise HTTPException(status_code=404, detail="Office or Service not found")

    token_num = get_next_token_number(
        db,
        office_id=data.office_id,
        visit_date=today_str,
        booking_type="Offline",
        is_priority=data.is_priority,
        priority_reason=data.priority_reason
    )

    b = Booking(
        token_number=token_num,
        verification_code="WALK-IN",
        citizen_name=data.citizen_name,
        phone=data.phone,
        aadhaar="WALK-IN-PASS",
        age=30,
        gender="Male",
        is_priority=data.is_priority,
        priority_reason=data.priority_reason,
        booking_type="Offline",
        office_id=data.office_id,
        service_id=data.service_id,
        booking_date=today_str,
        visit_date=today_str,
        visit_time=now_str,
        status="Pending",
        counter_number=1,
        amount_paid=srv.fee,
        tatkal_probability=99
    )
    db.add(b)
    db.commit()
    db.refresh(b)

    return BookingOut(
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
        office_name=off.name,
        service_name=srv.name,
        people_ahead=0,
        avg_wait_mins=10
    )

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

