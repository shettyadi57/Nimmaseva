from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.models.models import Booking, QueueState, Office, AuditLog
from app.schemas.schemas import QueueUpdate, QueueStateOut
from app.services.queue_service import update_queue_action
from app.websockets.manager import manager

router = APIRouter(prefix="/queue", tags=["Queue"])

@router.get("/{office_id}", response_model=QueueStateOut)
def get_queue_state(office_id: int, db: Session = Depends(get_db)):
    today_str = datetime.now().strftime("%Y-%m-%d")
    qs = db.query(QueueState).filter(QueueState.office_id == office_id).first()
    
    if not qs:
        qs = QueueState(office_id=office_id, current_token="None", next_token="None", active_counters=3, is_paused=False)
        db.add(qs)
        db.commit()
        db.refresh(qs)

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

    return QueueStateOut(
        office_id=office_id,
        current_token=qs.current_token,
        next_token=qs.next_token,
        active_counters=qs.active_counters,
        is_paused=qs.is_paused,
        total_waiting=total_waiting,
        total_completed_today=total_completed,
        updated_at=qs.updated_at
    )

@router.post("/{office_id}/control", response_model=QueueStateOut)
async def control_queue(
    office_id: int,
    update_in: QueueUpdate,
    db: Session = Depends(get_db)
):
    res_dict = update_queue_action(
        db,
        office_id=office_id,
        action=update_in.action,
        counter_number=update_in.counter_number or 1,
        target_token=update_in.target_token,
        transfer_office_id=update_in.transfer_office_id
    )

    # Audit: log every queue control action
    target_info = f" token={update_in.target_token}" if update_in.target_token else ""
    db.add(AuditLog(
        user_name="Admin Staff",
        action=f"queue_{update_in.action}",
        details=f"Office #{office_id} | action={update_in.action}{target_info} | counter={update_in.counter_number or 1}"
    ))
    db.commit()

    # Broadcast real-time update via WebSocket to all connected clients for this office
    await manager.broadcast_queue_update(office_id, res_dict)

    return QueueStateOut(**res_dict)

@router.websocket("/ws/{office_id}")
async def websocket_queue_endpoint(websocket: WebSocket, office_id: int):
    await manager.connect(websocket, office_id)
    try:
        while True:
            # Keep connection open & listen for client pings
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, office_id)
