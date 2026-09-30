import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve the .env file relative to this config file (backend/.env)
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nimma Seva - Shivamogga Smart Seva Token System"
    API_V1_STR: str = "/api"

    # SECURITY: Loaded from .env file; falls back to dev-only key if not set.
    # Generate a production key with: python -c "import secrets; print(secrets.token_hex(32))"
    SECRET_KEY: str = "nimmaseva_dev_key_change_this_before_production_deploy_2026"

    ALGORITHM: str = "HS256"
    # 8 hours — tokens are re-issued on each admin login
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8

    # Database
    DATABASE_URL: str = "sqlite:///./nimmaseva.db"

    # SMTP / Email Verification Settings (Free via Gmail SMTP or similar)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "Nimma Seva Karnataka"

    # CORS — list exact origins; never use "*" with allow_credentials=True
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:80",
    ]

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()

