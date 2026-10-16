"""
Admin router — all administrative endpoints.
All routes require ADMIN role.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin
from app.database.database import get_db
from app.models.claim import ClaimStatus
from app.models.item import ItemStatus, ItemType
from app.models.user import User
from app.schemas.claim import ClaimAdminAction, ClaimResponse
from app.schemas.common import APIResponse, success_response
from app.schemas.item import ItemAdminStatusUpdate, ItemResponse
from app.schemas.user import AdminUserStatusUpdate, UserResponse
from app.services.admin_service import AdminService

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ------------------------------------------------------------------ #
# Dashboard
# ------------------------------------------------------------------ #

@router.get(
    "/dashboard",
    summary="Admin dashboard statistics",
    description="Returns aggregated statistics: user counts, item counts, claim counts.",
)
def get_dashboard(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get admin dashboard statistics."""
    service = AdminService(db)
    stats = service.get_dashboard_stats()
    return success_response("Dashboard statistics", stats)


# ------------------------------------------------------------------ #
# User Management
# ------------------------------------------------------------------ #

@router.get(
    "/users",
    summary="List all users",
    description="Returns a paginated list of all registered users.",
)
def get_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get all users (admin)."""
    service = AdminService(db)
    result = service.get_all_users(page=page, limit=limit)
    users_data = [UserResponse.model_validate(u) for u in result["users"]]
    return {
        "success": True, "message": "Users retrieved",
        "data": users_data,
        "page": result["page"], "limit": result["limit"],
        "total": result["total"], "pages": result["pages"],
    }


@router.get(
    "/users/{user_id}",
    response_model=APIResponse[UserResponse],
    summary="Get user details",
    description="Returns the full profile of a specific user.",
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get a specific user (admin)."""
    service = AdminService(db)
    user = service.get_user(user_id)
    return success_response("User retrieved", UserResponse.model_validate(user))


@router.put(
    "/users/{user_id}/status",
    response_model=APIResponse[UserResponse],
    summary="Activate or deactivate a user",
    description="Toggle a user's active status. Deactivated users cannot log in.",
)
def update_user_status(
    user_id: int,
    request: AdminUserStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Activate or deactivate a user account."""
    service = AdminService(db)
    user = service.update_user_status(user_id, request.is_active)
    return success_response(
        f"User {'activated' if request.is_active else 'deactivated'} successfully",
        UserResponse.model_validate(user),
    )


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a user",
    description="Permanently delete a user account. Cannot delete your own account.",
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Delete a user account (admin)."""
    service = AdminService(db)
    service.delete_user(user_id, requesting_admin_id=admin.id)
    return success_response("User deleted successfully")


# ------------------------------------------------------------------ #
# Item Management
# ------------------------------------------------------------------ #

@router.get(
    "/items",
    summary="List all items",
    description="Returns a paginated list of all item reports with optional type/status filters.",
)
def get_all_items(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    type: Optional[ItemType] = Query(None),
    item_status: Optional[ItemStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get all items (admin)."""
    service = AdminService(db)
    result = service.get_all_items(page=page, limit=limit, item_type=type, item_status=item_status)
    items_data = [ItemResponse.model_validate(i) for i in result["items"]]
    return {
        "success": True, "message": "Items retrieved",
        "data": items_data,
        "page": result["page"], "limit": result["limit"],
        "total": result["total"], "pages": result["pages"],
    }


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete any item",
    description="Admin can delete any item report (e.g., for inappropriate content).",
)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Delete any item (admin)."""
    service = AdminService(db)
    service.delete_item(item_id)
    return success_response("Item deleted successfully")


@router.put(
    "/items/{item_id}/status",
    response_model=APIResponse[ItemResponse],
    summary="Update item status",
    description="Admin can change the status of any item.",
)
def update_item_status(
    item_id: int,
    request: ItemAdminStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Update item status (admin)."""
    service = AdminService(db)
    item = service.update_item_status(item_id, request.status)
    return success_response("Item status updated", ItemResponse.model_validate(item))


# ------------------------------------------------------------------ #
# Claim Management
# ------------------------------------------------------------------ #

@router.get(
    "/claims",
    summary="List all claims",
    description="Returns a paginated list of all claims across all users with optional status filter.",
)
def get_all_claims(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[ClaimStatus] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get all claims (admin)."""
    service = AdminService(db)
    result = service.get_all_claims(page=page, limit=limit, status=status)
    claims_data = [ClaimResponse.model_validate(c) for c in result["claims"]]
    return {
        "success": True, "message": "Claims retrieved",
        "data": claims_data,
        "page": result["page"], "limit": result["limit"],
        "total": result["total"], "pages": result["pages"],
    }



@router.put(
    "/claims/{claim_id}/approve",
    response_model=APIResponse[ClaimResponse],
    summary="Approve a claim",
    description=(
        "Approve a PENDING claim. "
        "This will: mark the claim as APPROVED, set the item as RETURNED, "
        "and automatically REJECT all other pending claims for the same item."
    ),
)
def approve_claim(
    claim_id: int,
    action: ClaimAdminAction,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Approve a claim (admin)."""
    service = AdminService(db)
    claim = service.approve_claim(claim_id, action)
    return success_response("Claim approved successfully", ClaimResponse.model_validate(claim))


@router.put(
    "/claims/{claim_id}/reject",
    response_model=APIResponse[ClaimResponse],
    summary="Reject a claim",
    description=(
        "Reject a PENDING claim. The item remains ACTIVE and other students can still claim it."
    ),
)
def reject_claim(
    claim_id: int,
    action: ClaimAdminAction,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Reject a claim (admin)."""
    service = AdminService(db)
    claim = service.reject_claim(claim_id, action)
    return success_response("Claim rejected", ClaimResponse.model_validate(claim))
