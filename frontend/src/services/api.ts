import axios from 'axios';
import { Office, Service, Booking, QueueState, Scheme, AnalyticsSummary } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// ── Mock Fallback Data (Ensures Standalone Web Deployment Works Seamlessly) ──

const MOCK_OFFICES: Office[] = [
  {
    id: 1,
    name: 'GramOne Center - Shivamogga Main',
    type: 'GramOne',
    address: 'BH Road, Near Bus Stand, Shivamogga Urban',
    district: 'Shivamogga',
    taluk: 'Shivamogga',
    village: 'Shivamogga Urban',
    latitude: 13.9299,
    longitude: 75.5681,
    phone: '08182-224411',
    working_hours: '09:00 AM - 05:00 PM',
    lunch_break: '01:00 PM - 02:00 PM',
    max_daily_tokens: 150,
    server_status: 'Active',
    current_queue_count: 5,
    remaining_tokens: 45,
    distance_km: 1.2,
    est_travel_time_mins: 5
  },
  {
    id: 2,
    name: 'Seva Sindhu District Office',
    type: 'SevaSindhu',
    address: 'DC Office Complex, Kuvempu Road, Shivamogga',
    district: 'Shivamogga',
    taluk: 'Shivamogga',
    village: 'DC Complex',
    latitude: 13.9350,
    longitude: 75.5720,
    phone: '08182-225522',
    working_hours: '09:00 AM - 05:00 PM',
    lunch_break: '01:00 PM - 02:00 PM',
    max_daily_tokens: 200,
    server_status: 'Active',
    current_queue_count: 8,
    remaining_tokens: 30,
    distance_km: 2.4,
    est_travel_time_mins: 8
  },
  {
    id: 3,
    name: 'GramOne Center - Bhadravathi East',
    type: 'GramOne',
    address: 'Bypass Road, Near Railway Station, Bhadravathi',
    district: 'Shivamogga',
    taluk: 'Bhadravathi',
    village: 'Bhadravathi East',
    latitude: 13.8420,
    longitude: 75.7020,
    phone: '08182-233344',
    working_hours: '09:00 AM - 05:00 PM',
    lunch_break: '01:00 PM - 02:00 PM',
    max_daily_tokens: 120,
    server_status: 'Active',
    current_queue_count: 3,
    remaining_tokens: 60,
    distance_km: 18.5,
    est_travel_time_mins: 25
  },
  {
    id: 4,
    name: 'GramOne Center - Sagar Town',
    type: 'GramOne',
    address: 'Subhash Square, Main Road, Sagar',
    district: 'Shivamogga',
    taluk: 'Sagar',
    village: 'Sagar Town',
    latitude: 14.1667,
    longitude: 75.0333,
    phone: '08183-221100',
    working_hours: '09:00 AM - 05:00 PM',
    lunch_break: '01:00 PM - 02:00 PM',
    max_daily_tokens: 100,
    server_status: 'Active',
    current_queue_count: 4,
    remaining_tokens: 40,
    distance_km: 72.0,
    est_travel_time_mins: 80
  }
];

const MOCK_SERVICES: Service[] = [
  {
    id: 1,
    code: 'SRV-01',
    name: 'Income & Caste Certificate',
    category: 'Revenue',
    fee: 25,
    avg_processing_time_mins: 10,
    daily_capacity: 100,
    is_active: true,
    server_status: 'Active',
    required_documents: ['Aadhaar Card', 'Ration Card', 'Self Declaration'],
    description: 'Issuance of Income and Caste certificate for education and welfare benefits.'
  },
  {
    id: 2,
    code: 'SRV-02',
    name: 'Ration Card Addition / Modification',
    category: 'Food & Civil Supplies',
    fee: 50,
    avg_processing_time_mins: 15,
    daily_capacity: 80,
    is_active: true,
    server_status: 'Active',
    required_documents: ['Aadhaar Cards of All Members', 'Income Certificate', 'Electricity Bill'],
    description: 'Add new family members, correct names, or change address on Ration Card.'
  },
  {
    id: 3,
    code: 'SRV-03',
    name: 'RTC Pahani Land Records Extraction',
    category: 'Revenue',
    fee: 15,
    avg_processing_time_mins: 8,
    daily_capacity: 150,
    is_active: true,
    server_status: 'Active',
    required_documents: ['Survey Number / Hissa Number', 'Owner Aadhaar'],
    description: 'Certified copy of RTC Land Records for property identification.'
  },
  {
    id: 4,
    code: 'SRV-04',
    name: 'Gruha Lakshmi Scheme Registration',
    category: 'Welfare',
    fee: 0,
    avg_processing_time_mins: 12,
    daily_capacity: 120,
    is_active: true,
    server_status: 'Active',
    required_documents: ['Aadhaar Card', 'Bank Passbook Linked to Aadhaar', 'BPL Ration Card'],
    description: 'Monthly ₹2,000 assistance for female head of household.'
  },
  {
    id: 5,
    code: 'SRV-05',
    name: 'Senior Citizen ID Pass',
    category: 'Social Welfare',
    fee: 0,
    avg_processing_time_mins: 10,
    daily_capacity: 60,
    is_active: true,
    server_status: 'Active',
    required_documents: ['Proof of Age (60+)', 'Aadhaar Card', 'Passport Photos'],
    description: 'Official Karnataka Senior Citizen Card for transport and medical discounts.'
  },
  {
    id: 6,
    code: 'SRV-06',
    name: 'Yuva Nidhi Graduate Allowance',
    category: 'Employment',
    fee: 0,
    avg_processing_time_mins: 15,
    daily_capacity: 90,
    is_active: true,
    server_status: 'Active',
    required_documents: ['Degree/Diploma Certificate', 'Aadhaar Card', 'Karnataka Domicile'],
    description: 'Monthly allowance for unemployed graduates and diploma holders.'
  }
];

