from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import (
    DynamicCounterMatrixOut,
    CounterAllocationUpdate,
    AutoBalanceResponse
)
from app.services.counter_allocation_service import (
    get_dynamic_counter_matrix,
    update_counter_allocation,
    auto_balance_counters
)

router = APIRouter(prefix="/counters", tags=["Dynamic Counters"])

@router.get("/{office_id}", response_model=DynamicCounterMatrixOut)
def get_office_counters(office_id: int, db: Session = Depends(get_db)):
    """
    Get live dynamic counter allocation matrix, queue congestion by service,
    and AI auto-balancing recommendations.
    """
    return get_dynamic_counter_matrix(db, office_id)

@router.post("/{office_id}/allocate", response_model=DynamicCounterMatrixOut)
def allocate_counter(
    office_id: int,
    payload: CounterAllocationUpdate,
    db: Session = Depends(get_db)
):
    """
    Manually update a counter's assigned services, operational mode, or status.
    """
    return update_counter_allocation(
        db=db,
        office_id=office_id,
        counter_number=payload.counter_number,
        data=payload.model_dump(exclude_unset=True),
        user_name="Admin Operator"
    )

@router.post("/{office_id}/auto-balance", response_model=AutoBalanceResponse)
def trigger_auto_balance(office_id: int, db: Session = Depends(get_db)):
    """
    One-click AI Dynamic Auto-Balancing:
    Detects heavy congestion or single-service bottlenecks and dynamically
    reallocates available counters to clear backlogs and prevent long citizen waits.
    """
    return auto_balance_counters(db, office_id, user_name="Admin Dynamic Allocator")
