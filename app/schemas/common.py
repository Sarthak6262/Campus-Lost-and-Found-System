"""
Common/shared Pydantic schemas used across multiple endpoints.
"""
from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standard API response envelope."""
    success: bool
    message: str
    data: Optional[T] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list response."""
    success: bool = True
    message: str = "Success"
    data: Optional[List[T]] = None
    page: int
    limit: int
    total: int
    pages: int


def success_response(message: str, data: Any = None) -> dict:
    """Build a successful API response dict."""
    return {"success": True, "message": message, "data": data}


def error_response(message: str, data: Any = None) -> dict:
    """Build an error API response dict."""
    return {"success": False, "message": message, "data": data}