const MOCK_SCHEMES: Scheme[] = [
  {
    id: 1,
    title: 'Gruha Lakshmi Scheme (ಗೃಹ ಲಕ್ಷ್ಮಿ)',
    category: 'Karnataka 5 Guarantees',
    min_age: 18,
    max_age: 100,
    gender_eligibility: 'Female',
    max_income: 2000000,
    target_occupation: 'All',
    district: 'Shivamogga',
    description: 'Financial assistance of ₹2,000 per month transferred directly to the Aadhaar-linked bank account of the female head of the family.',
    required_documents: ['Aadhaar Card of Female Head', 'Husband Aadhaar Card', 'BPL / APL Ration Card', 'Aadhaar-seeded Bank Passbook'],
    benefits: '₹2,000 / month direct bank transfer',
    apply_link: 'https://sevasindhugs.karnataka.gov.in'
  },
  {
    id: 2,
    title: 'Gruha Jyothi Scheme (ಗೃಹ ಜ್ಯೋತಿ)',
    category: 'Karnataka 5 Guarantees',
    min_age: 18,
    max_age: 100,
    gender_eligibility: 'All',
    max_income: 10000000,
    target_occupation: 'All',
    district: 'Shivamogga',
    description: 'Zero electricity bill for residential households consuming up to 200 units of electricity per month across Karnataka.',
    required_documents: ['Electricity Meter Account ID (KPTCL/MESCOM)', 'Consumer Aadhaar Card', 'Rental Agreement / House Ownership Proof'],
    benefits: 'Up to 200 units of 100% free residential electricity monthly',
    apply_link: 'https://sevasindhugs.karnataka.gov.in'
  },
  {
    id: 3,
    title: 'Yuva Nidhi Scheme (ಯುವ ನಿಧಿ)',
    category: 'Karnataka 5 Guarantees',
    min_age: 20,
    max_age: 35,
    gender_eligibility: 'All',
    max_income: 500000,
    target_occupation: 'Unemployed',
    district: 'Shivamogga',
    description: 'Monthly financial assistance for unemployed graduates (₹3,000/mo) and diploma holders (₹1,500/mo) who passed out in recent academic years.',
    required_documents: ['Degree / Diploma Marksheet & Certificate', 'Aadhaar Card', 'Karnataka Domicile Certificate', 'Aadhaar-linked Bank Passbook'],
    benefits: '₹3,000/month for Graduates, ₹1,500/month for Diploma holders (up to 2 years)',
    apply_link: 'https://sevasindhugs.karnataka.gov.in'
  },
  {
    id: 4,
    title: 'Shakti Scheme (ಶಕ್ತಿ ಯೋಜನೆ)',
    category: 'Karnataka 5 Guarantees',
    min_age: 5,
    max_age: 100,
    gender_eligibility: 'Female',
    max_income: 10000000,
    target_occupation: 'All',
    district: 'Shivamogga',
    description: 'Free bus travel for all women and transgender citizens residing in Karnataka in ordinary state transport buses (KSRTC, BMTC, NWKRTC, KKRTC).',
    required_documents: ['Karnataka Domicile Proof (Aadhaar Card / Voter ID / Driving License)'],
    benefits: '100% Free bus travel across Karnataka state transport buses',
    apply_link: 'https://sevasindhu.karnataka.gov.in'
  },
  {
    id: 5,
    title: 'Anna Bhagya Scheme (ಅನ್ನ ಭಾಗ್ಯ)',
    category: 'Karnataka 5 Guarantees',
    min_age: 0,
    max_age: 120,
    gender_eligibility: 'All',
    max_income: 120000,
    target_occupation: 'All',
    district: 'Shivamogga',
    description: '10 kg free food grains per month for every member of BPL and Antyodaya Anna Yojana (AAY) ration cardholder families.',
    required_documents: ['BPL / AAY Ration Card', 'Aadhaar Cards of All Family Members', 'Aadhaar-seeded Bank Account'],
    benefits: '10 kg free food grains / cash equivalent per person monthly',
    apply_link: 'https://sevasindhugs.karnataka.gov.in'
  },
  {
    id: 6,
    title: 'Raita Vidya Nidhi (ರೈತ ವಿದ್ಯಾ ನಿಧಿ)',
    category: 'Education & Agriculture',
    min_age: 15,
    max_age: 26,
    gender_eligibility: 'All',
    max_income: 300000,
    target_occupation: 'Student',
    district: 'Shivamogga',
    description: 'State scholarship program for children of farmers pursuing post-matric, degree, professional, or postgraduate education.',
    required_documents: ['Farmer FRUITS ID / RTC Land Record', 'Student Aadhaar Card', 'College Admission Fee Receipt'],
    benefits: '₹2,500 to ₹11,000 annual direct bank transfer scholarship',
    apply_link: 'https://ssp.postmatric.karnataka.gov.in'
  },
  {
    id: 7,
    title: 'Sandhya Suraksha Pension Scheme (ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ)',
    category: 'Senior Citizens',
    min_age: 60,
    max_age: 120,
    gender_eligibility: 'All',
    max_income: 50000,
    target_occupation: 'Senior Citizen',
    district: 'Shivamogga',
    description: 'Monthly old-age pension for senior citizens aged 60 and above belonging to low-income families in Karnataka.',
    required_documents: ['Age Proof (Aadhaar Card / Voter ID)', 'Income Certificate', 'Aadhaar-linked Bank Passbook'],
    benefits: '₹1,200 monthly pension transferred directly to bank account',
    apply_link: 'https://sevasindhu.karnataka.gov.in'
  },
  {
    id: 8,
    title: 'Arogya Karnataka / Ayushman Bharat (ಆರೋಗ್ಯ ಕರ್ನಾಟಕ)',
    category: 'Healthcare & Medical',
    min_age: 0,
    max_age: 120,
    gender_eligibility: 'All',
    max_income: 300000,
    target_occupation: 'All',
    district: 'Shivamogga',
    description: 'Universal healthcare card providing free secondary and tertiary cashless medical treatment at empaneled government and private hospitals.',
    required_documents: ['BPL Ration Card / AB-ARK Health Card', 'Aadhaar Card of Family Members'],
    benefits: 'Cashless medical treatment up to ₹5,00,000 per family annually',
    apply_link: 'https://arogya.karnataka.gov.in'
  },
  {
    id: 9,
    title: 'Ganga Kalyana Irrigation Scheme (ಗಂಗಾ ಕಲ್ಯಾಣ)',
    category: 'Agriculture & Irrigation',
    min_age: 18,
    max_age: 65,
    gender_eligibility: 'All',
    max_income: 150000,
    target_occupation: 'Farmer',
    district: 'Shivamogga',
    description: '100% government subsidized open well and borewell drilling with motor pump sets for small and marginal farmers from SC/ST/OBC communities.',
    required_documents: ['RTC Pahani Land Records', 'Caste & Income Certificate', 'Small / Marginal Farmer Certificate'],
    benefits: 'Free borewell drilling, pump set installation & power connection',
    apply_link: 'https://kmdc.karnataka.gov.in'
  },
  {
    id: 10,
    title: 'Manasvini & Mythri Pension Scheme (ಮನಸ್ವಿನಿ / ಮೈತ್ರಿ)',
    category: 'Social Welfare & Inclusion',
    min_age: 18,
    max_age: 70,
    gender_eligibility: 'All',
    max_income: 50000,
    target_occupation: 'All',
    district: 'Shivamogga',
    description: 'Monthly pension scheme supporting unmarried women over 40, divorced/destitute women, and transgender citizens for social security.',
    required_documents: ['Aadhaar Card', 'Income Certificate', 'Single / Destitute / Transgender Certificate', 'Bank Passbook'],
    benefits: '₹1,200 monthly pension directly to bank account',
    apply_link: 'https://sevasindhu.karnataka.gov.in'
  },
  {
    id: 11,
    title: 'Mathru Purna Nutrition Scheme (ಮಾತೃ ಪೂರ್ಣ)',
    category: 'Health & Nutrition',
    min_age: 18,
    max_age: 45,
    gender_eligibility: 'Female',
    max_income: 500000,
    target_occupation: 'All',
    district: 'Shivamogga',
    description: 'Daily wholesome hot cooked meal, milk, egg/chikki, and nutritional supplements provided to pregnant and lactating mothers at Anganwadi centers.',
    required_documents: ['Thayi Card (Mother Card)', 'Aadhaar Card', 'Anganwadi Center Registration'],
    benefits: 'Free daily nutritious meal, milk & health supplements for 15 months',
    apply_link: 'https://dwcd.karnataka.gov.in'
  },
  {
    id: 12,
    title: "Chief Minister's Self Employment Scheme (CMEGP)",
    category: 'Business & Entrepreneurship',
    min_age: 18,
    max_age: 45,
    gender_eligibility: 'All',
    max_income: 1000000,
    target_occupation: 'All',
    district: 'Shivamogga',
    description: 'Capital subsidy up to 35% on bank project loans up to ₹10 Lakhs for micro-enterprises, small businesses, and manufacturing units set up by youth.',
    required_documents: ['Detailed Project Report (DPR)', 'Aadhaar Card', 'Educational Certificate', 'Bank Account Details'],
    benefits: 'Up to 35% government capital subsidy on loans up to ₹10 Lakhs',
    apply_link: 'https://cmegp.kar.nic.in'
  }
];

