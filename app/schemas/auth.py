"""
Authentication request and response Pydantic schemas.
"""
from pydantic import BaseModel, EmailStr, field_validator


class LoginRequest(BaseModel):
    """Request body for POST /api/auth/login."""
    email: EmailStr
    password: str

    model_config = {"json_schema_extra": {
        "example": {
            "email": "student@example.com",
            "password": "Password@123"
        }
    }}


class TokenResponse(BaseModel):
    """Response body for successful login."""
    access_token: str
    token_type: str = "bearer"

    model_config = {"json_schema_extra": {
        "example": {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer"
        }
    }}
