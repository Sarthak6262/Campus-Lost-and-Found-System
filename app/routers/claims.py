"""
Claims router — student claim submission and retrieval endpoints.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.claim import ClaimCreateRequest, ClaimResponse
from app.schemas.common import APIResponse, success_response
from app.services.claim_service import ClaimService

router = APIRouter(prefix="/api/claims", tags=["Claims"])


@router.post(
    "",
    response_model=APIResponse[ClaimResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Submit a claim for a found item",
    description=(
        "Submit a claim asserting ownership of a FOUND item. "
        "You cannot claim your own item. Only ACTIVE FOUND items can be claimed. "
        "You cannot have multiple pending claims for the same item."
    ),
)
def create_claim(
    request: ClaimCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a claim for a found item."""
    service = ClaimService(db)
    claim = service.create_claim(request, current_user)
    return success_response("Claim submitted successfully", ClaimResponse.model_validate(claim))


@router.get(
    "/my",
    response_model=APIResponse[List[ClaimResponse]],
    summary="Get my claims",
    description="Returns all claims submitted by the currently authenticated user.",
)
def get_my_claims(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all claims submitted by the current user."""
    service = ClaimService(db)
    claims = service.get_my_claims(current_user)
    data = [ClaimResponse.model_validate(c) for c in claims]
    return success_response("Claims retrieved", data)


@router.get(
    "/item/{item_id}",
    response_model=APIResponse[Optional[ClaimResponse]],
    summary="Get approved claim for an item",
    description=(
        "Returns the approved claim for an item, including mutual contact details "
        "and handover instructions for coordination. "
        "Accessible by the item reporter (finder), the claimant (owner), or an administrator."
    ),
)
def get_item_approved_claim(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the approved claim for an item to coordinate handover."""
    service = ClaimService(db)
    claim = service.get_approved_claim_for_item(item_id, current_user)
    data = ClaimResponse.model_validate(claim) if claim else None
    return success_response("Item claim retrieved", data)


@router.get(
    "/{claim_id}",
    response_model=APIResponse[ClaimResponse],
    summary="Get claim details",
    description=(
        "Returns details of a specific claim. "
        "Students can only view their own claims."
    ),
)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get details of a specific claim."""
    service = ClaimService(db)
    claim = service.get_claim(claim_id, current_user)
    return success_response("Claim retrieved", ClaimResponse.model_validate(claim))
