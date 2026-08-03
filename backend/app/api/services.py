from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Service
from app.schemas.schemas import ServiceOut, ServiceCreate

router = APIRouter(prefix="/services", tags=["Services"])

@router.get("", response_model=List[ServiceOut])
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).all()

@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.post("", response_model=ServiceOut)
def create_service(service_in: ServiceCreate, db: Session = Depends(get_db)):
    db_service = Service(**service_in.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@router.put("/{service_id}", response_model=ServiceOut)
def update_service(service_id: int, service_in: ServiceCreate, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    for key, value in service_in.model_dump().items():
        setattr(service, key, value)
    
    db.commit()
    db.refresh(service)
    return service

@router.patch("/{service_id}/status")
def toggle_service_status(service_id: int, server_status: str, is_active: bool = True, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service.server_status = server_status
    service.is_active = is_active
    db.commit()
    return {"message": "Service status updated successfully", "server_status": service.server_status}
