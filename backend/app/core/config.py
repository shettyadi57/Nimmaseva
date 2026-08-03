import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nimma Seva - Shivamogga Smart Seva Token System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "SHIVAMOGGA_SEVA_SECRET_KEY_SUPER_SECURE_2026_KARNATAKA"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./nimmaseva.db"
    )

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:80",
        "*"
    ]

    class Config:
        case_sensitive = True

settings = Settings()