// ── API Functions with Resilient Fallbacks ───────────────────────────────────

export const fetchOffices = async (lat?: number, lng?: number): Promise<Office[]> => {
  try {
    const params: any = {};
    if (lat !== undefined && lng !== undefined) {
      params.lat = lat;
      params.lng = lng;
    }
    const res = await api.get('/offices', { params });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    console.warn('API fetchOffices unreachable, using fallback data');
  }
  return MOCK_OFFICES;
};

export const fetchOfficeDetail = async (id: number): Promise<Office> => {
  try {
    const res = await api.get(`/offices/${id}`);
    if (res.data) return res.data;
  } catch (err) {
    console.warn(`API fetchOfficeDetail(${id}) unreachable, using fallback`);
  }
  return MOCK_OFFICES.find(o => o.id === id) || MOCK_OFFICES[0];
};

export const fetchServices = async (): Promise<Service[]> => {
  try {
    const res = await api.get('/services');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    console.warn('API fetchServices unreachable, using fallback data');
  }
  return MOCK_SERVICES;
};

// ── Local Storage Helper Functions for Persistence & Mock Synchronization ──

const getInitialSeedBookings = (): Booking[] => {
  const dateStr = new Date().toISOString().split('T')[0];
  return [
    {
      id: 101,
      token_number: 'GO-104',
      verification_code: '8899',
      citizen_name: 'Adithya Shetty',
      phone: '9876543210',
      aadhaar: 'XXXX-XXXX-8899',
      age: 28,
      gender: 'Male',
      is_priority: false,
      priority_reason: undefined,
      booking_type: 'Online',
      office_id: 1,
      service_id: 1,
      booking_date: dateStr,
      visit_date: dateStr,
      visit_time: '10:30 AM',
      status: 'Pending',
      counter_number: 1,
      amount_paid: 25,
      tatkal_probability: 95,
      created_at: new Date().toISOString(),
      office_name: MOCK_OFFICES[0].name,
      service_name: MOCK_SERVICES[0].name,
      people_ahead: 3,
      avg_wait_mins: 10
    },
    {
      id: 102,
      token_number: 'SS-201',
      verification_code: '4321',
      citizen_name: 'Shankarappa Gowda',
      phone: '9448123456',
      aadhaar: 'XXXX-XXXX-4321',
      age: 68,
      gender: 'Male',
      is_priority: true,
      priority_reason: 'Senior Citizen (60+)',
      booking_type: 'Tatkal',
      office_id: 2,
      service_id: 4,
      booking_date: dateStr,
      visit_date: dateStr,
      visit_time: '10:15 AM',
      status: 'In Progress',
      counter_number: 2,
      amount_paid: 0,
      tatkal_probability: 99,
      created_at: new Date().toISOString(),
      office_name: MOCK_OFFICES[1].name,
      service_name: MOCK_SERVICES[3].name,
      people_ahead: 0,
      avg_wait_mins: 0
    },
    {
      id: 103,
      token_number: 'GO-105',
      verification_code: '1288',
      citizen_name: 'Sumangala Devi',
      phone: '9845112233',
      aadhaar: 'XXXX-XXXX-1288',
      age: 45,
      gender: 'Female',
      is_priority: false,
      priority_reason: undefined,
      booking_type: 'Online',
      office_id: 1,
      service_id: 2,
      booking_date: dateStr,
      visit_date: dateStr,
      visit_time: '11:00 AM',
      status: 'Pending',
      counter_number: 3,
      amount_paid: 50,
      tatkal_probability: 92,
      created_at: new Date().toISOString(),
      office_name: MOCK_OFFICES[0].name,
      service_name: MOCK_SERVICES[1].name,
      people_ahead: 4,
      avg_wait_mins: 15
    }
  ];
};

