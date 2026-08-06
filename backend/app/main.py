from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, offices, services, bookings, queue, admin, analytics, schemes, notifications, public
from app.seed import seed_database
from app.core.database import engine, Base
from app.core.security_middleware import (
    SecurityHeadersMiddleware,
    RateLimiterMiddleware,
    register_security_exception_handlers
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Nimma Seva - GramOne & Seva Sindhu Token Management System API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 1. Security Headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
app.add_middleware(SecurityHeadersMiddleware)

# 2. IP Rate Limiting & Throttling (DDoS & Abuse Protection)
app.add_middleware(RateLimiterMiddleware)

# 3. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
)

# 4. Global Exception Handling (Prevents internal stack trace & DB error leaks)
register_security_exception_handlers(app)

# Startup event to seed database
@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        seed_database()
    except Exception as e:
        print(f"Startup database initialization: {e}")

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "Operational",
        "location": "Shivamogga, Karnataka",
        "security": "Enforced (HSTS, CSP, Rate Limiting, Sanitized Errors)"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Shivamogga Seva Token System Backend"}

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(offices.router, prefix=settings.API_V1_STR)
app.include_router(services.router, prefix=settings.API_V1_STR)
app.include_router(bookings.router, prefix=settings.API_V1_STR)
app.include_router(queue.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(schemes.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(public.router, prefix=settings.API_V1_STR)
