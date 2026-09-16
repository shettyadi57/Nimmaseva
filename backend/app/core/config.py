import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nimma Seva - Shivamogga Smart Seva Token System"
    API_V1_STR: str = "/api"

    # SECURITY: Must be set via environment variable — no default.
    # Generate with: python -c "import secrets; print(secrets.token_hex(32))"
    SECRET_KEY: str

    ALGORITHM: str = "HS256"
    # 8 hours — tokens are re-issued on each admin login
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./nimmaseva.db"
    )

    # CORS — list exact origins; never use "*" with allow_credentials=True
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:80",
    ]

    class Config:
        case_sensitive = True

settings = Settings()
