import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchOffices, fetchServices } from '../services/api';
import { Office, Service } from '../types';
import { useStore } from '../store/useStore';
import { OfficeMap } from '../components/map/OfficeMap';
import { KarnatakaBadge } from '../components/KarnatakaBadge';
import { MapPin, Navigation, Clock, Phone, AlertTriangle, ArrowRight, ShieldCheck, Ticket, Users, CheckCircle2, RefreshCw } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { userLocation, setUserLocation, setSelectedOffice, setSelectedService } = useStore();
  const [offices, setOffices] = useState<Office[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<string>('Detecting location...');

  useEffect(() => {
    // Request geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc, "Shivamogga Center Area");
          setLocationStatus("Location Detected");
          loadData(loc.lat, loc.lng);
        },
        (err) => {
          // Default fallback to Shivamogga city coordinates
          const defaultLoc = { lat: 13.9299, lng: 75.5681 };
          setUserLocation(defaultLoc, "Shivamogga City Center");
          setLocationStatus("Default Location (Shivamogga)");
          loadData(defaultLoc.lat, defaultLoc.lng);
        }
      );
    } else {
      const defaultLoc = { lat: 13.9299, lng: 75.5681 };
      setUserLocation(defaultLoc, "Shivamogga City Center");
      loadData(defaultLoc.lat, defaultLoc.lng);
    }
  }, []);

  const loadData = async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const [offData, srvData] = await Promise.all([
        fetchOffices(lat, lng),
        fetchServices()
      ]);
      setOffices(offData);
      setServices(srvData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAtOffice = (office: Office) => {
    setSelectedOffice(office);
    navigate('/book');
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    navigate('/book');
  };

  // Check Office Operating Hour Status (09:00 AM to 05:00 PM, Lunch 12-1 PM)
  const currentHour = new Date().getHours();
  const isClosed = currentHour >= 17 || currentHour < 9;
  const isLunch = currentHour === 12;

  return (
    <div className="min-h-screen bg-slate-50 space-y-10 pb-16">
      
      {/* Hero Section with Karnataka Theme */}
      <section className="relative karnataka-gradient text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <KarnatakaBadge />
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Nimma Seva <br />
              <span className="text-amber-400">Shivamogga Token Management System</span>
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Book tokens online for GramOne and Seva Sindhu centers in Shivamogga. Real-time queue tracking, Tatkal completion prediction, and priority pass allocation.
            </p>

            {/* Status Announcement Banner */}
            {isClosed ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-400/40 text-red-100 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-red-300" />
                <span>Office Closed (05:00 PM - 09:00 AM). Bookings automatically scheduled for next working day.</span>
              </div>
            ) : isLunch ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Lunch Break in Progress (12:00 PM - 01:00 PM). Counters paused temporarily.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Offices Active • Normal Operations • Earliest Slot Booking Available</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Link
                to="/book"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-sm transition-transform active:scale-95 shadow-lg"
              >
                <Ticket className="w-5 h-5" />
                <span>Book Token Pass Now</span>
              </Link>
              <Link
                to="/queue"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-sm border border-emerald-600 shadow"
              >
                <Users className="w-5 h-5" />
                <span>View Live Queue</span>
              </Link>
            </div>
          </div>

          {/* Quick Location & Office Widget */}
          <div className="w-full md:w-96 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Detected Location</span>
              </div>
              <button 
                onClick={() => userLocation && loadData(userLocation.lat, userLocation.lng)} 
                className="text-emerald-200 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-emerald-100 font-mono">
              Latitude: {userLocation?.lat.toFixed(4)} | Longitude: {userLocation?.lng.toFixed(4)}
            </p>

            <div className="border-t border-emerald-700/50 pt-3 space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Nearest Centers</div>
              {offices.slice(0, 2).map((off) => (
                <div key={off.id} className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/40 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-white block">{off.name}</span>
                    <span className="text-[11px] text-emerald-200">{off.distance_km ? `${off.distance_km} km away` : 'Shivamogga'}</span>
                  </div>
                  <button
                    onClick={() => handleBookAtOffice(off)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-lg"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Map & Nearest Offices Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Nearest GramOne & Seva Sindhu Centers</h2>
              <p className="text-slate-500 text-xs sm:text-sm">Interactive map showing center status, distance, and current queue length</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-100 px-2 py-1 rounded">
                🟢 GramOne
              </span>
              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-100 px-2 py-1 rounded">
                🟠 Seva Sindhu
              </span>
            </div>
          </div>

          <OfficeMap offices={offices} userLocation={userLocation} onSelectOffice={handleBookAtOffice} />
        </section>

        {/* Centers Grid */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Center Operating Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offices.map((office) => (
              <div key={office.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold text-white mb-1.5 ${office.type === 'GramOne' ? 'bg-emerald-700' : 'bg-amber-600'}`}>
                      {office.type} Center
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">{office.name}</h4>
                    <p className="text-xs text-slate-500">{office.address}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${office.server_status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {office.server_status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Queue</span>
                    <span className="text-lg font-bold text-slate-800">{office.current_queue_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Remaining</span>
                    <span className="text-lg font-bold text-emerald-600">{office.remaining_tokens || 100}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance</span>
                    <span className="text-lg font-bold text-slate-800">{office.distance_km ? `${office.distance_km} km` : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{office.working_hours} (Lunch {office.lunch_break})</span>
                  </div>
                  <button
                    onClick={() => handleBookAtOffice(office)}
                    className="flex items-center gap-1 text-emerald-700 font-bold hover:text-emerald-800"
                  >
                    <span>Book Token</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Government Services Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Available Government Services</h3>
              <p className="text-xs text-slate-500">Select any service to begin automated slot allocation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => handleSelectService(service)}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {service.category}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {service.fee === 0 ? 'FREE' : `₹${service.fee}`}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {service.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">Avg Time: {service.avg_processing_time_mins} mins</p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                  <span className="text-slate-400">Req Docs: {service.required_documents?.length || 3}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                    Book <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
