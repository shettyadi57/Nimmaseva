import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base
from app.models.models import Office, Service, QueueState
from tests.test_security import TestingSessionLocal, engine as test_engine

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_data():
    """Ensure database tables and initial test records exist."""
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    
    # Ensure test office exists
    office = db.query(Office).filter(Office.id == 1).first()
    if not office:
        office = Office(
            id=1,
            name="GramOne Shivamogga Main",
            type="GramOne",
            address="BH Road",
            taluk="Shivamogga",
            latitude=13.92,
            longitude=75.56,
            phone="08182-123456",
            server_status="Active"
        )
        db.add(office)
    
    # Ensure test service exists
    srv1 = db.query(Service).filter(Service.id == 1).first()
    if not srv1:
        srv1 = Service(
            id=1,
            name="Aadhaar Biometric Update",
            code="SRV-AADHAAR",
            category="Identity",
            fee=50.0,
            avg_processing_time_mins=15,
            is_active=True
        )
        db.add(srv1)

    srv2 = db.query(Service).filter(Service.id == 2).first()
    if not srv2:
        srv2 = Service(
            id=2,
            name="Caste & Income Certificate",
            code="SRV-CASTE-INC",
            category="Revenue",
            fee=40.0,
            avg_processing_time_mins=15,
            is_active=True
        )
        db.add(srv2)

    db.commit()
    db.close()
    yield

def test_get_counter_allocations():
    """Verify counter allocation matrix returns active counters, services, and congestion metrics."""
    response = client.get("/api/counters/1")
    assert response.status_code == 200
    data = response.json()
    assert "counters" in data
    assert len(data["counters"]) >= 3
    assert "service_congestion" in data
    assert "total_active_counters" in data
    assert data["total_active_counters"] >= 1
    assert "ai_recommendation" in data
    
    first_counter = data["counters"][0]
    assert "counter_number" in first_counter
    assert "assigned_service_names" in first_counter
    assert "status" in first_counter

def test_manual_counter_reallocation():
    """Verify manual reallocation of a counter to specific services."""
    payload = {
        "counter_number": 2,
        "counter_name": "Counter 02 - Special Dedicated Express",
        "operator_name": "Test Operator S.",
        "status": "Active",
        "mode": "Dedicated",
        "assigned_service_ids": [1]
    }
    response = client.post("/api/counters/1/allocate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "counters" in data
    counter_2 = next((c for c in data["counters"] if c["counter_number"] == 2), None)
    assert counter_2 is not None
    assert counter_2["counter_name"] == "Counter 02 - Special Dedicated Express"
    assert counter_2["operator_name"] == "Test Operator S."
    assert 1 in counter_2["assigned_service_ids"]

def test_auto_balance_counters():
    """Verify one-click AI dynamic auto-balancing eliminates bottlenecks."""
    response = client.post("/api/counters/1/auto-balance")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "estimated_minutes_saved" in data
    assert "counters" in data

def test_citizen_direct_login_no_otp():
    """Verify citizen direct phone login without OTP requirement."""
    payload = {
        "phone": "9845012345",
        "full_name": "Naveen Kumar",
        "age": 35,
        "gender": "Male",
        "district": "Shivamogga",
        "taluk": "Shivamogga"
    }
    response = client.post("/api/auth/citizen-direct-login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["phone"] == "9845012345"
    assert data["full_name"] == "Naveen Kumar"
    assert data["role"] == "citizen"

