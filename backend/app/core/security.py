from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
from jose import jwt
import secrets
import bcrypt
from app.core.config import settings


def get_password_hash(password: str) -> str:
    """
    Bcrypt password hashing — each call generates a unique random salt automatically.
    S3 fix: replaces the old static-salt PBKDF2 implementation.
    """
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Constant-time bcrypt verification."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[str]:
    """Decode JWT and return the subject (email/phone). Returns None on any failure."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except Exception:
        return None


def generate_otp() -> str:
    """Cryptographically secure 6-digit OTP."""
    return str(secrets.randbelow(900000) + 100000)


def verify_aadhaar(aadhaar_number: str) -> bool:
    """Validate 12-digit Aadhaar format."""
    cleaned = aadhaar_number.replace(" ", "").replace("-", "")
    return len(cleaned) == 12 and cleaned.isdigit()

