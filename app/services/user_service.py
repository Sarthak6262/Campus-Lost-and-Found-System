"""
User service — profile management business logic.
"""
import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdateRequest

logger = logging.getLogger(__name__)


class UserService:
    """Business logic for user profile endpoints."""

    def __init__(self, db: Session) -> None:
        self.user_repo = UserRepository(db)

    def get_profile(self, user: User) -> User:
        """Return the current user's profile."""
        return user

    def update_profile(self, user: User, request: UserUpdateRequest) -> User:
        """Update the current user's profile fields."""
        updates = request.model_dump(exclude_none=True)
        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields provided for update",
            )
        updated_user = self.user_repo.update(user, **updates)
        logger.info("User profile updated: id=%d", user.id)
        return updated_user

    def delete_account(self, user: User) -> None:
        """Delete the current user's account."""
        self.user_repo.delete(user)
        logger.info("User account deleted: id=%d", user.id)
