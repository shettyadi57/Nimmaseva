from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.models import Booking, QueueState, Office, AuditLog

def update_queue_action(
    db: Session,
    office_id: int,
    action: str,
    counter_number: int = 1,
    target_token: str = None,
    transfer_office_id: int = None,
    user_name: str = "Admin Operator"
) -> dict:
    """Executes queue management action and updates queue state."""
    
    queue_state = db.query(QueueState).filter(QueueState.office_id == office_id).first()
    if not queue_state:
        queue_state = QueueState(office_id=office_id, current_token="None", next_token="None", is_paused=False)
        db.add(queue_state)
        db.commit()
        db.refresh(queue_state)

    today_str = datetime.now().strftime("%Y-%m-%d")

    # Fetch pending/in-progress bookings ordered by priority & token
    pending_bookings = db.query(Booking).filter(
        Booking.office_id == office_id,
        Booking.visit_date == today_str,
        Booking.status.in_(["Pending", "Skipped"])
    ).order_by(
        Booking.is_priority.desc(),
        Booking.id.asc()
    ).all()

    if action == "pause":
        queue_state.is_paused = True
    elif action == "resume":
        queue_state.is_paused = False

    elif action == "call_next":
        if pending_bookings:
            next_booking = pending_bookings[0]
            next_booking.status = "Called"
            next_booking.counter_number = counter_number
            queue_state.current_token = next_booking.token_number
            
            # Next token preview
            if len(pending_bookings) > 1:
                queue_state.next_token = pending_bookings[1].token_number
            else:
                queue_state.next_token = "None"
        else:
            queue_state.current_token = "None"
            queue_state.next_token = "None"

    elif action == "complete":
        # Find currently called or target token
        target_str = target_token or queue_state.current_token
        booking = db.query(Booking).filter(
            Booking.office_id == office_id,
            Booking.token_number == target_str,
            Booking.visit_date == today_str
        ).first()
        if booking:
            booking.status = "Completed"
        
        # Auto-advance queue
        if pending_bookings:
            queue_state.current_token = pending_bookings[0].token_number
            if len(pending_bookings) > 1:
                queue_state.next_token = pending_bookings[1].token_number
            else:
                queue_state.next_token = "None"
        else:
            queue_state.current_token = "None"
            queue_state.next_token = "None"

    elif action == "skip":
        target_str = target_token or queue_state.current_token
        booking = db.query(Booking).filter(
            Booking.office_id == office_id,
            Booking.token_number == target_str,
            Booking.visit_date == today_str
        ).first()
        if booking:
            booking.status = "Skipped"
        
        if pending_bookings:
            queue_state.current_token = pending_bookings[0].token_number

    elif action == "recall":
        target_str = target_token or queue_state.current_token
        booking = db.query(Booking).filter(
            Booking.office_id == office_id,
            Booking.token_number == target_str,
            Booking.visit_date == today_str
        ).first()
        if booking:
            booking.status = "Called"
            booking.counter_number = counter_number
            queue_state.current_token = booking.token_number

    elif action == "cancel":
        target_str = target_token or queue_state.current_token
        booking = db.query(Booking).filter(
            Booking.office_id == office_id,
            Booking.token_number == target_str,
            Booking.visit_date == today_str
        ).first()
        if booking:
            booking.status = "Cancelled"

    elif action == "transfer":
        if transfer_office_id and target_token:
            booking = db.query(Booking).filter(
                Booking.office_id == office_id,
                Booking.token_number == target_token,
                Booking.visit_date == today_str
            ).first()
            if booking:
                booking.office_id = transfer_office_id
                booking.status = "Transferred"

    queue_state.updated_at = datetime.now(timezone.utc)
    
    # Audit log entry
    log = AuditLog(
        user_name=user_name,
        action=f"QUEUE_{action.upper()}",
        details=f"Office: {office_id}, Counter: {counter_number}, Token: {target_token or queue_state.current_token}"
    )
    db.add(log)
    db.commit()
    db.refresh(queue_state)

    total_waiting = db.query(Booking).filter(
        Booking.office_id == office_id,
        Booking.visit_date == today_str,
        Booking.status.in_(["Pending", "Skipped", "Called"])
    ).count()

    total_completed = db.query(Booking).filter(
        Booking.office_id == office_id,
        Booking.visit_date == today_str,
        Booking.status == "Completed"
    ).count()

    return {
        "office_id": office_id,
        "current_token": queue_state.current_token,
        "next_token": queue_state.next_token,
        "active_counters": queue_state.active_counters,
        "is_paused": queue_state.is_paused,
        "total_waiting": total_waiting,
        "total_completed_today": total_completed,
        "updated_at": queue_state.updated_at
    }
