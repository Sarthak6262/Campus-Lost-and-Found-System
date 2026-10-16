"""
Users router — current user profile management endpoints.
"""
from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.claim import ClaimResponse
from app.schemas.common import APIResponse, success_response
from app.schemas.item import ItemResponse
from app.schemas.user import UserResponse, UserUpdateRequest
from app.services.item_service import ItemService
from app.services.user_service import UserService
from app.repositories.claim_repository import ClaimRepository

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Get my profile",
    description="Returns the full profile of the currently authenticated user.",
)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return success_response("Profile retrieved", UserResponse.model_validate(current_user))


@router.put(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Update my profile",
    description="Update name, phone, or department. Email and student ID cannot be changed.",
)
def update_my_profile(
    request: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current user's profile."""
    service = UserService(db)
    updated = service.update_profile(current_user, request)
    return success_response("Profile updated successfully", UserResponse.model_validate(updated))


@router.delete(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Delete my account",
    description="Permanently deletes the currently authenticated user's account.",
)
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete current user's account."""
    service = UserService(db)
    service.delete_account(current_user)
    return success_response("Account deleted successfully")


@router.get(
    "/me/items",
    response_model=APIResponse[List[ItemResponse]],
    summary="Get my item reports",
    description="Returns all items (lost and found) reported by the current user.",
)
def get_my_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all items reported by the current user."""
    service = ItemService(db)
    items = service.get_user_items(current_user.id)
    data = [ItemResponse.model_validate(item) for item in items]
    return success_response("Items retrieved", data)


@router.get(
    "/me/claims",
    response_model=APIResponse[List[ClaimResponse]],
    summary="Get my claims",
    description="Returns all claims submitted by the current user.",
)
def get_my_claims(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all claims submitted by the current user."""
    repo = ClaimRepository(db)
    claims = repo.get_by_user(current_user.id)
    data = [ClaimResponse.model_validate(c) for c in claims]
    return success_response("Claims retrieved", data)
