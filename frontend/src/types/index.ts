export interface Office {
  id: number;
  name: string;
  type: 'GramOne' | 'SevaSindhu';
  address: string;
  district: string;
  taluk: string;
  village?: string;
  latitude: number;
  longitude: number;
  phone: string;
  working_hours: string;
  lunch_break: string;
  max_daily_tokens: number;
  server_status: 'Active' | 'Busy' | 'Maintenance' | 'Unavailable';
  current_queue_count?: number;
  remaining_tokens?: number;
  distance_km?: number;
  est_travel_time_mins?: number;
}

export interface Service {
  id: number;
  name: string;
  code: string;
  category: string;
  fee: number;
  avg_processing_time_mins: number;
  daily_capacity: number;
  is_active: boolean;
  server_status: 'Active' | 'Down' | 'Maintenance';
  required_documents: string[];
  description?: string;
}

export interface Booking {
  id: number;
  token_number: string;
  verification_code: string;
  citizen_name: string;
  phone: string;
  aadhaar: string;
  age: number;
  gender: string;
  is_priority: boolean;
  priority_reason?: string;
  booking_type: string;
  office_id: number;
  service_id: number;
  booking_date: string;
  visit_date: string;
  visit_time: string;
  status: 'Pending' | 'Called' | 'In Progress' | 'Completed' | 'Cancelled' | 'Skipped' | 'Transferred' | 'Approaching Counter';
  counter_number?: number;
  amount_paid: number;
  tatkal_probability: number;
  created_at: string;
  office_name?: string;
  service_name?: string;
  people_ahead?: number;
  avg_wait_mins?: number;
  reminder_sent?: boolean;
  reminder_time?: string;
  acknowledged?: boolean;
}

export interface QueueState {
  office_id: number;
  current_token: string;
  next_token: string;
  active_counters: number;
  is_paused: boolean;
  total_waiting: number;
  total_completed_today: number;
  updated_at: string;
}

export interface Scheme {
  id: number;
  title: string;
  category: string;
  min_age: number;
  max_age: number;
  gender_eligibility: string;
  max_income: number;
  target_occupation: string;
  district: string;
  description: string;
  required_documents: string[];
  benefits: string;
  apply_link?: string;
}

export interface AnalyticsSummary {
  today_bookings: number;
  today_revenue: number;
  completed_tokens: number;
  cancelled_tokens: number;
  pending_tokens: number;
  walkin_tokens: number;
  online_tokens: number;
  priority_tokens: number;
  current_queue_len: number;
  avg_wait_time_mins: number;
  no_show_percentage: number;
  most_requested_service: string;
  peak_hour: string;
}

export interface CitizenProfile {
  fullName: string;
  phone: string;
  aadhaar: string;
  age: number | '';
  gender: string;
  district: string;
  taluk: string;
  villageOrAddress: string;
  email?: string;
  isVerified?: boolean;
  createdAt?: string;
}

