"""
Admin service — administrative operations for users, items, claims, and dashboard.
"""
import logging
import math
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.claim import Claim, ClaimStatus
from app.models.item import Item, ItemStatus, ItemType
from app.models.user import User
from app.repositories.claim_repository import ClaimRepository
from app.repositories.item_repository import ItemRepository
from app.repositories.user_repository import UserRepository
from app.schemas.claim import ClaimAdminAction

logger = logging.getLogger(__name__)


class AdminService:
    """Business logic for all admin-facing operations."""

    def __init__(self, db: Session) -> None:
        self.user_repo = UserRepository(db)
        self.item_repo = ItemRepository(db)
        self.claim_repo = ClaimRepository(db)

    # ------------------------------------------------------------------ #
    # Dashboard
    # ------------------------------------------------------------------ #

    def get_dashboard_stats(self) -> dict:
        """Return aggregated statistics for the admin dashboard."""
        return {
            "total_users": self.user_repo.count_all(),
            "total_lost_items": self.item_repo.count_by_type(ItemType.LOST),
            "total_found_items": self.item_repo.count_by_type(ItemType.FOUND),
            "active_items": self.item_repo.count_by_status(ItemStatus.ACTIVE),
            "claimed_items": self.item_repo.count_by_status(ItemStatus.CLAIMED),
            "returned_items": self.item_repo.count_by_status(ItemStatus.RETURNED),
            "pending_claims": self.claim_repo.count_by_status(ClaimStatus.PENDING),
            "approved_claims": self.claim_repo.count_by_status(ClaimStatus.APPROVED),
            "rejected_claims": self.claim_repo.count_by_status(ClaimStatus.REJECTED),
        }

    # ------------------------------------------------------------------ #
    # User Management
    # ------------------------------------------------------------------ #

    def get_all_users(self, page: int = 1, limit: int = 10) -> dict:
        """Return a paginated list of all users."""
        skip = (page - 1) * limit
        users = self.user_repo.get_all(skip=skip, limit=limit)
        total = self.user_repo.count_all()
        pages = math.ceil(total / limit) if total > 0 else 1
        return {"users": users, "page": page, "limit": limit, "total": total, "pages": pages}

    def get_user(self, user_id: int) -> User:
        """Fetch a single user by ID."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {user_id} not found",
            )
        return user

    def update_user_status(self, user_id: int, is_active: bool) -> User:
        """Activate or deactivate a user account."""
        user = self.get_user(user_id)
        updated = self.user_repo.update(user, is_active=is_active)
        action = "activated" if is_active else "deactivated"
        logger.info("Admin %s user id=%d", action, user_id)
        return updated

    def delete_user(self, user_id: int, requesting_admin_id: int) -> None:
        """
        Delete a user account.
        Safeguard: Admins cannot delete their own account.
        """
        if user_id == requesting_admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrators cannot delete their own account",
            )
        user = self.get_user(user_id)
        self.user_repo.delete(user)
        logger.warning("Admin deleted user id=%d", user_id)

    # ------------------------------------------------------------------ #
    # Item Management
    # ------------------------------------------------------------------ #

    def get_all_items(
        self,
        page: int = 1,
        limit: int = 10,
        item_type: Optional[ItemType] = None,
        item_status: Optional[ItemStatus] = None,
    ) -> dict:
        """Return a paginated list of all items."""
        skip = (page - 1) * limit
        items, total = self.item_repo.get_all(
            skip=skip, limit=limit, item_type=item_type, status=item_status
        )
        pages = math.ceil(total / limit) if total > 0 else 1
        return {"items": items, "page": page, "limit": limit, "total": total, "pages": pages}

    def delete_item(self, item_id: int) -> None:
        """Delete any item (admin privilege)."""
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with id {item_id} not found",
            )
        self.item_repo.delete(item)
        logger.warning("Admin deleted item id=%d", item_id)

    def update_item_status(self, item_id: int, new_status: ItemStatus) -> Item:
        """Update the status of any item."""
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with id {item_id} not found",
            )
        updated = self.item_repo.update(item, status=new_status)
        logger.info("Admin updated item id=%d status to %s", item_id, new_status)
        return updated

    # ------------------------------------------------------------------ #
    # Claim Management
    # ------------------------------------------------------------------ #

    def get_all_claims(
        self,
        page: int = 1,
        limit: int = 10,
        status: Optional[ClaimStatus] = None,
    ) -> dict:
        """Return a paginated list of all claims, optionally filtered by status."""
        skip = (page - 1) * limit
        claims, total = self.claim_repo.get_all(skip=skip, limit=limit, status=status)
        pages = math.ceil(total / limit) if total > 0 else 1
        return {"claims": claims, "page": page, "limit": limit, "total": total, "pages": pages}


    def approve_claim(self, claim_id: int, action: ClaimAdminAction) -> Claim:
        """
        Approve a claim.
        - Sets claim status to APPROVED.
        - Sets item status to RETURNED.
        - Rejects all other PENDING claims for the same item.
        """
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim with id {claim_id} not found",
            )

        if claim.status != ClaimStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only PENDING claims can be approved (current: {claim.status})",
            )

        # Approve the claim
        approved = self.claim_repo.update_status(
            claim, ClaimStatus.APPROVED, admin_remark=action.admin_remark
        )

        # Mark item as RETURNED
        item = self.item_repo.get_by_id(claim.item_id)
        if item:
            self.item_repo.update(item, status=ItemStatus.RETURNED)

        # Reject all other pending claims for the same item
        self.claim_repo.reject_all_pending_for_item(
            item_id=claim.item_id, except_claim_id=claim_id
        )

        logger.info("Claim id=%d approved; item id=%d marked RETURNED", claim_id, claim.item_id)
        return approved

    def reject_claim(self, claim_id: int, action: ClaimAdminAction) -> Claim:
        """
        Reject a claim.
        - Sets claim status to REJECTED.
        - Item remains ACTIVE.
        """
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim with id {claim_id} not found",
            )

        if claim.status != ClaimStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only PENDING claims can be rejected (current: {claim.status})",
            )

        rejected = self.claim_repo.update_status(
            claim, ClaimStatus.REJECTED, admin_remark=action.admin_remark
        )

        logger.info("Claim id=%d rejected", claim_id)
        return rejected
