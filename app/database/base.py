"""
SQLAlchemy declarative base for all ORM models.
All models must inherit from Base.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass
