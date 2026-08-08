import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchOffices, fetchServices, fetchPublicStats } from '../services/api';
import { Office, Service, PublicStats } from '../types';
import { useStore } from '../store/useStore';
import { OfficeMap } from '../components/map/OfficeMap';
import { KarnatakaBadge } from '../components/KarnatakaBadge';
import { ServerDownModal } from '../components/ServerDownModal';
import { useLang } from '../context/LanguageContext';
import { 
  MapPin, Navigation, Clock, Phone, AlertTriangle, ArrowRight, ShieldCheck, 
  Ticket, Users, CheckCircle2, RefreshCw, Sparkles, Activity, FileText, AlertOctagon,
  Compass, ExternalLink, Share2
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { userLocation, setUserLocation, setSelectedOffice, setSelectedService } = useStore();
  const [offices, setOffices] = useState<Office[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<string>('Detecting location...');
  const [heroStats, setHeroStats] = useState<PublicStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Outage & Route modal states
  const [outageModalOpen, setOutageModalOpen] = useState(false);
  const [outageService, setOutageService] = useState<Service | null>(null);
  const [docModalService, setDocModalService] = useState<Service | null>(null);
  const [selectedRouteOffice, setSelectedRouteOffice] = useState<Office | null>(null);
  const [travelMode, setTravelMode] = useState<'driving' | 'two-wheeler' | 'walking'>('driving');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc, "Shivamogga Center Area");
          setLocationStatus("Location Detected");
          loadData(loc.lat, loc.lng);
        },
        (err) => {
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

  // Fetch public hero stats independently (non-blocking)
  useEffect(() => {
    fetchPublicStats()
      .then(stats => setHeroStats(stats))
      .catch(() => setHeroStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const handleBookAtOffice = (office: Office) => {
    setSelectedOffice(office);
    navigate('/book');
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setOutageService(service);
    setOutageModalOpen(true);
  };

  const currentHour = new Date().getHours();
  const isClosed = currentHour >= 17 || currentHour < 9;
  const isLunch = currentHour === 12;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 space-y-14 pb-24">
      
      {/* High-Impact Hero Section */}
      <section className="relative hero-gradient pt-10 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-900">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <KarnatakaBadge />
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              {t.heroTitle.split('\n')[0]} <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                {t.heroTitle.split('\n')[1] || 'Token Engine'}
              </span>
            </h1>
            
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              {t.heroDesc}
            </p>

            {/* Operating Hours Alert */}
            {isClosed ? (
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs font-semibold backdrop-blur-md">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>Operating Hours Closed (05:00 PM - 09:00 AM). Next available slots automatically assigned for tomorrow.</span>
              </div>
            ) : isLunch ? (
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-950/60 border border-amber-800/60 text-amber-200 text-xs font-semibold backdrop-blur-md">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Lunch Recess Active (12:00 PM - 01:00 PM). Counters paused temporarily.</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse flex-shrink-0" />
                <span>Counters Active • Instant Digital Slot Booking Available</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                to="/book"
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Ticket className="w-5 h-5 text-slate-950" />
                <span>{t.bookNow}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/queue"
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-sm border border-slate-700/80 shadow-lg transition-all"
              >
                <Users className="w-5 h-5 text-amber-400" />
                <span>{t.liveQueue}</span>
              </Link>
            </div>

            {/* Metric Counters Bar — live data from /public/stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-900 max-w-lg">
              <div>
                {statsLoading ? (
                  <span className="text-2xl font-black text-slate-700 font-mono block animate-pulse">·····</span>
                ) : (
                  <span className="text-2xl font-black text-white font-mono block">
                    {heroStats?.total_tokens_issued != null
                      ? `${heroStats.total_tokens_issued.toLocaleString()}+`
                      : '—'}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">{t.tokensIssued}</span>
              </div>
              <div>
                {statsLoading ? (
                  <span className="text-2xl font-black text-slate-700 font-mono block animate-pulse">·····</span>
                ) : (
                  <span className="text-2xl font-black text-emerald-400 font-mono block">
                    {heroStats?.avg_wait_time_mins != null
                      ? `~${heroStats.avg_wait_time_mins} Mins`
                      : '—'}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">{t.avgProcessing}</span>
              </div>
              <div>
                {statsLoading ? (
                  <span className="text-2xl font-black text-slate-700 font-mono block animate-pulse">·····</span>
                ) : (
                  <span className="text-2xl font-black text-amber-400 font-mono block">
                    {heroStats?.completion_rate_pct != null
                      ? `${heroStats.completion_rate_pct}%`
                      : '—'}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">{t.tatkalAccuracy}</span>
              </div>
            </div>
          </div>

          {/* Quick Location & Nearest Centers Glass Card */}
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Detected Coordinates</span>
                </div>
                <button 
                  onClick={() => userLocation && loadData(userLocation.lat, userLocation.lng)} 
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
                <span>Lat: {userLocation?.lat.toFixed(4)} | Lng: {userLocation?.lng.toFixed(4)}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">GPS ACTIVE</span>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nearest Shivamogga Centers</span>
                
                {offices.slice(0, 2).map((off) => (
                  <div key={off.id} className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${off.type === 'GramOne' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span className="font-bold text-sm text-white">{off.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{off.distance_km ? `${off.distance_km} km away` : 'Shivamogga City'}</p>
                    </div>
                    <button
                      onClick={() => handleBookAtOffice(off)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all"
                    >
                      Book Pass
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Map & Nearest Offices Section */}
        <section id="office-map" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">
                <Navigation className="w-4 h-4" />
                <span>Geospatial Coverage</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Shivamogga Service Centers Map
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                🟢 GramOne Centers
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-400 font-bold">
                🟠 Seva Sindhu Centers
              </span>
            </div>
          </div>

          <OfficeMap 
            offices={offices} 
            userLocation={userLocation} 
            selectedRouteOffice={selectedRouteOffice}
            onSelectOffice={handleBookAtOffice}
            onShowRoute={(office) => setSelectedRouteOffice(office)}
          />
        </section>

        {/* Center Operating Status Cards */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Center Live Operations</h3>
            <span className="text-xs text-slate-400 font-mono">Synced with Shivamogga Queue Server</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offices.map((office) => (
              <div key={office.id} className="glass-panel rounded-3xl p-7 shadow-xl border border-slate-800 hover:border-slate-700 transition-all space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2 ${office.type === 'GramOne' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                      {office.type} Center
                    </span>
                    <h4 className="text-xl font-extrabold text-white">{office.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{office.address}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${office.server_status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {office.server_status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center bg-slate-950 p-4 rounded-2xl border border-slate-900">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Current Queue</span>
                    <span className="text-xl font-black text-amber-400 font-mono">{office.current_queue_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Tokens Remaining</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">{office.remaining_tokens || 100}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Distance</span>
                    <span className="text-xl font-black text-slate-200 font-mono">{office.distance_km ? `${office.distance_km} km` : 'City'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{office.working_hours}</span>
                  </div>
                </div>

                {/* Live Navigation & Route Button Pair (Matched UI) */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-900">
                  <button
                    onClick={() => {
                      setSelectedRouteOffice(office);
                      const mapElem = document.getElementById('office-map');
                      if (mapElem) mapElem.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all border shadow-md active:scale-95 ${
                      selectedRouteOffice?.id === office.id
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700 hover:border-emerald-500/60'
                    }`}
                  >
                    <Navigation className={`w-3.5 h-3.5 ${selectedRouteOffice?.id === office.id ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span>{selectedRouteOffice?.id === office.id ? 'Viewing Route on Map ✓' : 'Show Route on Map'}</span>
                  </button>

                  <button
                    onClick={() => handleBookAtOffice(office)}
                    className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all shrink-0"
                  >
                    <span>Book Pass</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Available Government Services Grid */}
        {/* Citizen Services Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">Karnataka Public Services</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Available Citizen Services</h3>
            </div>
            <Link
              to="/services"
              className="text-xs font-extrabold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 bg-amber-950/60 hover:bg-amber-900/80 px-4 py-2 rounded-xl border border-amber-800/80 transition-all self-start sm:self-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.navServices || 'Services & Documents Directory'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {services.map((service) => {
              const isDown = service.server_status === 'Down' || !service.is_active;
              const isMaint = service.server_status === 'Maintenance';

              return (
                <div
                  key={service.id}
                  className={`glass-panel rounded-2xl p-5 border ${
                    isDown ? 'border-red-900/60 bg-red-950/10 hover:border-red-600' :
                    isMaint ? 'border-amber-900/60 bg-amber-950/10 hover:border-amber-500' :
                    'border-slate-800 hover:border-emerald-500/60'
                  } hover:shadow-xl hover:-translate-y-1 transition-all group space-y-4 relative flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                        {service.category}
                      </span>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {service.fee === 0 ? 'FREE' : `₹${service.fee}`}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors leading-snug">
                        {service.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Avg Processing: ~{service.avg_processing_time_mins} mins</span>
                      </p>
                    </div>

                    {/* Status Indicator Badge */}
                    <div className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${
                      isDown ? 'bg-red-950/90 text-red-300 border border-red-800' :
                      isMaint ? 'bg-amber-950/90 text-amber-300 border border-amber-800' :
                      'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                    }`}>
                      {isDown ? (
                        <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-red-400" />
                      ) : isMaint ? (
                        <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      )}
                      <span>{isDown ? '🔴 SERVER DOWN' : isMaint ? '🟡 MAINTENANCE' : '🟢 SERVER ONLINE'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-900">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocModalService(service);
                      }}
                      className="w-full py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>{service.required_documents?.length || 3} Required Documents</span>
                    </button>

                    <button
                      onClick={() => handleSelectService(service)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors ${
                        isDown
                          ? 'bg-red-950 text-red-300 border border-red-800 hover:bg-red-900'
                          : isMaint
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      }`}
                    >
                      <span>{isDown ? 'Outage Alert' : isMaint ? 'Maintenance' : 'Book Token Pass'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <ServerDownModal
        service={outageService}
        isOpen={outageModalOpen}
        onClose={() => setOutageModalOpen(false)}
        onSelectAlternative={() => navigate('/book')}
        onProceedBooking={() => navigate('/book')}
      />

      {/* Service Document Requirements Quick View Modal */}
      {docModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-white">
            <button
              onClick={() => setDocModalService(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full text-xs font-bold transition-colors"
            >
              ✕
            </button>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                {docModalService.category}
              </span>
              <h3 className="text-xl font-extrabold text-white">{docModalService.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {docModalService.description || 'Government certified service issued at GramOne & Seva Sindhu centers.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Government Fee</span>
                <span className="font-extrabold text-amber-400 font-mono text-sm">
                  {docModalService.fee === 0 ? 'FREE' : `₹${docModalService.fee}`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Processing Time</span>
                <span className="font-extrabold text-emerald-400 text-sm">~{docModalService.avg_processing_time_mins} mins</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Mandatory Documents Required Checklist</span>
              </h4>
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {docModalService.required_documents?.map((doc, idx) => (
                  <li key={idx} className="bg-slate-800/80 p-2.5 rounded-xl text-xs text-slate-200 flex items-start gap-2.5 border border-slate-700/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  const s = docModalService;
                  setDocModalService(null);
                  handleSelectService(s);
                }}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Book Token for this Service</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Route & Google Navigation Modal (Matched UI) */}
      {selectedRouteOffice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-white backdrop-blur-xl glow-border">
            <button
              onClick={() => setSelectedRouteOffice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow"
            >
              ✕
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  selectedRouteOffice.type === 'GramOne' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  🗺️ Live Navigation &amp; Route Intel
                </span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">{selectedRouteOffice.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <span>{selectedRouteOffice.address}</span>
              </p>
            </div>

            {/* Travel Mode Selector */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Select Travel Mode
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => setTravelMode('driving')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 active:scale-95 ${
                    travelMode === 'driving'
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl">🚗</span>
                  <span className="text-xs font-extrabold">Car / Taxi</span>
                  <span className={`text-[10px] font-mono font-extrabold ${travelMode === 'driving' ? 'text-amber-300' : 'text-emerald-400'}`}>
                    ~{selectedRouteOffice.est_travel_time_mins || 10} mins
                  </span>
                </button>

                <button
                  onClick={() => setTravelMode('two-wheeler')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 active:scale-95 ${
                    travelMode === 'two-wheeler'
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl">🛵</span>
                  <span className="text-xs font-extrabold">Two-Wheeler</span>
                  <span className={`text-[10px] font-mono font-extrabold ${travelMode === 'two-wheeler' ? 'text-amber-300' : 'text-emerald-400'}`}>
                    ~{Math.max(4, Math.round((selectedRouteOffice.est_travel_time_mins || 10) * 0.8))} mins
                  </span>
                </button>

                <button
                  onClick={() => setTravelMode('walking')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 active:scale-95 ${
                    travelMode === 'walking'
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl">🚶</span>
                  <span className="text-xs font-extrabold">Walking</span>
                  <span className={`text-[10px] font-mono font-extrabold ${travelMode === 'walking' ? 'text-amber-300' : 'text-amber-400'}`}>
                    ~{Math.round((selectedRouteOffice.distance_km || 2.4) * 12)} mins
                  </span>
                </button>
              </div>
            </div>

            {/* Live Intel Card */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Route Distance:</span>
                <span className="font-mono font-extrabold text-amber-400 text-sm">{selectedRouteOffice.distance_km || 2.4} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Traffic Flow:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 🟢 Smooth Traffic
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Center Working Hours:</span>
                <span className="text-slate-200 font-medium">{selectedRouteOffice.working_hours}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Queue Count:</span>
                <span className="text-amber-400 font-mono font-bold">{selectedRouteOffice.current_queue_count || 0} waiting</span>
              </div>
            </div>

            {/* Turn-by-Turn Guidance Timeline */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Step-by-Step Route Guidance
              </span>
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-300 space-y-2.5 font-mono">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 ring-4 ring-red-500/20" />
                  <span>Depart from Detected Location in Shivamogga</span>
                </div>
                <div className="flex items-center gap-2.5 pl-1">
                  <div className="w-0.5 h-4 bg-slate-700 ml-0.5" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 ring-4 ring-amber-400/20" />
                  <span>Follow {selectedRouteOffice.taluk} Artery Road</span>
                </div>
                <div className="flex items-center gap-2.5 pl-1">
                  <div className="w-0.5 h-4 bg-slate-700 ml-0.5" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 ring-4 ring-emerald-400/20" />
                  <span className="font-bold text-white">Arrive at {selectedRouteOffice.name}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <a
                href={(() => {
                  const originStr = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
                  const destStr = `${selectedRouteOffice.latitude},${selectedRouteOffice.longitude}`;
                  const gMode = travelMode === 'two-wheeler' ? 'two-wheeler' : travelMode === 'walking' ? 'walking' : 'driving';
                  return originStr 
                    ? `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=${gMode}`
                    : `https://www.google.com/maps/dir/?api=1&destination=${destStr}&travelmode=${gMode}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/70 transition-all active:scale-95 group"
              >
                <Navigation className="w-4 h-4 fill-slate-950 group-hover:rotate-45 transition-transform" />
                <span>🚀 Launch Turn-by-Turn in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  const off = selectedRouteOffice;
                  setSelectedRouteOffice(null);
                  handleBookAtOffice(off);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <span>🎟️ Book Token Pass at this Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
