from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
from jose import jwt
import secrets
from passlib.context import CryptContext
from app.core.config import settings

# Bcrypt context — generates a unique salt per hash automatically
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Bcrypt password hashing with per-password random salt (via passlib)."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify bcrypt hash; also transparently upgrades legacy PBKDF2 hashes."""
    return pwd_context.verify(plain_password, hashed_password)

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
