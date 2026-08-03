import axios from 'axios';
import { Office, Service, Booking, QueueState, Scheme, AnalyticsSummary } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchOffices = async (lat?: number, lng?: number): Promise<Office[]> => {
  const params: any = {};
  if (lat !== undefined && lng !== undefined) {
    params.lat = lat;
    params.lng = lng;
  }
  const res = await api.get('/offices', { params });
  return res.data;
};

export const fetchOfficeDetail = async (id: number): Promise<Office> => {
  const res = await api.get(`/offices/${id}`);
  return res.data;
};

export const fetchServices = async (): Promise<Service[]> => {
  const res = await api.get('/services');
  return res.data;
};

export const createBooking = async (data: any): Promise<Booking> => {
  const res = await api.post('/bookings', data);
  return res.data;
};

export const fetchBookingByToken = async (tokenNumber: string): Promise<Booking> => {
  const res = await api.get(`/bookings/token/${tokenNumber}`);
  return res.data;
};

export const downloadPDFUrl = (tokenNumber: string): string => {
  return `${API_BASE}/bookings/pdf/${tokenNumber}`;
};

export const fetchQueueState = async (officeId: number): Promise<QueueState> => {
  const res = await api.get(`/queue/${officeId}`);
  return res.data;
};

export const controlQueueAction = async (officeId: number, actionData: any): Promise<QueueState> => {
  const res = await api.post(`/queue/${officeId}/control`, actionData);
  return res.data;
};

export const sendOTP = async (phone: string, aadhaar?: string) => {
  const res = await api.post('/auth/send-otp', { phone, aadhaar });
  return res.data;
};

export const verifyOTP = async (phone: string, otp: string, aadhaar: string) => {
  const res = await api.post('/auth/verify-otp', { phone, otp, aadhaar });
  return res.data;
};

export const adminLogin = async (email_or_phone: string, password: string) => {
  const res = await api.post('/auth/login', { email_or_phone, password });
  return res.data;
};

export const fetchAdminSummary = async (officeId?: number): Promise<AnalyticsSummary> => {
  const params = officeId ? { office_id: officeId } : {};
  const res = await api.get('/admin/summary', { params });
  return res.data;
};

export const fetchAllBookings = async (status?: string, officeId?: number): Promise<Booking[]> => {
  const params: any = {};
  if (status) params.status = status;
  if (officeId) params.office_id = officeId;
  const res = await api.get('/admin/bookings', { params });
  return res.data;
};

export const fetchAnalyticsCharts = async (period: string = 'daily') => {
  const res = await api.get('/analytics/charts', { params: { period } });
  return res.data;
};

export const searchSchemes = async (filters: any): Promise<Scheme[]> => {
  const res = await api.get('/schemes', { params: filters });
  return res.data;
};

export const toggleServiceStatus = async (serviceId: number, serverStatus: string, isActive: boolean) => {
  const res = await api.patch(`/services/${serviceId}/status`, null, {
    params: { server_status: serverStatus, is_active: isActive }
  });
  return res.data;
};

export const getExportCsvUrl = (): string => `${API_BASE}/admin/export/csv`;

export default api;
