"""
Claim ORM model representing ownership claims on found items.
"""
import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class ClaimStatus(str, enum.Enum):
    """Lifecycle status of a claim."""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Claim(Base):
    """
    Claim model. Students use claims to assert ownership of FOUND items.
    Only one claim can be APPROVED per item; approving one auto-rejects others.
    """
    __tablename__ = "claims"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    identification_details: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ClaimStatus] = mapped_column(
        Enum(ClaimStatus), default=ClaimStatus.PENDING, nullable=False, index=True
    )
    admin_remark: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    item: Mapped["Item"] = relationship(  # noqa: F821
        "Item", back_populates="claims", lazy="select"
    )
    claimant: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="claims", lazy="select"
    )

    # Convenience properties for serialization
    @property
    def claimant_id(self) -> int | None:
        return self.user_id

    @property
    def claimant_name(self) -> str | None:
        return self.claimant.name if self.claimant else None

    @property
    def claimant_email(self) -> str | None:
        return self.claimant.email if self.claimant else None

    @property
    def claimant_student_id(self) -> str | None:
        return self.claimant.student_id if self.claimant else None

    @property
    def claimant_department(self) -> str | None:
        return self.claimant.department if self.claimant else None

    @property
    def claimant_phone(self) -> str | None:
        return self.claimant.phone if self.claimant else None

    @property
    def finder_id(self) -> int | None:
        if not self.item or not self.item.reporter:
            return None
        return self.item.reporter.id

    @property
    def finder_name(self) -> str | None:
        if not self.item or not self.item.reporter:
            return None
        return self.item.reporter.name

    @property
    def finder_email(self) -> str | None:
        if not self.item or not self.item.reporter:
            return None
        return self.item.reporter.email

    @property
    def finder_phone(self) -> str | None:
        if not self.item or not self.item.reporter:
            return None
        return self.item.reporter.phone

    @property
    def finder_student_id(self) -> str | None:
        if not self.item or not self.item.reporter:
            return None
        return self.item.reporter.student_id

    @property
    def finder_department(self) -> str | None:
        if not self.item or not self.item.reporter:
            return None
        return self.item.reporter.department

    @property
    def collection_location(self) -> str | None:
        return self.item.location if self.item else None

    @property
    def item_name(self) -> str | None:
        return self.item.item_name if self.item else None

    @property
    def item_category(self) -> str | None:
        if not self.item:
            return None
        return self.item.category.value if hasattr(self.item.category, "value") else str(self.item.category)

    @property
    def item_type(self) -> str | None:
        if not self.item:
            return None
        return self.item.type.value if hasattr(self.item.type, "value") else str(self.item.type)

    @property
    def item_status(self) -> str | None:
        if not self.item:
            return None
        return self.item.status.value if hasattr(self.item.status, "value") else str(self.item.status)

    def __repr__(self) -> str:
        return f"<Claim id={self.id} item_id={self.item_id} status={self.status}>"