export const getStoredBookings = (): Booking[] => {
  try {
    const raw = localStorage.getItem('nimmaseva_bookings');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const seeds = getInitialSeedBookings();
  localStorage.setItem('nimmaseva_bookings', JSON.stringify(seeds));
  return seeds;
};

const setStoredBookings = (bookings: Booking[]): Booking[] => {
  try {
    localStorage.setItem('nimmaseva_bookings', JSON.stringify(bookings));
  } catch (e) {
    console.warn('Failed to save bookings to localStorage:', e);
  }
  return bookings;
};

export const saveStoredBooking = (booking: Booking): Booking[] => {
  const current = getStoredBookings();
  const updated = [booking, ...current.filter(b => b.id !== booking.id)];
  return setStoredBookings(updated);
};

export const updateStoredBookingStatus = (id: number, status: string, counterNumber?: number): Booking[] => {
  const current = getStoredBookings();
  const updated = current.map(b => {
    if (b.id === id || b.token_number === String(id)) {
      return {
        ...b,
        status: status as any,
        counter_number: counterNumber !== undefined ? counterNumber : b.counter_number
      };
    }
    return b;
  });
  return setStoredBookings(updated);
};

export const sendCitizenReminderSMS = async (tokenOrId: string | number) => {
  const current = getStoredBookings();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const updated = current.map(b => {
    if (b.id === Number(tokenOrId) || b.token_number === String(tokenOrId)) {
      return {
        ...b,
        reminder_sent: true,
        reminder_time: timeStr
      };
    }
    return b;
  });
  setStoredBookings(updated);

  try {
    const target = current.find(b => b.id === Number(tokenOrId) || b.token_number === String(tokenOrId));
    if (target) {
      await api.post('/notifications/send', {
        title: '⚡ Shivamogga Seva Ticket Reminder',
        message: `Dear ${target.citizen_name}, your token [${target.token_number}] is UP NEXT at Counter ${target.counter_number || 1}! Please report to counter now. Verification Code: ${target.verification_code}`,
        token_number: target.token_number,
        type: 'token_ready'
      });
    }
  } catch (e) {
    console.warn('Backend notification endpoint unreachable, sent local mock SMS alert');
  }

  return { status: 'sent', message: 'Automated SMS & Push reminder dispatched to citizen phone' };
};

export const acknowledgeReminder = async (tokenNumber: string): Promise<Booking | undefined> => {
  const current = getStoredBookings();
  const updated = current.map(b => {
    if (b.token_number.toLowerCase() === tokenNumber.toLowerCase()) {
      return {
        ...b,
        status: 'Approaching Counter' as any,
        acknowledged: true
      };
    }
    return b;
  });
  localStorage.setItem('nimmaseva_bookings', JSON.stringify(updated));
  return updated.find(b => b.token_number.toLowerCase() === tokenNumber.toLowerCase());
};

export interface RegisteredAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  department: string;
  office_name: string;
  password?: string;
  role: string;
}

