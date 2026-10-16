"""
Authentication service — registration and login logic.
"""
import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserRegisterRequest

logger = logging.getLogger(__name__)


class AuthService:
    """Business logic for authentication endpoints."""

    def __init__(self, db: Session) -> None:
        self.user_repo = UserRepository(db)

    def register(self, request: UserRegisterRequest) -> User:
        """
        Register a new student account.
        - Validates uniqueness of email and student_id.
        - Hashes the password before storing.
        - Always creates a STUDENT role (never ADMIN via registration).
        """
        # Check for duplicate email
        if self.user_repo.get_by_email(request.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        # Check for duplicate student ID
        if self.user_repo.get_by_student_id(request.student_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this student ID already exists",
            )

        hashed = hash_password(request.password)

        user = self.user_repo.create(
            student_id=request.student_id,
            name=request.name,
            email=request.email,
            phone=request.phone,
            password_hash=hashed,
            department=request.department,
            role=UserRole.STUDENT,  # Registration always creates STUDENT
        )

        logger.info("New student registered: %s (id=%d)", user.email, user.id)
        return user

    def login(self, request: LoginRequest) -> TokenResponse:
        """
        Authenticate a user and return a JWT access token.
        - Logs failed attempts without exposing whether email or password was wrong.
        """
        user = self.user_repo.get_by_email(request.email)

        if not user or not verify_password(request.password, user.password_hash):
            logger.warning("Failed login attempt for email: %s", request.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact support.",
            )

        token = create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role.value,
        )

        logger.info("User logged in: %s (id=%d)", user.email, user.id)
        return TokenResponse(access_token=token, token_type="bearer")
