from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    role: str

class LoginRequest(BaseModel):
    email_or_phone: str
    password: str

class OTPRequest(BaseModel):
    phone: str
    aadhaar: Optional[str] = None

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str
    aadhaar: str

# Office Schemas
class OfficeBase(BaseModel):
    name: str
    type: str  # GramOne, SevaSindhu
    address: str
    district: str = "Shivamogga"
    taluk: str
    village: Optional[str] = None
    latitude: float
    longitude: float
    phone: str
    working_hours: str = "09:00 AM - 05:00 PM"
    lunch_break: str = "12:00 PM - 01:00 PM"
    max_daily_tokens: int = 100
    server_status: str = "Active"

class OfficeCreate(OfficeBase):
    pass

class OfficeOut(OfficeBase):
    id: int
    current_queue_count: Optional[int] = 0
    remaining_tokens: Optional[int] = 100
    distance_km: Optional[float] = None
    est_travel_time_mins: Optional[int] = None

    class Config:
        from_attributes = True

# Service Schemas
class ServiceBase(BaseModel):
    name: str
    code: str
    category: str = "General"
    fee: float = 0.0
    avg_processing_time_mins: int = 15
    daily_capacity: int = 50
    is_active: bool = True
    server_status: str = "Active"  # Active, Down, Maintenance
    required_documents: List[str] = []
    description: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceOut(ServiceBase):
    id: int

    class Config:
        from_attributes = True

# Booking Schemas
class BookingCreate(BaseModel):
    citizen_name: str
    phone: str
    aadhaar: str
    age: int
    gender: str
    is_priority: bool = False
    priority_reason: Optional[str] = None  # Senior Citizen, Disability, Pregnant, Emergency
    booking_type: str = "Online"          # Online, Offline
    office_id: int
    service_id: int

class BookingOut(BaseModel):
    id: int
    token_number: str
    verification_code: str
    citizen_name: str
    phone: str
    aadhaar: str
    age: int
    gender: str
    is_priority: bool
    priority_reason: Optional[str]
    booking_type: str
    office_id: int
    service_id: int
    booking_date: str
    visit_date: str
    visit_time: str
    status: str
    counter_number: Optional[int]
    amount_paid: float
    tatkal_probability: int
    created_at: datetime
    office_name: Optional[str] = None
    service_name: Optional[str] = None
    people_ahead: Optional[int] = 0
    avg_wait_mins: Optional[int] = 15

    class Config:
        from_attributes = True

# Queue State & Control
class QueueUpdate(BaseModel):
    action: str  # call_next, skip, recall, complete, cancel, transfer, pause, resume
    counter_number: Optional[int] = 1
    target_token: Optional[str] = None
    transfer_office_id: Optional[int] = None

class QueueStateOut(BaseModel):
    office_id: int
    current_token: str
    next_token: str
    active_counters: int
    is_paused: bool
    total_waiting: int
    total_completed_today: int
    updated_at: datetime

# Scheme Search
class SchemeSearchRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = "All"
    income: Optional[float] = None
    occupation: Optional[str] = "All"
    category: Optional[str] = "All"
    district: Optional[str] = "Shivamogga"

class SchemeOut(BaseModel):
    id: int
    title: str
    category: str
    min_age: int
    max_age: int
    gender_eligibility: str
    max_income: float
    target_occupation: str
    district: str
    description: str
    required_documents: List[str]
    benefits: str
    apply_link: Optional[str]

    class Config:
        from_attributes = True

# Analytics Out
class AnalyticsSummary(BaseModel):
    today_bookings: int
    today_revenue: float
    completed_tokens: int
    cancelled_tokens: int
    pending_tokens: int
    walkin_tokens: int
    online_tokens: int
    priority_tokens: int
    current_queue_len: int
    avg_wait_time_mins: float
    no_show_percentage: float
    most_requested_service: str
    peak_hour: str
