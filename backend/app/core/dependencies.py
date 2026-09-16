"""
dependencies.py — Reusable FastAPI security dependencies.

Usage:
    from app.core.dependencies import get_current_user, require_admin

    @router.get("/protected")
    def endpoint(current_user: User = Depends(require_admin)):
        ...
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Validates the Bearer JWT from the Authorization header.
    Raises 401 if the token is missing, expired, or invalid.
    """
    token = credentials.credentials
    subject = decode_access_token(token)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(
        (User.email == subject) | (User.phone == subject)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Extends get_current_user by additionally enforcing that the caller
    has the 'admin' or 'operator' role.
    Raises 403 if the authenticated user is a plain citizen.
    """
    if current_user.role not in ("admin", "operator"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin or operator role required.",
        )
    return current_user
