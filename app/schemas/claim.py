"""
Claim request and response Pydantic schemas.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator

from app.models.claim import ClaimStatus


class ClaimCreateRequest(BaseModel):
    """Request body for POST /api/claims."""
    item_id: int
    reason: str
    identification_details: str

    @field_validator("reason")
    @classmethod
    def reason_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Reason is required")
        return v.strip()

    @field_validator("identification_details")
    @classmethod
    def details_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Identification details are required")
        return v.strip()

    model_config = {"json_schema_extra": {
        "example": {
            "item_id": 5,
            "reason": "This is my lost earbuds.",
            "identification_details": "There is a small scratch on the charging case."
        }
    }}


class ClaimAdminAction(BaseModel):
    """Request body for admin approve/reject actions."""
    admin_remark: str

    @field_validator("admin_remark")
    @classmethod
    def remark_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Admin remark is required")
        return v.strip()

    model_config = {"json_schema_extra": {
        "example": {
            "admin_remark": "Ownership verified."
        }
    }}


class ClaimResponse(BaseModel):
    """Claim data returned in API responses."""
    id: int
    item_id: int
    user_id: int
    reason: str
    identification_details: str
    status: ClaimStatus
    admin_remark: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Associated Claimant (Owner) Details
    claimant_id: Optional[int] = None
    claimant_name: Optional[str] = None
    claimant_email: Optional[str] = None
    claimant_student_id: Optional[str] = None
    claimant_department: Optional[str] = None
    claimant_phone: Optional[str] = None

    # Associated Finder Details (Available for handover coordination upon approval)
    finder_id: Optional[int] = None
    finder_name: Optional[str] = None
    finder_email: Optional[str] = None
    finder_phone: Optional[str] = None
    finder_student_id: Optional[str] = None
    finder_department: Optional[str] = None
    collection_location: Optional[str] = None

    # Associated Item Details
    item_name: Optional[str] = None
    item_category: Optional[str] = None
    item_type: Optional[str] = None
    item_status: Optional[str] = None

    model_config = {"from_attributes": True}