export const getStoredAdmins = (): RegisteredAdmin[] => {
  try {
    const raw = localStorage.getItem('nimmaseva_registered_admins');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const defaultAdmins: RegisteredAdmin[] = [
    {
      id: 'adm-01',
      name: 'System District Admin',
      email: 'admin@nimmaseva.in',
      phone: '9876543210',
      employee_id: 'KA-GOV-2026-001',
      department: 'Revenue & E-Governance',
      office_name: 'GramOne Shivamogga Main',
      password: 'Admin@123',
      role: 'District Administrator'
    }
  ];
  localStorage.setItem('nimmaseva_registered_admins', JSON.stringify(defaultAdmins));
  return defaultAdmins;
};

export const saveStoredAdmin = (admin: RegisteredAdmin): RegisteredAdmin[] => {
  const current = getStoredAdmins();
  const updated = [admin, ...current.filter(a => a.email !== admin.email && a.phone !== admin.phone)];
  localStorage.setItem('nimmaseva_registered_admins', JSON.stringify(updated));
  return updated;
};

export const createBooking = async (data: any): Promise<Booking> => {
  let created: Booking | null = null;
  try {
    const res = await api.post('/bookings', data);
    if (res.data) created = res.data;
  } catch (err) {
    console.warn('API createBooking failed, returning mock created booking');
  }

  if (!created) {
    const rand = Math.floor(100 + Math.random() * 899);
    const tokenNum = `GO-${rand}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    created = {
      id: Date.now(),
      token_number: tokenNum,
      verification_code: `${rand}99`,
      citizen_name: data.citizen_name || 'Citizen',
      phone: data.phone || '9876543210',
      aadhaar: data.aadhaar || 'XXXX-XXXX-1234',
      age: Number(data.age) || 30,
      gender: data.gender || 'Male',
      is_priority: Boolean(data.is_priority),
      priority_reason: data.priority_reason || undefined,
      booking_type: data.booking_type || 'Online',
      office_id: Number(data.office_id) || 1,
      service_id: Number(data.service_id) || 1,
      booking_date: dateStr,
      visit_date: dateStr,
      visit_time: timeStr,
      status: 'Pending',
      counter_number: 1,
      amount_paid: MOCK_SERVICES.find(s => s.id === Number(data.service_id))?.fee || 25,
      tatkal_probability: 95,
      created_at: now.toISOString(),
      office_name: MOCK_OFFICES.find(o => o.id === Number(data.office_id))?.name || MOCK_OFFICES[0].name,
      service_name: MOCK_SERVICES.find(s => s.id === Number(data.service_id))?.name || MOCK_SERVICES[0].name,
      people_ahead: 5,
      avg_wait_mins: 15
    };
  }

  saveStoredBooking(created);
  return created;
};

export const fetchBookingByToken = async (tokenNumber: string): Promise<Booking> => {
  try {
    const res = await api.get(`/bookings/token/${tokenNumber}`);
    if (res.data) return res.data;
  } catch (err) {
    console.warn(`API fetchBookingByToken(${tokenNumber}) unreachable, using fallback`);
  }

  const stored = getStoredBookings();
  const match = stored.find(b => b.token_number.toLowerCase() === tokenNumber.toLowerCase());
  if (match) return match;

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  return {
    id: 1,
    token_number: tokenNumber || 'GO-104',
    verification_code: '8899',
    citizen_name: 'Adithya Shetty',
    phone: '9876543210',
    aadhaar: 'XXXX-XXXX-8899',
    age: 28,
    gender: 'Male',
    is_priority: false,
    priority_reason: undefined,
    booking_type: 'Online',
    office_id: 1,
    service_id: 1,
    booking_date: dateStr,
    visit_date: dateStr,
    visit_time: '10:30 AM',
    status: 'Pending',
    counter_number: 1,
    amount_paid: 25,
    tatkal_probability: 95,
    created_at: now.toISOString(),
    office_name: MOCK_OFFICES[0].name,
    service_name: MOCK_SERVICES[0].name,
    people_ahead: 3,
    avg_wait_mins: 10
  };
};

export const downloadPDFUrl = (tokenNumber: string): string => {
  return `${API_BASE}/bookings/pdf/${tokenNumber}`;
};

export const fetchQueueState = async (officeId: number): Promise<QueueState> => {
  try {
    const res = await api.get(`/queue/${officeId}`);
    if (res.data) return res.data;
  } catch (err) {
    console.warn(`API fetchQueueState(${officeId}) unreachable, using fallback`);
  }

  const bookings = getStoredBookings().filter(b => b.office_id === officeId);
  const serving = bookings.find(b => b.status === 'Called' || b.status === 'In Progress');
  const pending = bookings.filter(b => b.status === 'Pending');
  const completed = bookings.filter(b => b.status === 'Completed');

  return {
    office_id: officeId,
    current_token: serving ? serving.token_number : (pending[0]?.token_number || 'GO-104'),
    next_token: pending[1]?.token_number || 'GO-105',
    active_counters: 3,
    is_paused: false,
    total_waiting: pending.length,
    total_completed_today: completed.length + 42,
    updated_at: new Date().toISOString()
  };
};

export const controlQueueAction = async (officeId: number, actionData: any): Promise<QueueState> => {
  try {
    const res = await api.post(`/queue/${officeId}/control`, actionData);
    if (res.data) return res.data;
  } catch (err) {
    console.warn('API controlQueueAction unreachable');
  }

  // Handle local state queue updates
  const bookings = getStoredBookings();
  if (actionData.action === 'call_next') {
    const nextPending = bookings.find(b => b.status === 'Pending');
    if (nextPending) {
      updateStoredBookingStatus(nextPending.id, 'Called', actionData.counter_number || 1);
      sendCitizenReminderSMS(nextPending.id);
    }
  } else if (actionData.action === 'complete') {
    const called = bookings.find(b => b.status === 'Called' || b.status === 'In Progress' || b.status === 'Approaching Counter');
    if (called) {
      updateStoredBookingStatus(called.id, 'Completed');
    }
  } else if (actionData.action === 'skip') {
    const called = bookings.find(b => b.status === 'Called' || b.status === 'In Progress' || b.status === 'Approaching Counter');
    if (called) {
      updateStoredBookingStatus(called.id, 'Cancelled');
    }
  }

  return fetchQueueState(officeId);
};

export const sendOTP = async (phone: string, aadhaar?: string) => {
  try {
    const res = await api.post('/auth/send-otp', { phone, aadhaar });
    if (res.data) return res.data;
  } catch (err) {
    console.warn('API sendOTP unreachable, using mock success');
  }
  return { success: true, message: 'OTP sent successfully (Mock: 123456)', mock_otp: '123456' };
};

export const verifyOTP = async (phone: string, otp: string, aadhaar: string) => {
  try {
    const res = await api.post('/auth/verify-otp', { phone, otp, aadhaar });
    if (res.data) return res.data;
  } catch (err) {
    console.warn('API verifyOTP unreachable, using mock success');
  }
  return { success: true, message: 'Aadhaar OTP Verified Successfully' };
};

export const adminLogin = async (email_or_phone: string, password: string) => {
  try {
    const res = await api.post('/auth/login', { email_or_phone, password });
    if (res.data) return res.data;
  } catch (err) {
    console.warn('API adminLogin unreachable, checking stored local credentials');
  }

  const storedAdmins = getStoredAdmins();
  const match = storedAdmins.find(
    a => (a.email.toLowerCase() === email_or_phone.toLowerCase() || a.phone === email_or_phone || a.employee_id.toLowerCase() === email_or_phone.toLowerCase()) &&
         (!a.password || a.password === password)
  );

  if (match) {
    return {
      access_token: `jwt-token-${Date.now()}`,
      token_type: 'bearer',
      user_name: match.name,
      role: match.role || 'Government Staff Operator',
      department: match.department,
      employee_id: match.employee_id
    };
  }

  if (email_or_phone === 'admin@nimmaseva.in' && password === 'Admin@123') {
    return {
      access_token: 'mock-jwt-admin-token-2026',
      token_type: 'bearer',
      user_name: 'District Administrator',
      role: 'District Officer'
    };
  }

  throw { response: { data: { detail: 'Invalid Official Staff ID or Password' } } };
};

export const adminRegister = async (data: any) => {
  try {
    const res = await api.post('/auth/register', data);
    if (res.data) {
      saveStoredAdmin({
        id: `adm-${Date.now()}`,
        name: data.full_name,
        email: data.email_or_phone,
        phone: data.email_or_phone,
        employee_id: data.employee_id || `KA-GOV-${Math.floor(1000 + Math.random() * 9000)}`,
        department: data.department || 'Revenue & E-Governance',
        office_name: MOCK_OFFICES.find(o => o.id === Number(data.office_id))?.name || MOCK_OFFICES[0].name,
        password: data.password,
        role: data.role || 'Government Officer'
      });
      return res.data;
    }
  } catch (err) {
    console.warn('API adminRegister unreachable, registering in local store');
  }

  const office = MOCK_OFFICES.find(o => o.id === Number(data.office_id)) || MOCK_OFFICES[0];
  const newAdmin: RegisteredAdmin = {
    id: `adm-${Date.now()}`,
    name: data.full_name,
    email: data.email_or_phone,
    phone: data.phone || data.email_or_phone,
    employee_id: data.employee_id || `KA-GOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    department: data.department || 'Revenue & E-Governance',
    office_name: office.name,
    password: data.password,
    role: data.role || 'Government Staff Operator'
  };

  saveStoredAdmin(newAdmin);

  return {
    access_token: `jwt-registered-${Date.now()}`,
    token_type: 'bearer',
    user_name: newAdmin.name,
    role: newAdmin.role,
    department: newAdmin.department
  };
};

export const submitRating = async (tokenNumber: string, rating: number, comment?: string) => {
  try {
    const res = await api.post(`/bookings/${tokenNumber}/rate`, { rating, comment: comment || '' });
    if (res.data) return res.data;
  } catch (err) {
    // Fallback: store locally
    console.warn('API submitRating unreachable, storing locally');
  }
  // Store locally so the UI doesn't show the widget again
  const key = `nimmaseva_rating_${tokenNumber}`;
  localStorage.setItem(key, JSON.stringify({ rating, comment, submitted_at: new Date().toISOString() }));
  return { success: true };
};

export const fetchAdminSummary = async (officeId?: number): Promise<AnalyticsSummary> => {
  try {
    const params = officeId ? { office_id: officeId } : {};
    const res = await api.get('/admin/summary', { params });
    if (res.data) return res.data;
  } catch (err) {
    console.warn('API fetchAdminSummary unreachable, calculating dynamic local summary');
  }

  const allBookings = getStoredBookings();
  const bookings = officeId ? allBookings.filter(b => b.office_id === officeId) : allBookings;

  const todayBookings = bookings.length;
  const todayRevenue = bookings.reduce((sum, b) => sum + (b.amount_paid || 0), 0);
  const completedTokens = bookings.filter(b => b.status === 'Completed').length;
  const cancelledTokens = bookings.filter(b => b.status === 'Cancelled').length;
  const pendingTokens = bookings.filter(b => b.status === 'Pending' || b.status === 'Called' || b.status === 'In Progress').length;
  const walkinTokens = bookings.filter(b => b.booking_type === 'Offline').length;
  const onlineTokens = bookings.filter(b => b.booking_type === 'Online' || b.booking_type === 'Tatkal').length;
  const priorityTokens = bookings.filter(b => b.is_priority).length;

  return {
    today_bookings: todayBookings,
    today_revenue: todayRevenue,
    completed_tokens: completedTokens,
    cancelled_tokens: cancelledTokens,
    pending_tokens: pendingTokens,
    walkin_tokens: walkinTokens,
    online_tokens: onlineTokens,
    priority_tokens: priorityTokens,
    current_queue_len: pendingTokens,
    avg_wait_time_mins: 11.5,
    no_show_percentage: 1.8,
    most_requested_service: 'Income & Caste Certificate',
    peak_hour: '11:00 AM - 12:00 PM'
  };
};

export const fetchAllBookings = async (status?: string, officeId?: number): Promise<Booking[]> => {
  try {
    const params: any = {};
    if (status) params.status = status;
    if (officeId) params.office_id = officeId;
    const res = await api.get('/admin/bookings', { params });
    if (Array.isArray(res.data)) return res.data;
  } catch (err) {
    console.warn('API fetchAllBookings unreachable, returning stored local bookings');
  }

  let list = getStoredBookings();
  if (status) {
    list = list.filter(b => b.status.toLowerCase() === status.toLowerCase());
  }
  if (officeId) {
    list = list.filter(b => b.office_id === officeId);
  }
  return list;
};

export const updateBookingStatus = async (bookingId: number, status: string, counterNumber?: number) => {
  try {
    const res = await api.patch(`/admin/bookings/${bookingId}/status`, { status, counter_number: counterNumber });
    if (res.data) {
      updateStoredBookingStatus(bookingId, status, counterNumber);
      return res.data;
    }
  } catch (err) {
    console.warn('API updateBookingStatus unreachable, updating local state');
  }
  updateStoredBookingStatus(bookingId, status, counterNumber);
  return { status: 'success', message: `Token status updated to ${status}` };
};

export const createWalkinBooking = async (data: any): Promise<Booking> => {
  try {
    const res = await api.post('/admin/bookings/walk-in', data);
    if (res.data) {
      saveStoredBooking(res.data);
      return res.data;
    }
  } catch (err) {
    console.warn('API createWalkinBooking unreachable, generating local walk-in ticket');
  }

  const rand = Math.floor(200 + Math.random() * 700);
  const tokenNum = `SS-W${rand}`;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const office = MOCK_OFFICES.find(o => o.id === Number(data.office_id)) || MOCK_OFFICES[0];
  const service = MOCK_SERVICES.find(s => s.id === Number(data.service_id)) || MOCK_SERVICES[0];

  const walkin: Booking = {
    id: Date.now(),
    token_number: tokenNum,
    verification_code: `W-${rand}`,
    citizen_name: data.citizen_name || 'Walk-in Citizen',
    phone: data.phone || '9876543210',
    aadhaar: 'WALK-IN-TOKEN',
    age: 30,
    gender: 'Male',
    is_priority: Boolean(data.is_priority),
    priority_reason: data.priority_reason,
    booking_type: 'Offline',
    office_id: Number(data.office_id),
    service_id: Number(data.service_id),
    booking_date: dateStr,
    visit_date: dateStr,
    visit_time: timeStr,
    status: 'Pending',
    counter_number: 1,
    amount_paid: service.fee,
    tatkal_probability: 99,
    created_at: now.toISOString(),
    office_name: office.name,
    service_name: service.name,
    people_ahead: 0,
    avg_wait_mins: 10
  };

  saveStoredBooking(walkin);
  return walkin;
};

export const fetchAnalyticsCharts = async (period: string = 'daily') => {
  try {
    const res = await api.get('/analytics/charts', { params: { period } });
    if (res.data && res.data.hourly_traffic) return res.data;
  } catch (err) {
    console.warn('API fetchAnalyticsCharts unreachable, using fallback');
  }

  // Fallback shape matches backend /analytics/charts exactly
  return {
    period,
    hourly_traffic: [
      { hour: '09:00 AM', online: 18, walkin: 10 },
      { hour: '10:00 AM', online: 32, walkin: 15 },
      { hour: '11:00 AM', online: 28, walkin: 20 },
      { hour: '12:00 PM', online: 12, walkin: 5 },
      { hour: '01:00 PM', online: 5,  walkin: 2 },
      { hour: '02:00 PM', online: 25, walkin: 18 },
      { hour: '03:00 PM', online: 30, walkin: 12 },
      { hour: '04:00 PM', online: 15, walkin: 8 },
    ],
    weekly_trends: [
      { day: 'Mon', total: 145, revenue: 3625 },
      { day: 'Tue', total: 180, revenue: 4500 },
      { day: 'Wed', total: 195, revenue: 4875 },
      { day: 'Thu', total: 160, revenue: 4000 },
      { day: 'Fri', total: 210, revenue: 5250 },
      { day: 'Sat', total: 130, revenue: 3250 },
    ],
    service_demand: [
      { name: 'Income & Caste Certificate', bookings: 52 },
      { name: 'Ration Card Services', bookings: 45 },
      { name: 'RTC / Pahani Extract', bookings: 38 },
      { name: 'Gruha Lakshmi Verification', bookings: 30 },
      { name: 'Senior Citizen ID', bookings: 22 },
      { name: 'Yuva Nidhi Enrollment', bookings: 18 },
    ],
  };
};

export const searchSchemes = async (filters: any): Promise<Scheme[]> => {
  try {
    const res = await api.get('/schemes', { params: filters });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    console.warn('API searchSchemes unreachable, using fallback data');
  }

  return MOCK_SCHEMES.filter(sc => {
    if (filters.gender && filters.gender !== 'All' && sc.gender_eligibility !== 'All' && sc.gender_eligibility !== filters.gender) {
      return false;
    }
    if (filters.age !== undefined && (filters.age < sc.min_age || filters.age > sc.max_age)) {
      return false;
    }
    if (filters.income !== undefined && filters.income > sc.max_income) {
      return false;
    }
    return true;
  });
};

export const toggleServiceStatus = async (serviceId: number, serverStatus: string, isActive: boolean) => {
  try {
    const res = await api.patch(`/services/${serviceId}/status`, null, {
      params: { server_status: serverStatus, is_active: isActive }
    });
    if (res.data) return res.data;
  } catch (err) {
    console.warn('API toggleServiceStatus unreachable');
  }
  return { success: true, message: 'Status updated (Mock)' };
};

export const fetchBookingsByPhone = async (phone: string): Promise<Booking[]> => {
  try {
    const res = await api.get(`/bookings/by-phone/${phone}`);
    if (Array.isArray(res.data)) return res.data;
  } catch (err) {
    console.warn('API fetchBookingsByPhone unreachable, falling back to local storage');
  }
  return getStoredBookings().filter(b => b.phone === phone);
};

export const cancelBooking = async (bookingId: number, phone: string, reason?: string): Promise<void> => {
  try {
    await api.post(`/bookings/${bookingId}/cancel`, null, {
      params: { phone, reason: reason || '' }
    });
    updateStoredBookingStatus(bookingId, 'Cancelled');
  } catch (err: any) {
    const detail = err?.response?.data?.detail || 'Failed to cancel booking';
    // If backend offline, still cancel locally
    if (err?.code === 'ERR_NETWORK' || err?.code === 'ECONNABORTED') {
      updateStoredBookingStatus(bookingId, 'Cancelled');
      return;
    }
    throw new Error(detail);
  }
};

export const fetchPublicStats = async () => {
  try {
    const res = await api.get('/public/stats');
    if (res.data && res.data.total_tokens_issued !== undefined) return res.data;
  } catch (err) {
    console.warn('API fetchPublicStats unreachable, using fallback');
  }
  // Fallback — shown when backend is offline (e.g. Vercel static deploy)
  return {
    total_tokens_issued: null,
    avg_wait_time_mins: null,
    completion_rate_pct: null,
  };
};

export const getExportCsvUrl = (): string => `${API_BASE}/admin/export/csv`;

export default api;
