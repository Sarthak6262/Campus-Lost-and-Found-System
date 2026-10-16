"""
Utility validators used across the application.
"""
import re
from typing import Optional


def is_valid_email(email: str) -> bool:
    """Basic email format validator."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def is_valid_phone(phone: str) -> bool:
    """Validate a 10-digit phone number (digits only)."""
    cleaned = re.sub(r"\D", "", phone)
    return len(cleaned) == 10


def sanitize_string(value: Optional[str], max_length: int = 255) -> Optional[str]:
    """Strip whitespace and truncate to max_length."""
    if value is None:
        return None
    return value.strip()[:max_length]


ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png"}


def is_allowed_image(filename: str, content_type: str) -> bool:
    """Check if an uploaded file is an allowed image type."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in ALLOWED_IMAGE_EXTENSIONS and content_type in ALLOWED_MIME_TYPES
