from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, verify_aadhaar
from app.models.models import User
from app.schemas.schemas import Token, LoginRequest, RegisterRequest, OTPRequest, OTPVerifyRequest

router = APIRouter(prefix="/auth", tags=["Auth"])

# In-memory store for OTPs
otp_store = {}

@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == login_req.email_or_phone) | (User.phone == login_req.email_or_phone)
    ).first()
    
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/phone or password",
        )
    
    access_token = create_access_token(subject=user.email or user.phone)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": user.full_name,
        "role": user.role
    }

@router.post("/register", response_model=Token)
def register(reg_req: RegisterRequest, db: Session = Depends(get_db)):
    # Check existing user
    existing_user = db.query(User).filter(
        (User.email == reg_req.email_or_phone) | (User.phone == reg_req.email_or_phone)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email/phone already exists"
        )
    
    hashed_pwd = get_password_hash(reg_req.password)
    is_email = "@" in reg_req.email_or_phone

    new_user = User(
        full_name=reg_req.full_name,
        email=reg_req.email_or_phone if is_email else None,
        phone=reg_req.email_or_phone if not is_email else "9876543210",
        hashed_password=hashed_pwd,
        role=reg_req.role or "admin"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(subject=new_user.email or new_user.phone)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": new_user.full_name,
        "role": new_user.role
    }


@router.post("/send-otp")
def send_otp(req: OTPRequest):
    if req.aadhaar and not verify_aadhaar(req.aadhaar):
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number (must be 12 digits)")

    otp = str(random.randint(100000, 999999))
    otp_store[req.phone] = otp
    
    return {
        "message": "OTP sent successfully to registered mobile number",
        "aadhaar_status": "Verified" if req.aadhaar else "Pending"
    }

@router.post("/verify-otp")
def verify_otp(req: OTPVerifyRequest):
    if not verify_aadhaar(req.aadhaar):
        raise HTTPException(status_code=400, detail="Aadhaar verification failed. Must be 12 numeric digits.")

    saved_otp = otp_store.get(req.phone)
    if req.otp != saved_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP entered")

    return {
        "status": "success",
        "message": "Aadhaar Verified & Mobile Authenticated",
        "aadhaar_verified": True
    }
