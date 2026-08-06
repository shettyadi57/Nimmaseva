import { create } from 'zustand';
import { Office, Service, Booking, CitizenProfile } from '../types';

interface AppState {
  userLocation: { lat: number; lng: number } | null;
  locationAddress: string | null;
  setUserLocation: (loc: { lat: number; lng: number } | null, addr?: string) => void;

  selectedOffice: Office | null;
  setSelectedOffice: (office: Office | null) => void;

  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;

  currentBooking: Booking | null;
  setCurrentBooking: (booking: Booking | null) => void;

  // Citizen Authentication & Auto-Fill Profile State
  citizenProfile: CitizenProfile | null;
  setCitizenProfile: (profile: CitizenProfile | null) => void;
  logoutCitizen: () => void;

  adminToken: string | null;
  adminUser: { name: string; role: string } | null;
  setAdminAuth: (token: string | null, user: { name: string; role: string } | null) => void;
}

const getStoredCitizenProfile = (): CitizenProfile | null => {
  try {
    const data = localStorage.getItem('nimmaseva_citizen_profile');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const useStore = create<AppState>((set) => ({
  userLocation: null,
  locationAddress: null,
  setUserLocation: (loc, addr) => set({ userLocation: loc, locationAddress: addr || null }),

  selectedOffice: null,
  setSelectedOffice: (office) => set({ selectedOffice: office }),

  selectedService: null,
  setSelectedService: (service) => set({ selectedService: service }),

  currentBooking: null,
  setCurrentBooking: (booking) => set({ currentBooking: booking }),

  citizenProfile: getStoredCitizenProfile(),
  setCitizenProfile: (profile) => {
    if (profile) {
      localStorage.setItem('nimmaseva_citizen_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('nimmaseva_citizen_profile');
    }
    set({ citizenProfile: profile });
  },
  logoutCitizen: () => {
    localStorage.removeItem('nimmaseva_citizen_profile');
    set({ citizenProfile: null });
  },

  adminToken: localStorage.getItem('adminToken') || null,
  adminUser: localStorage.getItem('adminUser') ? JSON.parse(localStorage.getItem('adminUser')!) : null,
  setAdminAuth: (token, user) => {
    if (token) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
    set({ adminToken: token, adminUser: user });
  },
}));

