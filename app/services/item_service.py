"""
Item service — business logic for creating, updating, and deleting items.
"""
import logging
import math
from datetime import date
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.item import Item, ItemCategory, ItemStatus, ItemType
from app.models.user import User, UserRole
from app.repositories.item_repository import ItemRepository
from app.schemas.item import ItemCreateRequest, ItemUpdateRequest

logger = logging.getLogger(__name__)


class ItemService:
    """Business logic for all item-related operations."""

    def __init__(self, db: Session) -> None:
        self.item_repo = ItemRepository(db)

    def create_item(
        self, request: ItemCreateRequest, item_type: ItemType, current_user: User
    ) -> Item:
        """Create a new LOST or FOUND item report."""
        item = self.item_repo.create(
            item_name=request.item_name,
            category=request.category,
            description=request.description,
            location=request.location,
            item_date=request.item_date,
            item_type=item_type,
            reported_by=current_user.id,  # Always from JWT — never from client
            color=request.color,
        )
        logger.info(
            "Item created: id=%d name=%s type=%s by user=%d",
            item.id, item.item_name, item.type, current_user.id
        )
        return item

    def get_item(self, item_id: int) -> Item:
        """Fetch a single item by ID, raising 404 if not found."""
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with id {item_id} not found",
            )
        return item

    def get_items(
        self,
        page: int = 1,
        limit: int = 10,
        item_type: Optional[ItemType] = None,
        item_status: Optional[ItemStatus] = None,
    ) -> dict:
        """Return a paginated list of items."""
        skip = (page - 1) * limit
        items, total = self.item_repo.get_all(
            skip=skip, limit=limit, item_type=item_type, status=item_status
        )
        pages = math.ceil(total / limit) if total > 0 else 1
        return {"items": items, "page": page, "limit": limit, "total": total, "pages": pages}

    def search_items(
        self,
        item_name: Optional[str] = None,
        category: Optional[ItemCategory] = None,
        color: Optional[str] = None,
        location: Optional[str] = None,
        item_type: Optional[ItemType] = None,
        item_status: Optional[ItemStatus] = None,
        item_date: Optional[date] = None,
        sort_by: str = "created_at",
        order: str = "desc",
        page: int = 1,
        limit: int = 10,
    ) -> dict:
        """Search items with filters, sorting, and pagination."""
        skip = (page - 1) * limit
        items, total = self.item_repo.search(
            item_name=item_name,
            category=category,
            color=color,
            location=location,
            item_type=item_type,
            status=item_status,
            item_date=item_date,
            sort_by=sort_by,
            order=order,
            skip=skip,
            limit=limit,
        )
        pages = math.ceil(total / limit) if total > 0 else 1
        return {"items": items, "page": page, "limit": limit, "total": total, "pages": pages}

    def update_item(
        self, item_id: int, request: ItemUpdateRequest, current_user: User
    ) -> Item:
        """
        Update an item. Students can only update their own items.
        Admins can update any item.
        """
        item = self.get_item(item_id)

        if current_user.role != UserRole.ADMIN and item.reported_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own item reports",
            )

        updates = request.model_dump(exclude_none=True)
        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields provided for update",
            )

        updated = self.item_repo.update(item, **updates)
        logger.info("Item updated: id=%d by user=%d", item.id, current_user.id)
        return updated

    def delete_item(self, item_id: int, current_user: User) -> None:
        """
        Delete an item. Students can only delete their own items.
        Admins can delete any item.
        """
        item = self.get_item(item_id)

        if current_user.role != UserRole.ADMIN and item.reported_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own item reports",
            )

        self.item_repo.delete(item)
        logger.info("Item deleted: id=%d by user=%d", item_id, current_user.id)

    def get_user_items(self, user_id: int) -> List[Item]:
        """Return all items reported by a specific user."""
        return self.item_repo.get_by_user(user_id)

    def update_item_image(self, item_id: int, image_url: str, current_user: User) -> Item:
        """Set the image URL on an item after upload."""
        item = self.get_item(item_id)

        if current_user.role != UserRole.ADMIN and item.reported_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only add images to your own item reports",
            )

        return self.item_repo.update(item, image_url=image_url)
