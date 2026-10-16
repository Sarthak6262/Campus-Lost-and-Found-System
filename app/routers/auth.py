"""
Authentication router — register, login, and current user endpoints.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.common import APIResponse, success_response
from app.schemas.user import UserRegisterRequest, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student account",
    description="Create a new STUDENT account. Registration always creates a student role.",
)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new student."""
    service = AuthService(db)
    user = service.register(request)
    return success_response("Registration successful", UserResponse.model_validate(user))


@router.post(
    "/login",
    response_model=APIResponse[TokenResponse],
    summary="Login and receive a JWT token",
    description="Authenticate with email and password. Returns a Bearer JWT token.",
)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login and receive a JWT token."""
    service = AuthService(db)
    token = service.login(request)
    return success_response("Login successful", token)


@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Get current authenticated user",
    description="Returns the profile of the currently authenticated user.",
)
def get_me(current_user=Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return success_response("User profile retrieved", UserResponse.model_validate(current_user))
