import secrets
from datetime import datetime, timedelta, time
from sqlalchemy.orm import Session
from app.models.models import Booking, Office, Service
import random

TIME_SLOTS = [
    "09:00 AM", "09:20 AM", "09:40 AM",
    "10:00 AM", "10:20 AM", "10:40 AM",
    "11:00 AM", "11:20 AM", "11:40 AM",
    "01:00 PM", "01:20 PM", "01:40 PM",
    "02:00 PM", "02:20 PM", "02:40 PM",
    "03:00 PM", "03:20 PM", "03:40 PM",
    "04:00 PM", "04:20 PM", "04:40 PM"
]

def generate_verification_code() -> str:
    """Generates a 6-digit numeric verification code."""
    return f"{random.randint(100000, 999999)}"

def parse_range(range_str: str) -> list[int]:
    """Parses range string like '1-10,41-50' into a list of integers."""
    result = []
    if not range_str:
        return result
    parts = range_str.split(",")
    for p in parts:
        if "-" in p:
            start, end = p.split("-")
            result.extend(range(int(start), int(end) + 1))
        else:
            if p.strip().isdigit():
                result.append(int(p.strip()))
    return result

def get_next_token_number(
    db: Session,
    office_id: int,
    visit_date: str,
    booking_type: str = "Online",
    is_priority: bool = False,
    priority_reason: str = None
) -> str:
    """
    Hybrid token allocation engine based on configured ranges.
    Offline: 1-10, 41-50
    Online: 11-40, 51-80
    Priority: 81-90
    Emergency: 91-100
    """
    office = db.query(Office).filter(Office.id == office_id).first()
    prefix = "GO" if office and office.type == "GramOne" else "SS"

    existing_bookings = db.query(Booking).filter(
        Booking.office_id == office_id,
        Booking.visit_date == visit_date
    ).all()
    
    used_numbers = set()
    for b in existing_bookings:
        # Extract number from format GO-015 or SS-082
        try:
            num = int(b.token_number.split("-")[1])
            used_numbers.add(num)
        except Exception:
            pass

    # Determine allowed pool based on type
    if priority_reason == "Emergency":
        allowed_nums = parse_range(office.emergency_range if office else "91-100")
    elif is_priority or (priority_reason and priority_reason != "None"):
        allowed_nums = parse_range(office.priority_range if office else "81-90")
    elif booking_type == "Offline":
        allowed_nums = parse_range(office.offline_start_range if office else "1-10,41-50")
    else:  # Online
        allowed_nums = parse_range(office.online_start_range if office else "11-40,51-80")

    # Find first unused number in assigned range
    assigned_num = None
    for num in allowed_nums:
        if num not in used_numbers:
            assigned_num = num
            break

    # Fallback to any unused integer up to max daily tokens if pool exhausted
    if not assigned_num:
        max_tokens = office.max_daily_tokens if office else 100
        for num in range(1, max_tokens + 1):
            if num not in used_numbers:
                assigned_num = num
                break

    if not assigned_num:
        assigned_num = len(existing_bookings) + 1

    return f"{prefix}-{assigned_num:03d}"

def allocate_earliest_slot(
    db: Session,
    office_id: int,
    visit_date: str
) -> str:
    """Finds earliest available time slot for the office on visit_date."""
    # Count bookings per slot
    existing = db.query(Booking).filter(
        Booking.office_id == office_id,
        Booking.visit_date == visit_date,
        Booking.status != "Cancelled"
    ).all()

    slot_counts = {}
    for b in existing:
        slot_counts[b.visit_time] = slot_counts.get(b.visit_time, 0) + 1

    # MAX capacity per 20-min slot = 3 citizens
    for slot in TIME_SLOTS:
        if slot_counts.get(slot, 0) < 3:
            return slot

    # Default to last slot if all soft limits reached
    return TIME_SLOTS[-1]

def get_next_available_visit_date(
    db: Session,
    office_id: int,
    start_date: datetime
) -> tuple[str, str]:
    """
    Checks if office is open and today has capacity.
    If 5 PM passed or capacity full, shifts to next day.
    """
    curr = start_date
    
    # Check if current time is after 5 PM
    if curr.hour >= 17:
        curr = curr + timedelta(days=1)

    visit_date_str = curr.strftime("%Y-%m-%d")
    
    office = db.query(Office).filter(Office.id == office_id).first()
    max_tokens = office.max_daily_tokens if office else 100

    existing_count = db.query(Booking).filter(
        Booking.office_id == office_id,
        Booking.visit_date == visit_date_str,
        Booking.status != "Cancelled"
    ).count()

    if existing_count >= max_tokens:
        # Move to next day
        curr = curr + timedelta(days=1)
        visit_date_str = curr.strftime("%Y-%m-%d")

    slot = allocate_earliest_slot(db, office_id, visit_date_str)
    return visit_date_str, slot
