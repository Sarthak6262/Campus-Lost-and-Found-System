"""
Items router — CRUD, search, image upload, and smart matching endpoints.

IMPORTANT: The /search route MUST be defined before /{item_id} routes
to avoid FastAPI treating "search" as an item ID.
"""
import os
import uuid
from datetime import date
from typing import List, Optional

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user, get_current_user_optional
from app.database.database import get_db
from app.models.item import ItemCategory, ItemStatus, ItemType
from app.models.user import User
from app.schemas.common import APIResponse, success_response
from app.schemas.item import (
    ItemCreateRequest,
    ItemMatchResponse,
    ItemResponse,
    ItemUpdateRequest,
)
from app.services.item_service import ItemService
from app.services.matching_service import MatchingService
from app.utils.validators import ALLOWED_MIME_TYPES, ALLOWED_IMAGE_EXTENSIONS

router = APIRouter(prefix="/api/items", tags=["Items"])


# ------------------------------------------------------------------ #
# Search (must come before /{item_id})
# ------------------------------------------------------------------ #

@router.get(
    "/search",
    response_model=dict,
    summary="Search items with filters",
    description=(
        "Search lost and found items. Supports filtering by name, category, color, "
        "location, type, status, and date. Also supports pagination and sorting."
    ),
)
def search_items(
    item_name: Optional[str] = Query(None, description="Partial item name search"),
    category: Optional[ItemCategory] = Query(None),
    color: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    type: Optional[ItemType] = Query(None),
    status: Optional[ItemStatus] = Query(None),
    item_date: Optional[date] = Query(None, description="Filter by specific date (YYYY-MM-DD)"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    order: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Search items with multiple filters."""
    service = ItemService(db)
    result = service.search_items(
        item_name=item_name,
        category=category,
        color=color,
        location=location,
        item_type=type,
        item_status=status,
        item_date=item_date,
        sort_by=sort_by,
        order=order,
        page=page,
        limit=limit,
    )
    items_data = [ItemResponse.model_validate(i) for i in result["items"]]
    return {
        "success": True,
        "message": "Search results",
        "data": items_data,
        "page": result["page"],
        "limit": result["limit"],
        "total": result["total"],
        "pages": result["pages"],
    }


# ------------------------------------------------------------------ #
# Lost Items
# ------------------------------------------------------------------ #

@router.post(
    "/lost",
    response_model=APIResponse[ItemResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Report a lost item",
    description="Create a new LOST item report. The reporter is taken from your JWT token.",
)
def create_lost_item(
    request: ItemCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Report a lost item."""
    service = ItemService(db)
    item = service.create_item(request, ItemType.LOST, current_user)
    return success_response("Lost item reported successfully", ItemResponse.model_validate(item))


@router.get(
    "/lost",
    response_model=dict,
    summary="Get all lost items",
    description="Returns a paginated list of all LOST item reports.",
)
def get_lost_items(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all lost items."""
    service = ItemService(db)
    result = service.get_items(page=page, limit=limit, item_type=ItemType.LOST)
    items_data = [ItemResponse.model_validate(i) for i in result["items"]]
    return {
        "success": True, "message": "Lost items retrieved",
        "data": items_data,
        "page": result["page"], "limit": result["limit"],
        "total": result["total"], "pages": result["pages"],
    }


# ------------------------------------------------------------------ #
# Found Items
# ------------------------------------------------------------------ #

@router.post(
    "/found",
    response_model=APIResponse[ItemResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Report a found item",
    description="Create a new FOUND item report. The reporter is taken from your JWT token.",
)
def create_found_item(
    request: ItemCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Report a found item."""
    service = ItemService(db)
    item = service.create_item(request, ItemType.FOUND, current_user)
    return success_response("Found item reported successfully", ItemResponse.model_validate(item))


@router.get(
    "/found",
    response_model=dict,
    summary="Get all found items",
    description="Returns a paginated list of all FOUND item reports.",
)
def get_found_items(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all found items."""
    service = ItemService(db)
    result = service.get_items(page=page, limit=limit, item_type=ItemType.FOUND)
    items_data = [ItemResponse.model_validate(i) for i in result["items"]]
    return {
        "success": True, "message": "Found items retrieved",
        "data": items_data,
        "page": result["page"], "limit": result["limit"],
        "total": result["total"], "pages": result["pages"],
    }


# ------------------------------------------------------------------ #
# All Items
# ------------------------------------------------------------------ #

@router.get(
    "",
    response_model=dict,
    summary="Get all items",
    description="Returns a paginated list of all item reports (both lost and found).",
)
def get_all_items(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Get all items."""
    service = ItemService(db)
    result = service.get_items(page=page, limit=limit)
    items_data = [ItemResponse.model_validate(i) for i in result["items"]]
    return {
        "success": True, "message": "Items retrieved",
        "data": items_data,
        "page": result["page"], "limit": result["limit"],
        "total": result["total"], "pages": result["pages"],
    }


# ------------------------------------------------------------------ #
# Single Item CRUD
# ------------------------------------------------------------------ #

@router.get(
    "/{item_id}",
    response_model=APIResponse[ItemResponse],
    summary="Get item details",
    description="Returns full details of a single item report.",
)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Get a single item by ID."""
    service = ItemService(db)
    item = service.get_item(item_id)
    return success_response("Item retrieved", ItemResponse.model_validate(item))


@router.put(
    "/{item_id}",
    response_model=APIResponse[ItemResponse],
    summary="Update an item report",
    description="Update your own item report. Admins can update any item.",
)
def update_item(
    item_id: int,
    request: ItemUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an item report."""
    service = ItemService(db)
    item = service.update_item(item_id, request, current_user)
    return success_response("Item updated successfully", ItemResponse.model_validate(item))


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an item report",
    description="Delete your own item report. Admins can delete any item.",
)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an item report."""
    service = ItemService(db)
    service.delete_item(item_id, current_user)
    return success_response("Item deleted successfully")


# ------------------------------------------------------------------ #
# Smart Matching
# ------------------------------------------------------------------ #

@router.get(
    "/{item_id}/matches",
    response_model=APIResponse[ItemMatchResponse],
    summary="Find matching items",
    description=(
        "Uses a rule-based scoring algorithm to find potential matches. "
        "For LOST items, searches FOUND items. For FOUND items, searches LOST items. "
        "Only returns matches with a score >= 40%."
    ),
)
def get_item_matches(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Find matching items using the smart matching algorithm."""
    item_service = ItemService(db)
    item = item_service.get_item(item_id)

    matching_service = MatchingService(db)
    result = matching_service.find_matches(item)
    return success_response("Matches found", result)


# ------------------------------------------------------------------ #
# Image Upload
# ------------------------------------------------------------------ #

@router.post(
    "/{item_id}/image",
    response_model=APIResponse[ItemResponse],
    summary="Upload item image",
    description=(
        "Upload a JPG, JPEG, or PNG image for an item report. "
        "Maximum file size is configurable via MAX_FILE_SIZE_MB environment variable."
    ),
)
async def upload_item_image(
    item_id: int,
    file: UploadFile = File(..., description="Image file (JPG, JPEG, PNG)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload an image for an item report."""
    # Validate file type
    filename = file.filename or ""
    content_type = file.content_type or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in ALLOWED_IMAGE_EXTENSIONS or content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, JPEG, and PNG images are allowed",
        )

    # Read and validate file size
    content = await file.read()
    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit",
        )

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Save with a unique filename
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    image_url = f"/{settings.UPLOAD_DIR}/{unique_filename}"

    item_service = ItemService(db)
    item = item_service.update_item_image(item_id, image_url, current_user)
    return success_response("Image uploaded successfully", ItemResponse.model_validate(item))
