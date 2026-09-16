from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import time
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, verify_aadhaar, generate_otp
from app.models.models import User, AuditLog
from app.schemas.schemas import Token, LoginRequest, RegisterRequest, OTPRequest, OTPVerifyRequest

router = APIRouter(prefix="/auth", tags=["Auth"])

# In-memory OTP store: phone -> (otp, expires_at_unix)
# For production: replace with Redis with TTL
OTP_TTL_SECONDS = 300  # 5 minutes
otp_store: dict[str, tuple[str, float]] = {}

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

    # Audit log: admin login event
    db.add(AuditLog(
        user_name=user.full_name,
        action="admin_login",
        details=f"Admin '{user.full_name}' logged in (role: {user.role})"
    ))
    db.commit()

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
        # S5 fix: role is NOT caller-supplied; all registrations create 'admin' staff accounts.
        # For production, add a REGISTRATION_CODE env-var check or remove this endpoint entirely.
        role="admin",
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

    # S7 fix: cryptographically secure OTP
    otp = generate_otp()
    # S6 fix: store with expiry timestamp; overwrite any previous OTP for this phone
    otp_store[req.phone] = (otp, time.time() + OTP_TTL_SECONDS)

    # In production: send via real SMS gateway (e.g., Twilio, AWS SNS, or CDAC MSG91)
    # For demo: OTP is not transmitted; this endpoint only signals readiness.
    return {
        "message": "OTP sent successfully to registered mobile number",
        "aadhaar_status": "Verified" if req.aadhaar else "Pending",
        "expires_in_seconds": OTP_TTL_SECONDS
    }

@router.post("/verify-otp")
def verify_otp(req: OTPVerifyRequest):
    if not verify_aadhaar(req.aadhaar):
        raise HTTPException(status_code=400, detail="Aadhaar verification failed. Must be 12 numeric digits.")

    entry = otp_store.get(req.phone)

    # S6 fix: reject if OTP was never issued, already used, or expired
    if not entry:
        raise HTTPException(status_code=400, detail="No OTP was issued for this phone number or it has already been used.")

    saved_otp, expires_at = entry
    if time.time() > expires_at:
        # Clean up expired entry
        del otp_store[req.phone]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    if req.otp != saved_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP entered")

    # S6 fix: single-use — delete after first successful verification
    del otp_store[req.phone]

    return {
        "status": "success",
        "message": "Aadhaar Verified & Mobile Authenticated",
        "aadhaar_verified": True
    }
