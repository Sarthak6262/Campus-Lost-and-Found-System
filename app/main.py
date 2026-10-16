"""
CampusFind — Campus Lost & Found Management System
Main FastAPI application entry point.

Features:
- JWT-based authentication
- Role-based access control (STUDENT / ADMIN)
- Lost & Found item reporting
- Claim system with admin approval workflow
- Smart rule-based item matching
- Image upload support
- Comprehensive admin dashboard
"""
import logging
import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.base import Base
from app.database.database import check_db_connection, engine
from app.exceptions.handlers import register_exception_handlers
from app.routers import admin, auth, claims, items, users

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ------------------------------------------------------------------ #
# Import all models so SQLAlchemy registers them before create_all
# ------------------------------------------------------------------ #
from app.models import user, item, claim  # noqa: F401, E402


def create_tables() -> None:
    """Create all database tables if they don't exist."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified successfully")
    except Exception as e:
        logger.error("Failed to create database tables: %s", str(e))
        raise


def seed_admin() -> None:
    """Create the initial admin account if it doesn't exist."""
    from app.core.security import hash_password
    from app.database.database import SessionLocal
    from app.models.user import User, UserRole
    from app.repositories.user_repository import UserRepository

    db = SessionLocal()
    try:
        repo = UserRepository(db)
        if not repo.get_by_email(settings.ADMIN_EMAIL):
            repo.create(
                student_id=settings.ADMIN_STUDENT_ID,
                name=settings.ADMIN_NAME,
                email=settings.ADMIN_EMAIL,
                phone="0000000000",
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                department="Administration",
                role=UserRole.ADMIN,
            )
            logger.info("Initial admin account created: %s", settings.ADMIN_EMAIL)
        else:
            logger.info("Admin account already exists — skipping seed")
    except Exception as e:
        logger.error("Failed to seed admin account: %s", str(e))
    finally:
        db.close()


def ensure_upload_dir() -> None:
    """Make sure the file upload directory exists."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info("Upload directory ready: %s", settings.UPLOAD_DIR)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler for startup and shutdown."""
    logger.info("=" * 60)
    logger.info("Starting %s v%s", settings.APP_NAME, settings.APP_VERSION)
    logger.info("=" * 60)

    # Check database connectivity and initialize tables
    if check_db_connection():
        logger.info("Database connection: OK")
        create_tables()
        seed_admin()
    else:
        logger.warning(
            "Database connection failed — check DATABASE_URL in .env. "
            "Server will continue running; please start/configure MySQL to use database endpoints."
        )

    ensure_upload_dir()

    logger.info("Swagger UI:  http://localhost:8000/docs")
    logger.info("ReDoc:       http://localhost:8000/redoc")
    logger.info("Admin login: %s / %s", settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD)
    logger.info("=" * 60)

    yield

    logger.info("%s shutting down", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "**CampusFind** — A complete Campus Lost & Found Management System.\n\n"
        "## Features\n"
        "- 🔐 JWT Authentication with role-based access control\n"
        "- 📦 Lost & Found item reporting with image uploads\n"
        "- 🔍 Smart rule-based item matching algorithm\n"
        "- ✅ Claim system with admin approval workflow\n"
        "- 📊 Admin dashboard with real-time statistics\n\n"
        "## Authentication\n"
        "Use `POST /api/auth/login` to get a Bearer token, then click **Authorize** above."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ------------------------------------------------------------------ #
# CORS Middleware
# ------------------------------------------------------------------ #

# Allow any localhost/127.0.0.1 port and any Vercel deployment (*.vercel.app)
cors_origin_regex = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$"
if "*" in settings.cors_origins_list:
    cors_origin_regex = r".*"

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------ #
# Exception Handlers
# ------------------------------------------------------------------ #

register_exception_handlers(app)

# ------------------------------------------------------------------ #
# Routers
# ------------------------------------------------------------------ #

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(items.router)
app.include_router(claims.router)
app.include_router(admin.router)

# ------------------------------------------------------------------ #
# Static Files (uploaded images)
# ------------------------------------------------------------------ #

# Mount the uploads directory for serving images
if os.path.exists(settings.UPLOAD_DIR):
    app.mount(
        f"/{settings.UPLOAD_DIR}",
        StaticFiles(directory=settings.UPLOAD_DIR),
        name="uploads",
    )




# ------------------------------------------------------------------ #
# Health Check
# ------------------------------------------------------------------ #

@app.get("/", tags=["Health"], summary="Health check")
def health_check():
    """Basic health check endpoint."""
    return {
        "success": True,
        "message": f"{settings.APP_NAME} is running",
        "data": {
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "redoc": "/redoc",
        },
    }


@app.get("/health", tags=["Health"], summary="Detailed health check")
def detailed_health():
    """Check database connectivity and return application status."""
    db_ok = check_db_connection()
    return {
        "success": db_ok,
        "message": "All systems operational" if db_ok else "Database connection issue",
        "data": {
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "database": "connected" if db_ok else "disconnected",
        },
    }
