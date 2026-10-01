from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import time
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, verify_aadhaar, generate_otp
from app.models.models import User, AuditLog
from app.schemas.schemas import (
    Token, LoginRequest, RegisterRequest,
    OTPRequest, OTPVerifyRequest,
    CitizenOTPVerifyRequest, CitizenDirectLoginRequest, CitizenTokenResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

# In-memory OTP store: phone -> (otp, expires_at_unix)
# For production: replace with Redis with TTL
OTP_TTL_SECONDS = 300  # 5 minutes
otp_store: dict[str, tuple[str, float]] = {}


# ─────────────────────────────────────────────────────────────────────────────
# Admin / Staff Login & Registration
# ─────────────────────────────────────────────────────────────────────────────

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


# ─────────────────────────────────────────────────────────────────────────────
# Citizen Phone OTP Authentication
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/send-otp")
def send_otp(req: OTPRequest):
    """
    Send a 6-digit OTP to the citizen's phone number.
    For demo/development: the OTP is returned in the API response ('demo_otp').
    In production: remove 'demo_otp' and send via real SMS gateway (Twilio / MSG91 / CDAC).
    """
    if req.aadhaar and not verify_aadhaar(req.aadhaar):
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number (must be 12 digits)")

    # S7 fix: cryptographically secure OTP
    otp = generate_otp()
    # S6 fix: store with expiry timestamp; overwrite any previous OTP for this phone
    otp_store[req.phone] = (otp, time.time() + OTP_TTL_SECONDS)

    return {
        "message": "OTP sent successfully to registered mobile number",
        "aadhaar_status": "Verified" if req.aadhaar else "Pending",
        "expires_in_seconds": OTP_TTL_SECONDS,
        # DEMO/DEV only — remove this in production and use real SMS delivery
        "demo_otp": otp,
    }


@router.post("/verify-otp")
def verify_otp(req: OTPVerifyRequest):
    """Legacy verify-otp used by Aadhaar flow. Aadhaar is now optional."""
    if req.aadhaar and not verify_aadhaar(req.aadhaar):
        raise HTTPException(status_code=400, detail="Aadhaar verification failed. Must be 12 numeric digits.")

    entry = otp_store.get(req.phone)

    if not entry:
        raise HTTPException(status_code=400, detail="No OTP was issued for this phone number or it has already been used.")

    saved_otp, expires_at = entry
    if time.time() > expires_at:
        del otp_store[req.phone]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    if req.otp != saved_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP entered")

    # S6 fix: single-use
    del otp_store[req.phone]

    return {
        "status": "success",
        "message": "Aadhaar Verified & Mobile Authenticated",
        "aadhaar_verified": True
    }


@router.post("/citizen-verify-otp", response_model=CitizenTokenResponse)
def citizen_verify_otp(req: CitizenOTPVerifyRequest, db: Session = Depends(get_db)):
    """
    Citizen Phone OTP Verification + Automatic Account Creation (Upsert).

    Complete Flow:
      1. Citizen enters phone number → UI calls POST /auth/send-otp.
      2. Backend generates OTP and returns it in demo_otp field.
      3. Citizen enters OTP → UI calls POST /auth/citizen-verify-otp.
      4. Backend validates OTP (single-use, 5-min TTL).
      5. If new phone: INSERT a citizen User record in DB.
         If existing phone: UPDATE profile fields if provided.
      6. Issue a signed JWT access token (sub=phone, role=citizen).
      7. Return {access_token, citizen_id, phone, full_name, is_new_account}.
      8. Frontend stores JWT + profile → auto-fills all booking form fields.
    """
    entry = otp_store.get(req.phone)

    if not entry:
        raise HTTPException(
            status_code=400,
            detail="No OTP was issued for this phone number or it has already been used. Please request a new OTP."
        )

    saved_otp, expires_at = entry
    if time.time() > expires_at:
        del otp_store[req.phone]
        raise HTTPException(
            status_code=400,
            detail="OTP has expired (5-minute window). Please request a new one."
        )

    if req.otp != saved_otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP entered. Please check the code and try again."
        )

    # Single-use OTP — delete immediately after successful verification
    del otp_store[req.phone]

    # ── Upsert citizen account ────────────────────────────────────────────────
    is_new_account = False
    citizen = db.query(User).filter(User.phone == req.phone).first()

    if not citizen:
        is_new_account = True
        citizen = User(
            full_name=req.full_name or f"Citizen_{req.phone[-4:]}",
            phone=req.phone,
            email=None,
            hashed_password=None,   # Citizens authenticate via OTP only
            aadhaar=req.aadhaar,
            age=req.age,
            gender=req.gender or "Not Specified",
            role="citizen",
        )
        db.add(citizen)
        db.flush()  # Flush to get citizen.id before audit log
    else:
        # Returning citizen — update profile if provided
        if req.full_name:
            citizen.full_name = req.full_name
        if req.age is not None:
            citizen.age = req.age
        if req.gender:
            citizen.gender = req.gender
        if req.aadhaar:
            citizen.aadhaar = req.aadhaar

    db.commit()
    db.refresh(citizen)

    access_token = create_access_token(subject=citizen.phone)

    db.add(AuditLog(
        user_name=citizen.full_name,
        action="citizen_signup" if is_new_account else "citizen_login",
        details=(
            f"Citizen '{citizen.full_name}' "
            f"({'new account created' if is_new_account else 'returning citizen'}) "
            f"authenticated via Phone OTP | Phone: {req.phone}"
        )
    ))
    db.commit()

    return CitizenTokenResponse(
        access_token=access_token,
        token_type="bearer",
        is_new_account=is_new_account,
        citizen_id=citizen.id,
        phone=citizen.phone,
        full_name=citizen.full_name,
        role=citizen.role,
    )


@router.post("/citizen-direct-login", response_model=CitizenTokenResponse)
def citizen_direct_login(req: CitizenDirectLoginRequest, db: Session = Depends(get_db)):
    """
    Direct Citizen Registration and Login without OTP verification.
    Citizens enter their phone number and profile info to register or log in directly.
    """
    is_new_account = False
    citizen = db.query(User).filter(User.phone == req.phone).first()

    if not citizen:
        is_new_account = True
        citizen = User(
            full_name=req.full_name or f"Citizen_{req.phone[-4:]}",
            phone=req.phone,
            email=None,
            hashed_password=None,
            aadhaar=req.aadhaar,
            age=req.age or 30,
            gender=req.gender or "Not Specified",
            role="citizen",
        )
        db.add(citizen)
        db.flush()
    else:
        # Returning citizen — update profile fields if provided
        if req.full_name:
            citizen.full_name = req.full_name
        if req.age is not None:
            citizen.age = req.age
        if req.gender:
            citizen.gender = req.gender
        if req.aadhaar:
            citizen.aadhaar = req.aadhaar

    db.commit()
    db.refresh(citizen)

    access_token = create_access_token(subject=citizen.phone)

    db.add(AuditLog(
        user_name=citizen.full_name,
        action="citizen_direct_signup" if is_new_account else "citizen_direct_login",
        details=(
            f"Citizen '{citizen.full_name}' "
            f"({'new account created' if is_new_account else 'returning citizen'}) "
            f"logged in directly with Phone: {req.phone}"
        )
    ))
    db.commit()

    return CitizenTokenResponse(
        access_token=access_token,
        token_type="bearer",
        is_new_account=is_new_account,
        citizen_id=citizen.id,
        phone=citizen.phone,
        full_name=citizen.full_name,
        role=citizen.role,
    )

