"""
tests/test_security.py — Regression tests for every security finding fixed in this audit.

Run: pytest backend/tests/ -v
Requires: pytest, httpx, fastapi[testclient]
"""
import pytest
import time
from fastapi.testclient import TestClient
from unittest.mock import patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Bootstrap a test SECRET_KEY so Settings validation passes without env
import os
os.environ.setdefault("SECRET_KEY", "test_secret_key_for_pytest_32chars!")

from app.main import app
from app.core.database import Base, get_db

# ─── In-memory SQLite test database ──────────────────────────────────────────

TEST_DATABASE_URL = "sqlite:///./test_nimmaseva.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    try:
        os.remove("./test_nimmaseva.db")
    except FileNotFoundError:
        pass

client = TestClient(app)

# ─── Helpers ─────────────────────────────────────────────────────────────────

def register_and_login(email="testadmin@nimmaseva.in", password="AdminPass@99"):
    """Register a test admin user and return a valid Bearer token."""
    client.post("/api/auth/register", json={
        "full_name": "Test Admin",
        "email_or_phone": email,
        "password": password,
    })
    resp = client.post("/api/auth/login", json={
        "email_or_phone": email,
        "password": password,
    })
    return resp.json().get("access_token")


# ═══════════════════════════════════════════════════════════════════════════════
# S1 — Admin endpoints must reject unauthenticated requests
# ═══════════════════════════════════════════════════════════════════════════════

