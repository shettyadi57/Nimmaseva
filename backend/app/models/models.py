from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    aadhaar = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    role = Column(String, default="citizen")  # admin, operator, citizen
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Office(Base):
    __tablename__ = "offices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # GramOne, SevaSindhu
    address = Column(String, nullable=False)
    district = Column(String, default="Shivamogga")
    taluk = Column(String, nullable=False)
    village = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String, nullable=False)
    working_hours = Column(String, default="09:00 AM - 05:00 PM")
    lunch_break = Column(String, default="12:00 PM - 01:00 PM")
    max_daily_tokens = Column(Integer, default=100)
    server_status = Column(String, default="Active")  # Active, Busy, Maintenance, Unavailable
    
    # Token allocation config ratios
    offline_start_range = Column(String, default="1-10,41-50")
    online_start_range = Column(String, default="11-40,51-80")
    priority_range = Column(String, default="81-90")
    emergency_range = Column(String, default="91-100")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    bookings = relationship("Booking", back_populates="office")
    queue_state = relationship("QueueState", back_populates="office", uselist=False)

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, default="General")
    fee = Column(Float, default=0.0)
    avg_processing_time_mins = Column(Integer, default=15)
    daily_capacity = Column(Integer, default=50)
    is_active = Column(Boolean, default=True)
    server_status = Column(String, default="Active")  # Active, Down, Maintenance
    required_documents = Column(JSON, default=list)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    bookings = relationship("Booking", back_populates="service")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    token_number = Column(String, index=True, nullable=False)
    verification_code = Column(String, nullable=False)
    citizen_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    aadhaar = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    is_priority = Column(Boolean, default=False)
    priority_reason = Column(String, nullable=True)  # Senior Citizen, Disability, Pregnant, Emergency
    booking_type = Column(String, default="Online")  # Online, Offline, Priority, Emergency
    
    office_id = Column(Integer, ForeignKey("offices.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    
    booking_date = Column(String, nullable=False)  # YYYY-MM-DD
    visit_date = Column(String, nullable=False)    # YYYY-MM-DD
    visit_time = Column(String, nullable=False)    # HH:MM AM/PM
    
    status = Column(String, default="Pending")  # Pending, Called, In Progress, Completed, Cancelled, Transferred
    counter_number = Column(Integer, nullable=True)
    amount_paid = Column(Float, default=0.0)
    tatkal_probability = Column(Integer, default=95)  # 0-100%
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    office = relationship("Office", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")

class QueueState(Base):
    __tablename__ = "queue_states"

    id = Column(Integer, primary_key=True, index=True)
    office_id = Column(Integer, ForeignKey("offices.id"), unique=True, nullable=False)
    current_token = Column(String, default="None")
    next_token = Column(String, default="None")
    active_counters = Column(Integer, default=3)
    is_paused = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    office = relationship("Office", back_populates="queue_state")

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    min_age = Column(Integer, default=0)
    max_age = Column(Integer, default=120)
    gender_eligibility = Column(String, default="All")  # All, Male, Female, Other
    max_income = Column(Float, default=1000000.0)
    target_occupation = Column(String, default="All")   # All, Farmer, Student, Artisan, Unemployed
    district = Column(String, default="Shivamogga")
    description = Column(Text, nullable=False)
    required_documents = Column(JSON, default=list)
    benefits = Column(Text, nullable=False)
    apply_link = Column(String, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, default="System")
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
