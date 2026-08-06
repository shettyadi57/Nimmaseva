"""
security_middleware.py — Production-grade security middleware for Nimma Seva FastAPI backend.

Implements:
 1. Security Headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
 2. In-Memory IP Rate Limiting & Throttling (DDoS / Abuse Protection)
 3. Sanitized Error Handling (prevents internal stack trace & DB error leaks)
"""
import time
import logging
from collections import defaultdict
from typing import Dict, List
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from fastapi import FastAPI, status

# Configure server-side logger (never exposed to client)
logger = logging.getLogger("security")
logger.setLevel(logging.INFO)

# In-memory IP request tracker for rate limiting
# Format: ip -> list of timestamps
_request_history: Dict[str, List[float]] = defaultdict(list)
_auth_request_history: Dict[str, List[float]] = defaultdict(list)

# Rate limits
GLOBAL_RATE_LIMIT_PER_MIN = 100
AUTH_RATE_LIMIT_PER_MIN = 10

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Enforces security headers on every HTTP response:
     - HSTS (Strict-Transport-Security)
     - CSP (Content-Security-Policy)
     - X-Frame-Options (Clickjacking defense)
     - X-Content-Type-Options (MIME sniffing defense)
     - Referrer-Policy
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)
        
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://apis.google.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' wss: https:; "
            "frame-ancestors 'none';"
        )
        return response


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    In-memory IP rate limiter protecting public and sensitive endpoints from DDoS and brute force.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        one_min_ago = now - 60.0

        # Clean old timestamps
        _request_history[client_ip] = [t for t in _request_history[client_ip] if t > one_min_ago]
        _request_history[client_ip].append(now)

        if len(_request_history[client_ip]) > GLOBAL_RATE_LIMIT_PER_MIN:
            logger.warning(f"Rate limit exceeded for IP: {client_ip} on path: {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Too many requests. Please slow down and try again in a minute.",
                    "error_code": "RATE_LIMIT_EXCEEDED"
                }
            )

        # Strict throttling on sensitive authentication / OTP routes
        is_auth_route = "/auth/send-otp" in request.url.path or "/auth/login" in request.url.path
        if is_auth_route:
            _auth_request_history[client_ip] = [t for t in _auth_request_history[client_ip] if t > one_min_ago]
            _auth_request_history[client_ip].append(now)

            if len(_auth_request_history[client_ip]) > AUTH_RATE_LIMIT_PER_MIN:
                logger.warning(f"Auth rate limit exceeded for IP: {client_ip}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "Too many authentication attempts. Please wait 60 seconds before retrying.",
                        "error_code": "AUTH_RATE_LIMIT_EXCEEDED"
                    }
                )

        return await call_next(request)


def register_security_exception_handlers(app: FastAPI):
    """
    Sanitizes uncaught exceptions to prevent stack trace & DB error leaks to the client.
    Logs full exception tracebacks server-side only.
    """
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        # Log error details server-side safely
        logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {exc}", exc_info=True)
        
        # Return generic error to client
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "An internal server error occurred. Please try again later.",
                "error_code": "INTERNAL_SERVER_ERROR"
            }
        )
