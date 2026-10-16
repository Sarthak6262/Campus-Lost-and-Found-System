"""
Claim service — business logic for creating and managing claims.
"""
import logging
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.claim import Claim, ClaimStatus
from app.models.item import Item, ItemStatus, ItemType
from app.models.user import User, UserRole
from app.repositories.claim_repository import ClaimRepository
from app.repositories.item_repository import ItemRepository
from app.schemas.claim import ClaimCreateRequest

logger = logging.getLogger(__name__)


class ClaimService:
    """Business logic for all claim-related operations."""

    def __init__(self, db: Session) -> None:
        self.claim_repo = ClaimRepository(db)
        self.item_repo = ItemRepository(db)

    def create_claim(self, request: ClaimCreateRequest, current_user: User) -> Claim:
        """
        Submit a claim for a FOUND item.

        Business Rules enforced:
        1. Only FOUND items can be claimed.
        2. Users cannot claim their own items.
        3. Only ACTIVE items can be claimed (not RETURNED or CLOSED).
        4. No duplicate active claims per user per item.
        """
        item = self.item_repo.get_by_id(request.item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with id {request.item_id} not found",
            )

        # Rule: Only FOUND items can be claimed
        if item.type != ItemType.FOUND:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only FOUND items can be claimed",
            )

        # Rule: Item must be ACTIVE
        if item.status != ItemStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This item is no longer available for claims (status: {item.status})",
            )

        # Rule: Cannot claim own item
        if item.reported_by == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot claim an item that you reported",
            )

        # Rule: No duplicate pending claims
        existing = self.claim_repo.get_active_claim_by_user_item(
            user_id=current_user.id, item_id=request.item_id
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You already have a pending claim for this item",
            )

        claim = self.claim_repo.create(
            item_id=request.item_id,
            user_id=current_user.id,
            reason=request.reason,
            identification_details=request.identification_details,
        )

        logger.info(
            "Claim created: id=%d item_id=%d user_id=%d",
            claim.id, claim.item_id, current_user.id
        )
        return claim

    def get_my_claims(self, current_user: User) -> List[Claim]:
        """Return all claims submitted by the current user."""
        return self.claim_repo.get_by_user(current_user.id)

    def get_claim(self, claim_id: int, current_user: User) -> Claim:
        """
        Fetch a single claim.
        Students can only view their own claims; admins can view any.
        """
        claim = self.claim_repo.get_by_id(claim_id)
        if not claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim with id {claim_id} not found",
            )

        is_claimant = (claim.user_id == current_user.id)
        is_approved_finder = (
            claim.status == ClaimStatus.APPROVED
            and claim.item is not None
            and claim.item.reported_by == current_user.id
        )

        if current_user.role != UserRole.ADMIN and not is_claimant and not is_approved_finder:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own claims",
            )

        return claim

    def get_approved_claim_for_item(self, item_id: int, current_user: User) -> Optional[Claim]:
        """
        Fetch the approved claim for an item to coordinate handover.
        Accessible by:
        - The finder (user who reported the found item)
        - The claimant (verified owner)
        - Administrators
        """
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with id {item_id} not found",
            )

        claim = self.claim_repo.get_approved_claim_for_item(item_id)
        if not claim:
            return None

        is_claimant = (claim.user_id == current_user.id)
        is_finder = (item.reported_by == current_user.id)

        if current_user.role != UserRole.ADMIN and not is_claimant and not is_finder:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view handover details for this item",
            )

        return claim
