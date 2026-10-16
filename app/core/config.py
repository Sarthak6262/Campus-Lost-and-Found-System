"""
Application configuration using Pydantic Settings.
All settings are loaded from environment variables or .env file.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    APP_NAME: str = "CampusFind"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/campus_lost_found"

    # JWT
    JWT_SECRET_KEY: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Admin Seed
    ADMIN_EMAIL: str = "admin@campusfind.com"
    ADMIN_PASSWORD: str = "Admin@123"
    ADMIN_NAME: str = "System Administrator"
    ADMIN_STUDENT_ID: str = "ADMIN001"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # File Upload
    UPLOAD_DIR: str = "uploads/items"
    MAX_FILE_SIZE_MB: int = 5

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        """Convert MB to bytes."""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


settings = get_settings()
