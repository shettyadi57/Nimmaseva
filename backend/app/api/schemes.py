from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Scheme
from app.schemas.schemas import SchemeOut

router = APIRouter(prefix="/schemes", tags=["Schemes"])

@router.get("", response_model=List[SchemeOut])
def search_schemes(
    age: Optional[int] = Query(None),
    gender: Optional[str] = Query("All"),
    income: Optional[float] = Query(None),
    occupation: Optional[str] = Query("All"),
    district: Optional[str] = Query("Shivamogga"),
    db: Session = Depends(get_db)
):
    query = db.query(Scheme)

    if age is not None:
        query = query.filter(Scheme.min_age <= age, Scheme.max_age >= age)

    if gender and gender != "All":
        query = query.filter(Scheme.gender_eligibility.in_([gender, "All"]))

    if income is not None:
        query = query.filter(Scheme.max_income >= income)

    if occupation and occupation != "All":
        query = query.filter(Scheme.target_occupation.in_([occupation, "All"]))

    return query.all()