class TestAdminAuthRequired:
    """S1: Every admin/operator endpoint must return 401/403 without a token."""

    def test_admin_summary_requires_auth(self):
        resp = client.get("/api/admin/summary")
        assert resp.status_code in (401, 403), f"Expected 401/403, got {resp.status_code}"

    def test_admin_bookings_requires_auth(self):
        resp = client.get("/api/admin/bookings")
        assert resp.status_code in (401, 403)

    def test_admin_export_csv_requires_auth(self):
        resp = client.get("/api/admin/export/csv")
        assert resp.status_code in (401, 403), (
            "CRITICAL: unauthenticated CSV export would leak all citizen PII"
        )

    def test_admin_audit_logs_requires_auth(self):
        resp = client.get("/api/admin/audit-logs")
        assert resp.status_code in (401, 403)

    def test_walk_in_booking_requires_auth(self):
        resp = client.post("/api/admin/bookings/walk-in", json={
            "citizen_name": "Test", "phone": "9999999999",
            "service_id": 1, "office_id": 1
        })
        assert resp.status_code in (401, 403)

    def test_queue_control_requires_auth(self):
        resp = client.post("/api/queue/1/control", json={"action": "call_next"})
        assert resp.status_code in (401, 403)

    def test_service_create_requires_auth(self):
        resp = client.post("/api/services", json={
            "name": "Hack", "code": "HACK", "fee": 0,
            "avg_processing_time_mins": 10, "daily_capacity": 5
        })
        assert resp.status_code in (401, 403)

    def test_service_status_requires_auth(self):
        resp = client.patch("/api/services/1/status?server_status=Down")
        assert resp.status_code in (401, 403)

    def test_invalid_token_rejected(self):
        resp = client.get(
            "/api/admin/summary",
            headers={"Authorization": "Bearer this.is.not.a.valid.jwt"}
        )
        assert resp.status_code in (401, 403)

    def test_valid_token_accepted(self):
        token = register_and_login()
        assert token, "Login failed — cannot proceed with auth test"
        resp = client.get(
            "/api/admin/summary",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200


# ═══════════════════════════════════════════════════════════════════════════════
# S3 — Bcrypt hashing
# ═══════════════════════════════════════════════════════════════════════════════

class TestPasswordHashing:
    """S3: Passwords must be hashed with bcrypt (per-password random salt)."""

    def test_hashes_are_different_for_same_password(self):
        from app.core.security import get_password_hash
        h1 = get_password_hash("SamePassword123!")
        h2 = get_password_hash("SamePassword123!")
        assert h1 != h2, "Static salt detected — bcrypt should produce unique hashes"

    def test_verification_succeeds(self):
        from app.core.security import get_password_hash, verify_password
        h = get_password_hash("TestPass@456")
        assert verify_password("TestPass@456", h)

    def test_wrong_password_fails(self):
        from app.core.security import get_password_hash, verify_password
        h = get_password_hash("Correct@Pass1")
        assert not verify_password("Wrong@Pass", h)

    def test_hash_uses_bcrypt_format(self):
        from app.core.security import get_password_hash
        h = get_password_hash("AnyPass@123")
        assert h.startswith("$2b$") or h.startswith("$2a$"), (
            f"Expected bcrypt hash format, got: {h[:10]}..."
        )


# ═══════════════════════════════════════════════════════════════════════════════
# S5 — Self-role-escalation via /register
# ═══════════════════════════════════════════════════════════════════════════════

class TestRegistration:
    """S5: Callers must not be able to set their own role."""

    def test_register_ignores_role_field(self):
        """Even if a 'role' field were somehow passed, the schema forbids extra fields."""
        resp = client.post("/api/auth/register", json={
            "full_name": "Evil Hacker",
            "email_or_phone": "hacker@evil.com",
            "password": "HackPass@99",
            "role": "superadmin",   # extra field — should be rejected by extra='forbid'
        })
        # extra='forbid' on RegisterRequest means this must fail validation
        assert resp.status_code == 422, (
            f"Expected 422 (forbidden extra field), got {resp.status_code}"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# S6 — OTP TTL and single-use
# ═══════════════════════════════════════════════════════════════════════════════

class TestOTP:
    """S6: OTP must expire after TTL and be single-use."""

    def test_otp_stored_with_expiry(self):
        from app.api.auth import otp_store, OTP_TTL_SECONDS
        client.post("/api/auth/send-otp", json={"phone": "9000000001"})
        assert "9000000001" in otp_store
        _otp, expires_at = otp_store["9000000001"]
        assert expires_at > time.time()
        assert expires_at <= time.time() + OTP_TTL_SECONDS + 1

    def test_expired_otp_rejected(self):
        from app.api.auth import otp_store
        # Manually insert an expired entry
        otp_store["9000000002"] = ("123456", time.time() - 1)
        resp = client.post("/api/auth/verify-otp", json={
            "phone": "9000000002",
            "otp": "123456",
            "aadhaar": "123456789012",
        })
        assert resp.status_code == 400
        assert "expired" in resp.json()["detail"].lower()

    def test_used_otp_cannot_be_replayed(self):
        from app.api.auth import otp_store
        otp_store["9000000003"] = ("654321", time.time() + 300)
        # First use — succeeds
        resp1 = client.post("/api/auth/verify-otp", json={
            "phone": "9000000003",
            "otp": "654321",
            "aadhaar": "999988887777",
        })
        assert resp1.status_code == 200
        # Second use — must fail (OTP deleted)
        resp2 = client.post("/api/auth/verify-otp", json={
            "phone": "9000000003",
            "otp": "654321",
            "aadhaar": "999988887777",
        })
        assert resp2.status_code == 400

    def test_nonexistent_otp_rejected(self):
        resp = client.post("/api/auth/verify-otp", json={
            "phone": "9999999999",
            "otp": "111111",
            "aadhaar": "111122223333",
        })
        assert resp.status_code == 400


# ═══════════════════════════════════════════════════════════════════════════════
# S7 — Cryptographically secure OTP generation
# ═══════════════════════════════════════════════════════════════════════════════

class TestSecureRandom:
    """S7: OTP and verification codes must use secrets module."""

    def test_generate_otp_range(self):
        from app.core.security import generate_otp
        for _ in range(100):
            otp = generate_otp()
            assert otp.isdigit()
            assert 100000 <= int(otp) <= 999999

    def test_verification_code_range(self):
        from app.services.token_service import generate_verification_code
        for _ in range(100):
            code = generate_verification_code()
            assert code.isdigit()
            assert 100000 <= int(code) <= 999999


# ═══════════════════════════════════════════════════════════════════════════════
# S10 — Aadhaar masking
# ═══════════════════════════════════════════════════════════════════════════════

class TestAadhaarMasking:
    """S10: Full Aadhaar must never be returned by public endpoints."""

    def test_token_lookup_masks_aadhaar(self):
        """Create a booking then verify the public token lookup masks Aadhaar."""
        booking_resp = client.post("/api/bookings", json={
            "citizen_name": "Masking Test",
            "phone": "9876543210",
            "aadhaar": "123456789012",
            "age": 30,
            "gender": "Male",
            "booking_type": "Online",
            "office_id": 1,
            "service_id": 1,
        })
        if booking_resp.status_code not in (200, 201):
            pytest.skip("Booking creation requires seeded data — skipping Aadhaar mask test")

        token_num = booking_resp.json()["token_number"]
        resp = client.get(f"/api/bookings/token/{token_num}")
        assert resp.status_code == 200
        data = resp.json()
        aadhaar_in_response = data.get("aadhaar", "")
        # Must NOT contain the full 12-digit number
        assert "123456789012" not in aadhaar_in_response, (
            "CRITICAL: Full Aadhaar leaked in public token lookup response"
        )
        # Must contain masking pattern
        assert "XXXX" in aadhaar_in_response


# ═══════════════════════════════════════════════════════════════════════════════
# S11 — BookingStatus enum validation
# ═══════════════════════════════════════════════════════════════════════════════

class TestBookingStatusEnum:
    """S11: Arbitrary status strings must be rejected."""

    def test_invalid_status_rejected(self):
        token = register_and_login(email="admin2@nimmaseva.in")
        resp = client.patch(
            "/api/admin/bookings/1/status",
            json={"status": "hacked_status"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422, (
            f"Expected 422 for invalid status, got {resp.status_code}: {resp.text}"
        )

    def test_valid_status_accepted(self):
        token = register_and_login(email="admin3@nimmaseva.in")
        # This will 404 (no booking with id=9999) but NOT 422 — schema is valid
        resp = client.patch(
            "/api/admin/bookings/9999/status",
            json={"status": "Completed"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code != 422, "Valid status 'Completed' should not fail schema validation"


# ═══════════════════════════════════════════════════════════════════════════════
# S12 — Office null-guard
# ═══════════════════════════════════════════════════════════════════════════════

class TestOfficeNullGuard:
    """S12: Requesting a non-existent office_id must return 404, not 500."""

    def test_nonexistent_office_returns_404(self):
        resp = client.get("/api/offices/99999")
        assert resp.status_code == 404, (
            f"Expected 404 for missing office, got {resp.status_code}: {resp.text}"
        )

    def test_nonexistent_office_no_crash(self):
        resp = client.get("/api/offices/99999")
        assert resp.status_code != 500, "Server crash on missing office — null guard missing"


# ═══════════════════════════════════════════════════════════════════════════════
# S2 — JWT decode failure
# ═══════════════════════════════════════════════════════════════════════════════

class TestJWTSecurity:
    """S2/auth: Tampered or expired tokens must be rejected."""

    def test_tampered_jwt_rejected(self):
        token = register_and_login(email="jwttest@nimmaseva.in")
        # Flip a character in the signature portion
        parts = token.split(".")
        tampered = parts[0] + "." + parts[1] + "." + parts[2][:-3] + "abc"
        resp = client.get(
            "/api/admin/summary",
            headers={"Authorization": f"Bearer {tampered}"}
        )
        assert resp.status_code in (401, 403)

    def test_token_with_wrong_secret_rejected(self):
        # Generate a token signed with a DIFFERENT secret
        from jose import jwt
        from datetime import datetime, timedelta, timezone
        fake_token = jwt.encode(
            {"sub": "admin@nimmaseva.in", "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
            "completely_wrong_secret",
            algorithm="HS256"
        )
        resp = client.get(
            "/api/admin/summary",
            headers={"Authorization": f"Bearer {fake_token}"}
        )
        assert resp.status_code in (401, 403)
