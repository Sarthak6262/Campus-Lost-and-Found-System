"""
Item request and response Pydantic schemas.
"""
from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

from app.models.item import ItemCategory, ItemStatus, ItemType


class ItemCreateRequest(BaseModel):
    """
    Request body for creating a lost or found item report.
    reported_by is NEVER accepted from the client — it comes from JWT.
    """
    item_name: str
    category: ItemCategory
    description: str
    color: Optional[str] = None
    location: str
    item_date: date

    @field_validator("item_name")
    @classmethod
    def item_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Item name is required")
        return v.strip()

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Description is required")
        return v.strip()

    @field_validator("location")
    @classmethod
    def location_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Location is required")
        return v.strip()

    @field_validator("item_date")
    @classmethod
    def date_not_in_future(cls, v: date) -> date:
        from datetime import date as date_type
        if v > date_type.today():
            raise ValueError("Item date cannot be in the future")
        return v

    model_config = {"json_schema_extra": {
        "example": {
            "item_name": "Black Wallet",
            "category": "WALLET",
            "description": "Black leather wallet containing college ID",
            "color": "Black",
            "location": "College Library",
            "item_date": "2026-10-08"
        }
    }}


class ItemUpdateRequest(BaseModel):
    """All fields optional for partial updates."""
    item_name: Optional[str] = None
    category: Optional[ItemCategory] = None
    description: Optional[str] = None
    color: Optional[str] = None
    location: Optional[str] = None
    item_date: Optional[date] = None

    @field_validator("item_name")
    @classmethod
    def item_name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Item name cannot be empty")
        return v.strip() if v else v


class ItemResponse(BaseModel):
    """Item data returned in API responses."""
    id: int
    item_name: str
    category: ItemCategory
    description: str
    color: Optional[str]
    location: str
    item_date: date
    type: ItemType
    status: ItemStatus
    image_url: Optional[str]
    reported_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ItemAdminStatusUpdate(BaseModel):
    """Admin request to change item status."""
    status: ItemStatus


class MatchResult(BaseModel):
    """A single match result from the smart matching algorithm."""
    matched_item_id: int
    matched_item_name: str
    match_score: int
    reasons: List[str]


class ItemMatchResponse(BaseModel):
    """Response from GET /api/items/{item_id}/matches."""
    item_id: int
    matches: List[MatchResult]
