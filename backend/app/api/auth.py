from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, verify_fake_aadhaar
from app.models.models import User
from app.schemas.schemas import Token, LoginRequest, OTPRequest, OTPVerifyRequest

router = APIRouter(prefix="/auth", tags=["Auth"])

# In-memory store for mock OTPs
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

@router.post("/send-otp")
def send_otp(req: OTPRequest):
    if req.aadhaar and not verify_fake_aadhaar(req.aadhaar):
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number (must be 12 digits)")

    otp = str(random.randint(100000, 999999))
    otp_store[req.phone] = otp
    
    return {
        "message": "OTP sent successfully to registered mobile number",
        "mock_otp": otp,  # Exposed for demo ease
        "aadhaar_status": "Verified" if req.aadhaar else "Pending"
    }

@router.post("/verify-otp")
def verify_otp(req: OTPVerifyRequest):
    if not verify_fake_aadhaar(req.aadhaar):
        raise HTTPException(status_code=400, detail="Aadhaar verification failed. Must be 12 numeric digits.")

    saved_otp = otp_store.get(req.phone)
    # Accept either stored OTP or demo magic OTP "123456"
    if req.otp != saved_otp and req.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP entered")

    return {
        "status": "success",
        "message": "Aadhaar Verified & Mobile Authenticated",
        "aadhaar_verified": True
    }
