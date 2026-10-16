"""
FastAPI dependency injection functions for authentication and authorization.
"""
import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.database import get_db
from app.models.user import User, UserRole

from typing import Optional

logger = logging.getLogger(__name__)

# Bearer token extractor
bearer_scheme = HTTPBearer()
optional_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Extract current user if a valid token is provided; returns None otherwise.
    Does not raise 401 when unauthenticated.
    """
    if not credentials:
        return None

    payload = decode_access_token(credentials.credentials)
    if not payload:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
    except (ValueError, TypeError):
        return None

    if not user or not user.is_active:
        return None

    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extract and validate the current user from the JWT Bearer token.

    Raises:
        401 if token is missing, invalid, or expired.
        401 if the user no longer exists in the database.
        403 if the user account is inactive.
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        logger.warning("Invalid or expired JWT token presented")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Require that the current user is an ADMIN.

    Raises:
        403 if the user is not an admin.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user


def get_current_active_student(current_user: User = Depends(get_current_user)) -> User:
    """
    Return the current user (works for both students and admins).
    The check for active status is already done in get_current_user.
    """
    return current_user
