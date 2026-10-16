"""
User repository — all database queries related to users.
"""
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.user import User, UserRole


class UserRepository:
    """Handles all database operations for User entities."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Fetch a user by primary key."""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        """Fetch a user by email address (case-insensitive)."""
        return self.db.query(User).filter(User.email == email.lower()).first()

    def get_by_student_id(self, student_id: str) -> Optional[User]:
        """Fetch a user by their student ID."""
        return self.db.query(User).filter(User.student_id == student_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Return a paginated list of all users."""
        return self.db.query(User).offset(skip).limit(limit).all()

    def count_all(self) -> int:
        """Return total user count."""
        return self.db.query(User).count()

    def create(
        self,
        student_id: str,
        name: str,
        email: str,
        phone: str,
        password_hash: str,
        department: str,
        role: UserRole = UserRole.STUDENT,
    ) -> User:
        """Create and persist a new user."""
        user = User(
            student_id=student_id,
            name=name,
            email=email.lower(),
            phone=phone,
            password_hash=password_hash,
            department=department,
            role=role,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User, **kwargs) -> User:
        """Update specific fields of a user."""
        for key, value in kwargs.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        """Delete a user from the database."""
        self.db.delete(user)
        self.db.commit()

    def admin_exists(self) -> bool:
        """Check if any admin account already exists."""
        return self.db.query(User).filter(User.role == UserRole.ADMIN).first() is not None
