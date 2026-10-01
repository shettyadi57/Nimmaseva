from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime
import re
import html

def sanitize_string(v: str) -> str:
    if not isinstance(v, str):
        return v
    # Escape HTML special characters to prevent XSS
    return html.escape(v.strip())

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    role: str

class LoginRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    email_or_phone: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6, max_length=64)

    @field_validator('email_or_phone')
    @classmethod
    def sanitize_login_id(cls, v: str) -> str:
        return sanitize_string(v)

class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')

    full_name: str = Field(..., min_length=2, max_length=100)
    email_or_phone: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=8, max_length=64)
    employee_id: Optional[str] = Field(None, max_length=30)
    department: Optional[str] = Field("Revenue & E-Governance", max_length=100)
    office_id: Optional[int] = Field(1, ge=1)
    # Note: 'role' is intentionally NOT accepted from callers — see auth.py S5 fix

    @field_validator('full_name', 'email_or_phone', 'employee_id', 'department')
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_string(v) if v else v

class OTPRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    phone: str = Field(..., min_length=10, max_length=15)
    aadhaar: Optional[str] = Field(None, max_length=20)

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r'\D', '', v)
        if len(cleaned) < 10 or len(cleaned) > 12:
            raise ValueError('Phone number must contain 10 numeric digits.')
        return cleaned

class OTPVerifyRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=6, max_length=6)
    aadhaar: Optional[str] = Field(None, max_length=20)  # Made optional; only required if Aadhaar verification is desired

    @field_validator('otp')
    @classmethod
    def validate_otp(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('OTP must be a 6-digit number.')
        return v


class CitizenOTPVerifyRequest(BaseModel):
    """Used for phone-OTP based citizen login + auto account creation."""
    model_config = ConfigDict(extra='forbid')

    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=6, max_length=6)
    full_name: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = Field(None, max_length=20)
    district: Optional[str] = Field(None, max_length=100)
    taluk: Optional[str] = Field(None, max_length=100)
    village_or_address: Optional[str] = Field(None, max_length=300)
    aadhaar: Optional[str] = Field(None, max_length=20)

    @field_validator('otp')
    @classmethod
    def validate_otp(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('OTP must be a 6-digit number.')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r'\D', '', v)
        if len(cleaned) < 10 or len(cleaned) > 12:
            raise ValueError('Phone number must contain 10 numeric digits.')
        return cleaned

    @field_validator('full_name', 'district', 'taluk', 'village_or_address')
    @classmethod
    def sanitize_citizen_fields(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_string(v) if v else v


class CitizenDirectLoginRequest(BaseModel):
    """Direct phone-based login/registration without requiring OTP."""
    phone: str = Field(..., min_length=10, max_length=15)
    full_name: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = Field(None, max_length=20)
    district: Optional[str] = Field(None, max_length=100)
    taluk: Optional[str] = Field(None, max_length=100)
    village_or_address: Optional[str] = Field(None, max_length=300)
    aadhaar: Optional[str] = Field(None, max_length=20)

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r'\D', '', v)
        if len(cleaned) < 10 or len(cleaned) > 12:
            raise ValueError('Phone number must contain 10 numeric digits.')
        return cleaned

    @field_validator('full_name', 'district', 'taluk', 'village_or_address')
    @classmethod
    def sanitize_citizen_fields(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_string(v) if v else v


class CitizenTokenResponse(BaseModel):
    """Response after successful citizen OTP verification."""
    access_token: str
    token_type: str
    is_new_account: bool
    citizen_id: int
    phone: str
    full_name: str
    role: str

class BookingStatusUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')

    # S11 fix: only valid state-machine transitions are accepted
    status: Literal[
        "Pending", "Called", "In Progress", "Completed",
        "Cancelled", "Transferred", "Skipped", "No-Show"
    ]
    counter_number: Optional[int] = Field(None, ge=1, le=50)

class WalkinBookingCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    citizen_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    service_id: int = Field(..., ge=1)
    office_id: int = Field(..., ge=1)
    is_priority: bool = False
    priority_reason: Optional[str] = Field(None, max_length=100)

    @field_validator('citizen_name', 'priority_reason')
    @classmethod
    def sanitize_walkin(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_string(v) if v else v

# Office Schemas
class OfficeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    type: str = Field(..., max_length=50)
    address: str = Field(..., min_length=5, max_length=300)
    district: str = Field("Shivamogga", max_length=100)
    taluk: str = Field(..., min_length=2, max_length=100)
    village: Optional[str] = Field(None, max_length=100)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    phone: str = Field(..., min_length=7, max_length=20)
    working_hours: str = Field("09:00 AM - 05:00 PM", max_length=50)
    lunch_break: str = Field("12:00 PM - 01:00 PM", max_length=50)
    max_daily_tokens: int = Field(100, ge=1, le=1000)
    server_status: str = Field("Active", max_length=30)

class OfficeCreate(OfficeBase):
    model_config = ConfigDict(extra='forbid')

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
    name: str = Field(..., min_length=2, max_length=150)
    code: str = Field(..., min_length=2, max_length=30)
    category: str = Field("General", max_length=100)
    fee: float = Field(0.0, ge=0.0, le=10000.0)
    avg_processing_time_mins: int = Field(15, ge=1, le=300)
    daily_capacity: int = Field(50, ge=1, le=2000)
    is_active: bool = True
    server_status: str = Field("Active", max_length=30)
    required_documents: List[str] = []
    description: Optional[str] = Field(None, max_length=500)

class ServiceCreate(ServiceBase):
    model_config = ConfigDict(extra='forbid')

class ServiceOut(ServiceBase):
    id: int

    class Config:
        from_attributes = True

# Booking Schemas
class BookingCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    citizen_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    aadhaar: str = Field(..., min_length=12, max_length=20)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., max_length=20)
    is_priority: bool = False
    priority_reason: Optional[str] = Field(None, max_length=100)
    booking_type: str = Field("Online", max_length=20)
    office_id: int = Field(..., ge=1)
    service_id: int = Field(..., ge=1)

    @field_validator('citizen_name', 'priority_reason')
    @classmethod
    def sanitize_booking(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_string(v) if v else v

    @field_validator('phone')
    @classmethod
    def validate_phone_num(cls, v: str) -> str:
        cleaned = re.sub(r'\D', '', v)
        if len(cleaned) < 10 or len(cleaned) > 12:
            raise ValueError('Phone number must be a valid 10-digit number.')
        return cleaned

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
    estimated_wait_mins: Optional[int] = 15
    estimated_call_time: Optional[str] = None
    service_processing_mins: Optional[int] = 15
    total_estimated_duration_mins: Optional[int] = 30
    estimated_completion_time: Optional[str] = None
    time_saved_by_dynamic_allocation_mins: Optional[int] = 0
    active_counters_for_service: Optional[int] = 1
    qr_code_data_url: Optional[str] = None

    class Config:
        from_attributes = True

# Dynamic Counter Allocation Schemas
class CounterAllocationItem(BaseModel):
    counter_number: int
    counter_name: str
    operator_name: str
    status: str = "Active"  # Active, Busy, Break, Closed
    mode: str = "Dynamic Auto-Balance"  # Dedicated, Dynamic Auto-Balance, Priority Express
    assigned_service_ids: List[int] = []
    assigned_service_names: List[str] = []
    current_token: Optional[str] = None
    queue_count: int = 0
    estimated_wait_mins: int = 0
    is_overflow: bool = False

class ServiceCongestionMetric(BaseModel):
    service_id: int
    service_name: str
    pending_count: int
    avg_processing_mins: int
    total_wait_mins: int
    allocated_counters: int
    congestion_level: str  # Normal, Moderate, High Congestion

class DynamicCounterMatrixOut(BaseModel):
    office_id: int
    office_name: str
    total_active_counters: int
    total_pending_queue: int
    counters: List[CounterAllocationItem]
    service_congestion: List[ServiceCongestionMetric]
    ai_recommendation: Optional[str] = None
    total_time_saved_today_mins: int = 0

class CounterAllocationUpdate(BaseModel):
    counter_number: int
    counter_name: Optional[str] = None
    operator_name: Optional[str] = None
    status: Optional[str] = "Active"
    mode: Optional[str] = "Dynamic Auto-Balance"
    assigned_service_ids: List[int] = []

class AutoBalanceResponse(BaseModel):
    office_id: int
    message: str
    estimated_minutes_saved: int
    counters: List[CounterAllocationItem]
    reallocated_count: int = 0

# Queue State & Control
class QueueUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    action: str = Field(..., max_length=30)
    counter_number: Optional[int] = Field(1, ge=1, le=50)
    target_token: Optional[str] = Field(None, max_length=50)
    transfer_office_id: Optional[int] = Field(None, ge=1)

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
    model_config = ConfigDict(extra='forbid')
    
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = Field("All", max_length=20)
    income: Optional[float] = Field(None, ge=0.0)
    occupation: Optional[str] = Field("All", max_length=100)
    category: Optional[str] = Field("All", max_length=100)
    district: Optional[str] = Field("Shivamogga", max_length=100)

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
