import math
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Booking, Service, QueueState

def calculate_tatkal_probability(
    current_queue_size: int,
    server_status: str,
    avg_processing_mins: int,
    is_priority: bool,
    booking_type: str,
    time_of_day_hour: int = 10
) -> dict:
    """
    AI-inspired Tatkal prediction engine.
    Calculates probability (0-100%) of service completion today.
    """
    base_probability = 95.0

    # 1. Server Status Impact
    if server_status == "Down":
        return {"probability": 5, "level": "Low", "reason": "Server is currently DOWN"}
    elif server_status == "Maintenance":
        return {"probability": 25, "level": "Low", "reason": "Server undergoing maintenance"}
    elif server_status == "Busy":
        base_probability -= 15.0

    # 2. Queue Size Impact
    if current_queue_size > 40:
        base_probability -= 35.0
    elif current_queue_size > 25:
        base_probability -= 20.0
    elif current_queue_size > 10:
        base_probability -= 10.0

    # 3. Processing Complexity Impact
    if avg_processing_mins > 30:
        base_probability -= 15.0
    elif avg_processing_mins > 20:
        base_probability -= 8.0

    # 4. Priority Boost
    if is_priority:
        base_probability += 15.0

    # 5. Time of Day Impact (close to 5 PM decreases prob)
    if time_of_day_hour >= 15:  # After 3 PM
        base_probability -= 20.0
    elif time_of_day_hour >= 13: # After 1 PM
        base_probability -= 10.0

    prob = max(10, min(99, int(base_probability)))

    if prob >= 85:
        level = "Very High"
    elif prob >= 65:
        level = "High"
    elif prob >= 45:
        level = "Medium"
    else:
        level = "Low"

    return {
        "probability": prob,
        "level": level,
        "reason": f"Queue length ({current_queue_size}), Server ({server_status}), Priority ({is_priority})"
    }

def calculate_booking_timings(
    db: Session,
    office_id: int,
    service_id: int,
    booking_id: Optional[int] = None,
    is_priority: bool = False,
    status: str = "Pending",
    reference_dt: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Predicts:
    1. Wait time before citizen's coupon is called to counter
    2. Expected time required to complete citizen's own service work
    3. Total estimated completion clock time
    4. Minutes saved thanks to dynamic counter allocation
    """
    now = reference_dt or datetime.now()
    today_str = now.strftime("%Y-%m-%d")

    # Fetch service details
    service = db.query(Service).filter(Service.id == service_id).first()
    service_proc_mins = service.avg_processing_time_mins if service and service.avg_processing_time_mins else 15

    # Check dynamic counters allocated to this service
    queue_state = db.query(QueueState).filter(QueueState.office_id == office_id).first()
    active_counters_for_service = 1
    if queue_state and queue_state.counter_allocations:
        matched = 0
        for c in queue_state.counter_allocations:
            if c.get("status", "Active") == "Active":
                assigned = c.get("assigned_service_ids", [])
                mode = c.get("mode", "")
                if service_id in assigned or mode in ["Dynamic Auto-Balance", "Universal"]:
                    matched += 1
        if matched > 0:
            active_counters_for_service = matched
    elif queue_state and queue_state.active_counters:
        active_counters_for_service = max(1, queue_state.active_counters // 2 or 1)

    # Calculate people ahead
    if status in ["Completed", "Cancelled"]:
        people_ahead = 0
        est_wait_mins = 0
        est_call_time = "Completed"
        total_duration = service_proc_mins
        est_completion_time = "Completed"
        time_saved = 0
    elif status in ["Called", "In Progress", "Approaching Counter"]:
        people_ahead = 0
        est_wait_mins = 0
        est_call_time = "Now at Counter"
        # Citizen is currently at the counter having their work done
        remaining_work_mins = max(3, service_proc_mins // 2)
        total_duration = remaining_work_mins
        comp_dt = now + timedelta(minutes=remaining_work_mins)
        est_completion_time = comp_dt.strftime("%I:%M %p")
        time_saved = 0
    else:
        # Pending queue calculation
        query = db.query(Booking).filter(
            Booking.office_id == office_id,
            Booking.visit_date == today_str,
            Booking.status.in_(["Pending", "Skipped"])
        )
        if booking_id:
            query = query.filter(Booking.id < booking_id)
        
        people_ahead = query.count()

        # Dynamic multi-counter queue formula:
        # Wait = ceil(people_ahead / active_counters_for_service) * service_proc_mins
        raw_single_wait = people_ahead * service_proc_mins
        if active_counters_for_service > 1:
            eff_wait = math.ceil(people_ahead / active_counters_for_service) * service_proc_mins
        else:
            eff_wait = raw_single_wait

        if is_priority:
            eff_wait = math.ceil(eff_wait * 0.5)

        est_wait_mins = max(2, eff_wait) if people_ahead > 0 else 2
        time_saved = max(0, raw_single_wait - est_wait_mins) if active_counters_for_service > 1 else 0

        call_dt = now + timedelta(minutes=est_wait_mins)
        est_call_time = call_dt.strftime("%I:%M %p")

        total_duration = est_wait_mins + service_proc_mins
        completion_dt = now + timedelta(minutes=total_duration)
        est_completion_time = completion_dt.strftime("%I:%M %p")

    return {
        "people_ahead": people_ahead,
        "estimated_wait_mins": est_wait_mins,
        "estimated_call_time": est_call_time,
        "service_processing_mins": service_proc_mins,
        "total_estimated_duration_mins": total_duration,
        "estimated_completion_time": est_completion_time,
        "time_saved_by_dynamic_allocation_mins": time_saved,
        "active_counters_for_service": active_counters_for_service
    }
