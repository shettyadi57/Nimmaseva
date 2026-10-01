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
        # 0. Check if a specific target token was requested
        candidate = None
        if target_token:
            candidate = db.query(Booking).filter(
                Booking.office_id == office_id,
                Booking.token_number == target_token,
                Booking.visit_date == today_str
            ).first()

        if not candidate:
            from app.services.counter_allocation_service import get_or_init_counter_allocations
            allocations = get_or_init_counter_allocations(db, office_id)
            current_counter_conf = next((c for c in allocations if c.get("counter_number") == counter_number), None)
            assigned_services = current_counter_conf.get("assigned_service_ids", []) if current_counter_conf else []
            is_overflow = current_counter_conf.get("is_overflow", False) if current_counter_conf else False

            # 1. First priority: Pending booking explicitly assigned to this counter
            for b in pending_bookings:
                if b.counter_number == counter_number:
                    candidate = b
                    break

            # 2. Second priority: If counter has specific assigned services, pick next booking matching those services
            if not candidate and assigned_services and not is_overflow:
                for b in pending_bookings:
                    if b.service_id in assigned_services:
                        candidate = b
                        break

            # 3. Third priority: If overflow counter, or if no service-specific bookings remain, take highest priority/first pending
            if not candidate and pending_bookings:
                candidate = pending_bookings[0]

        if candidate:
            next_booking = candidate
            next_booking.status = "Called"
            next_booking.counter_number = counter_number
            queue_state.current_token = next_booking.token_number
            
            # Next token preview (find next candidate in pending)
            remaining_pending = [b for b in pending_bookings if b.id != candidate.id]
            if remaining_pending:
                queue_state.next_token = remaining_pending[0].token_number
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
