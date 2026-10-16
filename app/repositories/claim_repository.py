"""
Claim repository — all database queries related to claims.
"""
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session, joinedload

from app.models.claim import Claim, ClaimStatus
from app.models.item import Item


class ClaimRepository:
    """Handles all database operations for Claim entities."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, claim_id: int) -> Optional[Claim]:
        """Fetch a claim by primary key."""
        return (
            self.db.query(Claim)
            .options(
                joinedload(Claim.claimant),
                joinedload(Claim.item).joinedload(Item.reporter),
            )
            .filter(Claim.id == claim_id)
            .first()
        )

    def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
        status: Optional[ClaimStatus] = None,
    ) -> Tuple[List[Claim], int]:
        """Return all claims, optionally filtered by status."""
        query = self.db.query(Claim).options(
            joinedload(Claim.claimant),
            joinedload(Claim.item).joinedload(Item.reporter),
        )
        count_query = self.db.query(Claim)
        if status:
            query = query.filter(Claim.status == status)
            count_query = count_query.filter(Claim.status == status)
        total = count_query.count()
        claims = query.order_by(Claim.created_at.desc()).offset(skip).limit(limit).all()
        return claims, total

    def get_by_user(self, user_id: int) -> List[Claim]:
        """Fetch all claims submitted by a specific user."""
        return (
            self.db.query(Claim)
            .options(
                joinedload(Claim.claimant),
                joinedload(Claim.item).joinedload(Item.reporter),
            )
            .filter(Claim.user_id == user_id)
            .order_by(Claim.created_at.desc())
            .all()
        )

    def get_approved_claim_for_item(self, item_id: int) -> Optional[Claim]:
        """Fetch the approved claim for an item with claimant and reporter loaded."""
        return (
            self.db.query(Claim)
            .options(
                joinedload(Claim.claimant),
                joinedload(Claim.item).joinedload(Item.reporter),
            )
            .filter(Claim.item_id == item_id, Claim.status == ClaimStatus.APPROVED)
            .first()
        )


    def get_pending_by_item(self, item_id: int) -> List[Claim]:
        """Fetch all PENDING claims for a specific item."""
        return (
            self.db.query(Claim)
            .filter(Claim.item_id == item_id, Claim.status == ClaimStatus.PENDING)
            .all()
        )

    def get_active_claim_by_user_item(
        self, user_id: int, item_id: int
    ) -> Optional[Claim]:
        """
        Check if a user already has an active (PENDING) claim for this item.
        Used to prevent duplicate claims.
        """
        return (
            self.db.query(Claim)
            .filter(
                Claim.user_id == user_id,
                Claim.item_id == item_id,
                Claim.status == ClaimStatus.PENDING,
            )
            .first()
        )

    def create(
        self,
        item_id: int,
        user_id: int,
        reason: str,
        identification_details: str,
    ) -> Claim:
        """Create and persist a new claim."""
        claim = Claim(
            item_id=item_id,
            user_id=user_id,
            reason=reason,
            identification_details=identification_details,
        )
        self.db.add(claim)
        self.db.commit()
        self.db.refresh(claim)
        return claim

    def update_status(
        self,
        claim: Claim,
        status: ClaimStatus,
        admin_remark: Optional[str] = None,
    ) -> Claim:
        """Update claim status and optional admin remark."""
        claim.status = status
        if admin_remark is not None:
            claim.admin_remark = admin_remark
        self.db.commit()
        self.db.refresh(claim)
        return claim

    def reject_all_pending_for_item(self, item_id: int, except_claim_id: int) -> None:
        """
        Reject all other PENDING claims for an item when one is approved.
        Uses a single bulk update for efficiency.
        """
        (
            self.db.query(Claim)
            .filter(
                Claim.item_id == item_id,
                Claim.status == ClaimStatus.PENDING,
                Claim.id != except_claim_id,
            )
            .update(
                {
                    "status": ClaimStatus.REJECTED,
                    "admin_remark": "Another claim was approved for this item.",
                },
                synchronize_session=False,
            )
        )
        self.db.commit()

    # --- Statistics ---
    def count_by_status(self, status: ClaimStatus) -> int:
        return self.db.query(Claim).filter(Claim.status == status).count()
