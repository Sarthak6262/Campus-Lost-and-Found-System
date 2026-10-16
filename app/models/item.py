"""
Item ORM model representing lost and found items.
"""
import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class ItemType(str, enum.Enum):
    """Whether the item was lost or found."""
    LOST = "LOST"
    FOUND = "FOUND"


class ItemStatus(str, enum.Enum):
    """Current lifecycle status of an item report."""
    ACTIVE = "ACTIVE"
    CLAIMED = "CLAIMED"
    RETURNED = "RETURNED"
    CLOSED = "CLOSED"


class ItemCategory(str, enum.Enum):
    """Standardized item categories for easier matching."""
    ELECTRONICS = "ELECTRONICS"
    DOCUMENTS = "DOCUMENTS"
    BOOKS = "BOOKS"
    WALLET = "WALLET"
    KEYS = "KEYS"
    CLOTHING = "CLOTHING"
    BAG = "BAG"
    ACCESSORIES = "ACCESSORIES"
    OTHER = "OTHER"


class Item(Base):
    """
    Item model for lost and found reports.
    reported_by is always set from the authenticated JWT — never from client input.
    """
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    category: Mapped[ItemCategory] = mapped_column(Enum(ItemCategory), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    color: Mapped[str] = mapped_column(String(50), nullable=True)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    item_date: Mapped[date] = mapped_column(Date, nullable=False)
    type: Mapped[ItemType] = mapped_column(Enum(ItemType), nullable=False, index=True)
    status: Mapped[ItemStatus] = mapped_column(
        Enum(ItemStatus), default=ItemStatus.ACTIVE, nullable=False, index=True
    )
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    reported_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    reporter: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="items", lazy="select"
    )
    claims: Mapped[list["Claim"]] = relationship(  # noqa: F821
        "Claim", back_populates="item", lazy="select", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Item id={self.id} name={self.item_name} type={self.type}>"
