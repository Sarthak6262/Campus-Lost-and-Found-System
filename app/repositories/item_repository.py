"""
Item repository — all database queries related to items.
"""
from datetime import date
from typing import List, Optional, Tuple

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.item import Item, ItemCategory, ItemStatus, ItemType


class ItemRepository:
    """Handles all database operations for Item entities."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, item_id: int) -> Optional[Item]:
        """Fetch an item by primary key."""
        return self.db.query(Item).filter(Item.id == item_id).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
        item_type: Optional[ItemType] = None,
        status: Optional[ItemStatus] = None,
    ) -> Tuple[List[Item], int]:
        """
        Return a paginated list of items with an optional type/status filter.
        Returns (items_list, total_count).
        """
        query = self.db.query(Item)
        if item_type:
            query = query.filter(Item.type == item_type)
        if status:
            query = query.filter(Item.status == status)

        total = query.count()
        items = query.order_by(Item.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def search(
        self,
        item_name: Optional[str] = None,
        category: Optional[ItemCategory] = None,
        color: Optional[str] = None,
        location: Optional[str] = None,
        item_type: Optional[ItemType] = None,
        status: Optional[ItemStatus] = None,
        item_date: Optional[date] = None,
        sort_by: str = "created_at",
        order: str = "desc",
        skip: int = 0,
        limit: int = 10,
    ) -> Tuple[List[Item], int]:
        """
        Full-featured search with multiple optional filters, sorting, and pagination.
        Returns (items_list, total_count).
        """
        query = self.db.query(Item)

        if item_name:
            query = query.filter(Item.item_name.ilike(f"%{item_name}%"))
        if category:
            query = query.filter(Item.category == category)
        if color:
            query = query.filter(Item.color.ilike(f"%{color}%"))
        if location:
            query = query.filter(Item.location.ilike(f"%{location}%"))
        if item_type:
            query = query.filter(Item.type == item_type)
        if status:
            query = query.filter(Item.status == status)
        if item_date:
            query = query.filter(Item.item_date == item_date)

        # Sorting
        allowed_sort_fields = {"created_at", "item_date", "item_name"}
        sort_field = sort_by if sort_by in allowed_sort_fields else "created_at"
        sort_col = getattr(Item, sort_field)
        if order.lower() == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    def get_by_user(self, user_id: int) -> List[Item]:
        """Fetch all items reported by a specific user."""
        return (
            self.db.query(Item)
            .filter(Item.reported_by == user_id)
            .order_by(Item.created_at.desc())
            .all()
        )

    def get_opposite_type_active(self, item_type: ItemType) -> List[Item]:
        """
        Return ACTIVE items of the opposite type (for smart matching).
        e.g., if item_type is LOST, returns FOUND items.
        """
        opposite = ItemType.FOUND if item_type == ItemType.LOST else ItemType.LOST
        return (
            self.db.query(Item)
            .filter(and_(Item.type == opposite, Item.status == ItemStatus.ACTIVE))
            .all()
        )

    def create(
        self,
        item_name: str,
        category: ItemCategory,
        description: str,
        location: str,
        item_date: date,
        item_type: ItemType,
        reported_by: int,
        color: Optional[str] = None,
        image_url: Optional[str] = None,
    ) -> Item:
        """Create and persist a new item report."""
        item = Item(
            item_name=item_name,
            category=category,
            description=description,
            color=color,
            location=location,
            item_date=item_date,
            type=item_type,
            reported_by=reported_by,
            image_url=image_url,
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item: Item, **kwargs) -> Item:
        """Update specific fields of an item."""
        for key, value in kwargs.items():
            if value is not None and hasattr(item, key):
                setattr(item, key, value)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: Item) -> None:
        """Delete an item from the database."""
        self.db.delete(item)
        self.db.commit()

    # --- Statistics ---
    def count_by_type(self, item_type: ItemType) -> int:
        return self.db.query(Item).filter(Item.type == item_type).count()

    def count_by_status(self, status: ItemStatus) -> int:
        return self.db.query(Item).filter(Item.status == status).count()
