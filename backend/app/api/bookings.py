from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Booking, Office, Service
from app.schemas.schemas import BookingCreate, BookingOut
from app.services.token_service import get_next_token_number, get_next_available_visit_date, generate_verification_code
from app.services.prediction_service import calculate_tatkal_probability
from app.services.pdf_service import generate_token_pdf
from app.services.qr_service import generate_qr_code_base64
from app.core.security import verify_fake_aadhaar

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=BookingOut)
def create_booking(booking_in: BookingCreate, db: Session = Depends(get_db)):
    # 1. Validate Aadhaar
    if not verify_fake_aadhaar(booking_in.aadhaar):
        raise HTTPException(status_code=400, detail="Invalid Aadhaar Number. Must be 12 digits.")

    # 2. Check Service Server Status
    service = db.query(Service).filter(Service.id == booking_in.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if not service.is_active or service.server_status in ["Down", "Maintenance"]:
        raise HTTPException(status_code=400, detail=f"Service '{service.name}' is currently {service.server_status}. Bookings temporarily disabled.")

    # 3. Check Office Working Hours & Server Status
    office = db.query(Office).filter(Office.id == booking_in.office_id).first()
    if not office:
        raise HTTPException(status_code=404, detail="Office not found")
    if office.server_status in ["Maintenance", "Unavailable"]:
        raise HTTPException(status_code=400, detail=f"Office '{office.name}' is under maintenance. Bookings closed.")

    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")

    # Working hours rule: After 5 PM, shift to next day
    visit_date_str, visit_slot = get_next_available_visit_date(db, office.id, now)

    # Priority category detection
    is_priority = booking_in.is_priority or (booking_in.age >= 60)
    priority_reason = booking_in.priority_reason
    if booking_in.age >= 60 and not priority_reason:
        priority_reason = "Senior Citizen (60+)"

    # Generate token number
    token_num = get_next_token_number(
        db,
        office_id=office.id,
        visit_date=visit_date_str,
        booking_type=booking_in.booking_type,
        is_priority=is_priority,
        priority_reason=priority_reason
    )

    verify_code = generate_verification_code()

    # Calculate current queue length for Tatkal Prediction
    current_queue_len = db.query(Booking).filter(
        Booking.office_id == office.id,
        Booking.visit_date == visit_date_str,
        Booking.status.in_(["Pending", "Called"])
    ).count()

    tatkal_res = calculate_tatkal_probability(
        current_queue_size=current_queue_len,
        server_status=service.server_status,
        avg_processing_mins=service.avg_processing_time_mins,
        is_priority=is_priority,
        booking_type=booking_in.booking_type,
        time_of_day_hour=now.hour
    )

    # Save to database
    db_booking = Booking(
        token_number=token_num,
        verification_code=verify_code,
        citizen_name=booking_in.citizen_name,
        phone=booking_in.phone,
        aadhaar=booking_in.aadhaar,
        age=booking_in.age,
        gender=booking_in.gender,
        is_priority=is_priority,
        priority_reason=priority_reason,
        booking_type=booking_in.booking_type,
        office_id=office.id,
        service_id=service.id,
        booking_date=today_str,
        visit_date=visit_date_str,
        visit_time=visit_slot,
        amount_paid=service.fee,
        tatkal_probability=tatkal_res["probability"],
        status="Pending"
    )

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    # Prepare response
    people_ahead = db.query(Booking).filter(
        Booking.office_id == office.id,
        Booking.visit_date == visit_date_str,
        Booking.status == "Pending",
        Booking.id < db_booking.id
    ).count()

    return BookingOut(
        id=db_booking.id,
        token_number=db_booking.token_number,
        verification_code=db_booking.verification_code,
        citizen_name=db_booking.citizen_name,
        phone=db_booking.phone,
        aadhaar=db_booking.aadhaar,
        age=db_booking.age,
        gender=db_booking.gender,
        is_priority=db_booking.is_priority,
        priority_reason=db_booking.priority_reason,
        booking_type=db_booking.booking_type,
        office_id=db_booking.office_id,
        service_id=db_booking.service_id,
        booking_date=db_booking.booking_date,
        visit_date=db_booking.visit_date,
        visit_time=db_booking.visit_time,
        status=db_booking.status,
        counter_number=db_booking.counter_number,
        amount_paid=db_booking.amount_paid,
        tatkal_probability=db_booking.tatkal_probability,
        created_at=db_booking.created_at,
        office_name=office.name,
        service_name=service.name,
        people_ahead=people_ahead,
        avg_wait_mins=people_ahead * service.avg_processing_time_mins
    )

@router.get("/token/{token_number}", response_model=BookingOut)
def get_booking_by_token(token_number: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.token_number == token_number).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Token not found")
    
    office = db.query(Office).filter(Office.id == booking.office_id).first()
    service = db.query(Service).filter(Service.id == booking.service_id).first()

    today_str = datetime.now().strftime("%Y-%m-%d")
    people_ahead = db.query(Booking).filter(
        Booking.office_id == booking.office_id,
        Booking.visit_date == today_str,
        Booking.status == "Pending",
        Booking.id < booking.id
    ).count()

    return BookingOut(
        id=booking.id,
        token_number=booking.token_number,
        verification_code=booking.verification_code,
        citizen_name=booking.citizen_name,
        phone=booking.phone,
        aadhaar=booking.aadhaar,
        age=booking.age,
        gender=booking.gender,
        is_priority=booking.is_priority,
        priority_reason=booking.priority_reason,
        booking_type=booking.booking_type,
        office_id=booking.office_id,
        service_id=booking.service_id,
        booking_date=booking.booking_date,
        visit_date=booking.visit_date,
        visit_time=booking.visit_time,
        status=booking.status,
        counter_number=booking.counter_number,
        amount_paid=booking.amount_paid,
        tatkal_probability=booking.tatkal_probability,
        created_at=booking.created_at,
        office_name=office.name if office else "",
        service_name=service.name if service else "",
        people_ahead=people_ahead,
        avg_wait_mins=people_ahead * (service.avg_processing_time_mins if service else 15)
    )

@router.get("/pdf/{token_number}")
def download_token_pdf(token_number: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.token_number == token_number).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Token not found")

    office = db.query(Office).filter(Office.id == booking.office_id).first()
    service = db.query(Service).filter(Service.id == booking.service_id).first()

    booking_dict = {
        "token_number": booking.token_number,
        "verification_code": booking.verification_code,
        "citizen_name": booking.citizen_name,
        "phone": booking.phone,
        "aadhaar": booking.aadhaar,
        "office_name": office.name if office else "GramOne Shivamogga",
        "service_name": service.name if service else "Government Service",
        "visit_date": booking.visit_date,
        "visit_time": booking.visit_time,
        "priority_reason": booking.priority_reason,
        "amount_paid": booking.amount_paid,
        "tatkal_probability": booking.tatkal_probability
    }

    pdf_bytes = generate_token_pdf(booking_dict)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Token_{token_number}.pdf"}
    )
