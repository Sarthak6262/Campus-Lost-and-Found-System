"""
Pytest configuration — creates an isolated SQLite test database.
Each test gets a clean database session.
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Use SQLite in-memory database for tests (no MySQL required)
TEST_DATABASE_URL = "sqlite:///./test_campusfind.db"

# Set environment variables BEFORE importing app
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["ADMIN_EMAIL"] = "admin@test.com"
os.environ["ADMIN_PASSWORD"] = "Admin@123"
os.environ["ADMIN_STUDENT_ID"] = "ADMIN001"
os.environ["ADMIN_NAME"] = "Test Admin"
os.environ["DEBUG"] = "False"

from app.database.base import Base
from app.database.database import get_db
from app.main import app

# Create test engine
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test function."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db):
    """Create a test client with the test database session."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def student_data():
    """Sample student registration data."""
    return {
        "student_id": "STU001",
        "name": "Test Student",
        "email": "student@test.com",
        "phone": "9876543210",
        "password": "Password@123",
        "department": "BCA",
    }


@pytest.fixture
def student2_data():
    """Second student data for multi-user tests."""
    return {
        "student_id": "STU002",
        "name": "Second Student",
        "email": "student2@test.com",
        "phone": "9876543211",
        "password": "Password@123",
        "department": "MCA",
    }


@pytest.fixture
def admin_data():
    """Admin credentials."""
    return {
        "email": "admin@test.com",
        "password": "Admin@123",
    }


@pytest.fixture
def registered_student(client, student_data):
    """Register a student and return their data."""
    client.post("/api/auth/register", json=student_data)
    return student_data


@pytest.fixture
def student_token(client, registered_student):
    """Get a JWT token for the registered student."""
    response = client.post(
        "/api/auth/login",
        json={"email": registered_student["email"], "password": registered_student["password"]},
    )
    return response.json()["data"]["access_token"]


@pytest.fixture
def student_headers(student_token):
    """Authorization headers for the student."""
    return {"Authorization": f"Bearer {student_token}"}


@pytest.fixture
def admin_token(client, admin_data):
    """Get a JWT token for the admin (seeded on startup)."""
    # Seed admin manually for tests
    from app.core.security import hash_password
    from app.models.user import User, UserRole

    db = next(client.app.dependency_overrides[get_db]())

    existing = db.query(User).filter(User.email == admin_data["email"]).first()
    if not existing:
        admin = User(
            student_id="ADMIN001",
            name="Test Admin",
            email=admin_data["email"],
            phone="0000000000",
            password_hash=hash_password(admin_data["password"]),
            department="Administration",
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()

    response = client.post("/api/auth/login", json=admin_data)
    return response.json()["data"]["access_token"]


@pytest.fixture
def admin_headers(admin_token):
    """Authorization headers for the admin."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def lost_item_data():
    """Sample lost item payload."""
    return {
        "item_name": "Black Wallet",
        "category": "WALLET",
        "description": "Black leather wallet with college ID inside",
        "color": "Black",
        "location": "College Library",
        "item_date": "2026-10-01",
    }


@pytest.fixture
def found_item_data():
    """Sample found item payload."""
    return {
        "item_name": "Samsung Earbuds",
        "category": "ELECTRONICS",
        "description": "White earbuds charging case found near canteen",
        "color": "White",
        "location": "College Canteen",
        "item_date": "2026-10-01",
    }
