"""
User request and response Pydantic schemas.
Passwords are never included in response schemas.
"""
import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.models.user import UserRole


class UserRegisterRequest(BaseModel):
    """Request body for POST /api/auth/register."""
    student_id: str
    name: str
    email: EmailStr
    phone: str
    password: str
    department: str

    @field_validator("name")
    @classmethod
    def name_min_length(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.strip()

    @field_validator("student_id")
    @classmethod
    def student_id_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Student ID is required")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def phone_must_be_10_digits(cls, v: str) -> str:
        cleaned = re.sub(r"\D", "", v)
        if len(cleaned) != 10:
            raise ValueError("Phone number must be exactly 10 digits")
        return cleaned

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @field_validator("department")
    @classmethod
    def department_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Department is required")
        return v.strip()

    model_config = {"json_schema_extra": {
        "example": {
            "student_id": "STU001",
            "name": "Sarthak Wakchaure",
            "email": "student@example.com",
            "phone": "9876543210",
            "password": "Password@123",
            "department": "BCA"
        }
    }}


class UserUpdateRequest(BaseModel):
    """Request body for PUT /api/users/me — all fields optional."""
    name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_min_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.strip() if v else v

    @field_validator("phone")
    @classmethod
    def phone_must_be_10_digits(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = re.sub(r"\D", "", v)
            if len(cleaned) != 10:
                raise ValueError("Phone number must be exactly 10 digits")
            return cleaned
        return v


class UserResponse(BaseModel):
    """User data returned in API responses — password_hash is excluded."""
    id: int
    student_id: str
    name: str
    email: str
    phone: str
    department: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AdminUserStatusUpdate(BaseModel):
    """Request body for admin to activate/deactivate a user."""
    is_active: bool
