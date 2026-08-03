from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from math import radians, cos, sin, asin, sqrt
from datetime import datetime
from app.core.database import get_db
from app.models.models import Office, Booking
from app.schemas.schemas import OfficeOut

router = APIRouter(prefix="/offices", tags=["Offices"])

def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two geo coordinates."""
    R = 6371.0 # Earth radius in kilometers
    dLat = radians(lat2 - lat1)
    dLon = radians(lon2 - lon1)
    lat1 = radians(lat1)
    lat2 = radians(lat2)
    a = sin(dLat / 2)**2 + cos(lat1) * cos(lat2) * sin(dLon / 2)**2
    c = 2 * asin(sqrt(a))
    return R * c

@router.get("", response_model=List[OfficeOut])
def get_offices(
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
    db: Session = Depends(get_db)
):
    offices = db.query(Office).all()
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    result = []
    for off in offices:
        # Count current queue
        queue_count = db.query(Booking).filter(
            Booking.office_id == off.id,
            Booking.visit_date == today_str,
            Booking.status.in_(["Pending", "Called"])
        ).count()

        completed_count = db.query(Booking).filter(
            Booking.office_id == off.id,
            Booking.visit_date == today_str
        ).count()

        remaining = max(0, off.max_daily_tokens - completed_count)

        dist = None
        est_time = None
        if lat is not None and lng is not None:
            dist = round(haversine(lat, lng, off.latitude, off.longitude), 2)
            # Estimate driving time: ~30km/h average city speed
            est_time = int((dist / 30.0) * 60) + 5

        off_dict = OfficeOut(
            id=off.id,
            name=off.name,
            type=off.type,
            address=off.address,
            district=off.district,
            taluk=off.taluk,
            village=off.village,
            latitude=off.latitude,
            longitude=off.longitude,
            phone=off.phone,
            working_hours=off.working_hours,
            lunch_break=off.lunch_break,
            max_daily_tokens=off.max_daily_tokens,
            server_status=off.server_status,
            current_queue_count=queue_count,
            remaining_tokens=remaining,
            distance_km=dist,
            est_travel_time_mins=est_time
        )
        result.append(off_dict)

    if lat is not None and lng is not None:
        result.sort(key=lambda x: x.distance_km if x.distance_km is not None else 999)

    return result

@router.get("/{office_id}", response_model=OfficeOut)
def get_office_detail(office_id: int, db: Session = Depends(get_db)):
    off = db.query(Office).filter(Office.id == office_id).first()
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    queue_count = db.query(Booking).filter(
        Booking.office_id == off.id,
        Booking.visit_date == today_str,
        Booking.status.in_(["Pending", "Called"])
    ).count()

    completed_count = db.query(Booking).filter(
        Booking.office_id == off.id,
        Booking.visit_date == today_str
    ).count()

    remaining = max(0, off.max_daily_tokens - completed_count)

    return OfficeOut(
        id=off.id,
        name=off.name,
        type=off.type,
        address=off.address,
        district=off.district,
        taluk=off.taluk,
        village=off.village,
        latitude=off.latitude,
        longitude=off.longitude,
        phone=off.phone,
        working_hours=off.working_hours,
        lunch_break=off.lunch_break,
        max_daily_tokens=off.max_daily_tokens,
        server_status=off.server_status,
        current_queue_count=queue_count,
        remaining_tokens=remaining
    )
