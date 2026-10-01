import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchQueueState, fetchOffices, fetchAllBookings } from '../services/api';
import { QueueState, Office, Booking } from '../types';
import { Landmark, Users, Clock, Monitor, RefreshCw, Volume2, PauseCircle, PlayCircle, Radio, Activity, Ticket, Tv, Sparkles, ArrowRight, CheckCircle2, QrCode, Zap } from 'lucide-react';
import { KarnatakaBadge } from '../components/KarnatakaBadge';
import { useLang } from '../context/LanguageContext';
import { QRScannerModal } from '../components/QRScannerModal';
import { CouponModal } from '../components/CouponModal';

export const QueueTracker: React.FC = () => {
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const officeIdParam = searchParams.get('office') || '1';

  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number>(Number(officeIdParam));
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [waitingTokens, setWaitingTokens] = useState<Booking[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Booking | null>(null);

  useEffect(() => {
    loadOffices();
  }, []);

  useEffect(() => {
    loadQueue(selectedOfficeId);
    const cleanupWs = connectWebSocket(selectedOfficeId);

    // Reactive event listener for instantaneous local queue updates (e.g. on new booking/admin action)
    const handleQueueUpdated = (e: any) => {
      const officeId = e?.detail?.officeId;
      if (!officeId || officeId === selectedOfficeId) {
        loadQueue(selectedOfficeId);
        loadOffices();
      }
    };

    window.addEventListener('nimmaseva:queue_updated', handleQueueUpdated);

    // Auto-polling fallback every 3 seconds
    const interval = setInterval(() => {
      loadQueue(selectedOfficeId);
    }, 3000);

    return () => {
      cleanupWs && cleanupWs();
      window.removeEventListener('nimmaseva:queue_updated', handleQueueUpdated);
      clearInterval(interval);
    };
  }, [selectedOfficeId]);

  const loadOffices = async () => {
    try {
      const data = await fetchOffices();
      setOffices(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadQueue = async (id: number) => {
    try {
      const [state, bookings] = await Promise.all([
        fetchQueueState(id),
        fetchAllBookings(undefined, id)
      ]);
      setQueueState(state);
      // Active waiting tokens
      const active = bookings.filter(b => b.status === 'Pending' || b.status === 'Called' || b.status === 'In Progress' || b.status === 'Approaching Counter');
      setWaitingTokens(active);
    } catch (e) {
      console.error(e);
    }
  };

  const connectWebSocket = (id: number) => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/api/queue/ws/${id}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setWsConnected(true);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setQueueState(data);
      } catch (e) {
        console.error(e);
      }
    };
    ws.onclose = () => setWsConnected(false);

    return () => ws.close();
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.error(e);
    }
  };

  const currentOffice = offices.find((o) => o.id === selectedOfficeId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <KarnatakaBadge />
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-3">
              <Landmark className="w-8 h-8 text-amber-400" />
              <span>{t.queueTitle}</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">Real-time live queue synchronization for Shivamogga public service counters</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-bold px-2">Center Office:</span>
            <select
              value={selectedOfficeId}
              onChange={(e) => setSelectedOfficeId(Number(e.target.value))}
              className="bg-slate-900 text-amber-400 text-xs font-extrabold px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
            >
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.type})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800/80">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>{wsConnected ? 'LIVE WS' : 'DYNAMIC SYNC'}</span>
            </div>

            <button
              onClick={() => setQrScannerOpen(true)}
              className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl flex items-center gap-1.5 text-xs font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              title="Scan QR Code to Pop Up Your Token Pass"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Pass</span>
            </button>

            <Link
              to={`/display-board/${selectedOfficeId}`}
              target="_blank"
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all"
              title="Open Fullscreen TV Kiosk Display Board"
            >
              <Tv className="w-4 h-4" />
              <span className="hidden sm:inline">TV Display</span>
            </Link>
          </div>
        </div>

        {/* Big Counter Display Board */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Current Serving Token Card */}
          <div className="md:col-span-7 glass-panel rounded-3xl p-10 text-center space-y-6 shadow-2xl border border-emerald-500/30 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs px-5 py-2 rounded-bl-2xl uppercase tracking-widest shadow-lg">
              {t.nowServing.toUpperCase()}
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-extrabold text-xs tracking-widest uppercase block">Active Counter Token</span>
              <p className="text-emerald-400 text-xs font-mono">Counter 01, 02 & 04 Dedicated Processing</p>
            </div>

            <div className="text-7xl sm:text-9xl font-black font-mono tracking-tight text-amber-400 py-6 drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]">
              {queueState?.current_token || 'None'}
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 rounded-2xl text-emerald-300 text-xs font-bold border border-emerald-500/20">
                <Monitor className="w-4 h-4 text-amber-400" />
                <span>Counter Status: ACTIVE</span>
              </div>
              <button
                onClick={playChime}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 shadow"
                title="Test Counter Audio Chime"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Up Next & Queue Stats */}
          <div className="md:col-span-5 glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 flex flex-col justify-between">
            <div>
              <span className="text-slate-400 font-extrabold text-xs uppercase tracking-widest block mb-2">Up Next Token</span>
              <div className="text-5xl font-black font-mono text-white tracking-tight">
                {queueState?.next_token || 'None'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Total Waiting</span>
                <span className="text-3xl font-black text-amber-400 font-mono">{queueState?.total_waiting || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Served Today</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">{queueState?.total_completed_today || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Est Wait per Token: ~12 Mins</span>
              </div>
              {queueState?.is_paused && (
                <span className="px-3 py-1 bg-red-950 text-red-400 font-bold rounded-xl border border-red-800 flex items-center gap-1">
                  <PauseCircle className="w-4 h-4" /> Paused
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Queue Roster Section */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Live Waiting Queue Breakdown ({waitingTokens.length} in Queue)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Tokens currently waiting for counter allocation at {currentOffice?.name}</p>
            </div>
            
            <Link
              to="/book"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Ticket Pass</span>
            </Link>
          </div>

          {waitingTokens.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
              <p>No citizens currently in line. Instant counter allocation available!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {waitingTokens.map((tok, idx) => {
                const isServing = tok.status === 'Called' || tok.status === 'In Progress' || tok.status === 'Approaching Counter';
                const wait = tok.estimated_wait_mins ?? tok.avg_wait_mins ?? 15;
                const proc = tok.service_processing_mins ?? 15;

                return (
                  <div
                    key={tok.id}
                    onClick={() => setSelectedCoupon(tok)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] hover:shadow-xl ${
                      isServing
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-black text-xl text-amber-400">{tok.token_number}</span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        tok.status === 'In Progress' || tok.status === 'Called'
                          ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                          : tok.is_priority
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {tok.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white truncate">{tok.service_name}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">Citizen: {tok.citizen_name}</p>

                    {/* Dual Timing Predictions */}
                    <div className="grid grid-cols-2 gap-2 mt-3 p-2 bg-slate-950/70 rounded-xl border border-slate-800/80 text-[10px]">
                      <div>
                        <span className="text-slate-500 block font-bold">1. Est. Wait</span>
                        <span className="font-mono font-black text-amber-400">~{wait} Mins</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-bold">2. Work Done In</span>
                        <span className="font-mono font-black text-emerald-400">~{proc} Mins</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-400 font-mono">
                        {tok.estimated_call_time ? `Call: ${tok.estimated_call_time}` : `Slot: ${tok.visit_time}`}
                      </span>
                      <span className="text-amber-400 font-bold text-[10px] flex items-center gap-1 hover:underline">
                        View Pass <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Office Info Strip */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <h3 className="text-lg font-bold text-white">{currentOffice?.name}</h3>
            <p className="text-slate-400 mt-0.5">{currentOffice?.address} • Phone: {currentOffice?.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-slate-950 text-slate-300 rounded-xl font-mono text-xs border border-slate-800">
              Operating Hours: 09:00 AM - 05:00 PM
            </span>
            <button
              onClick={() => loadQueue(selectedOfficeId)}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* POP-UP DIGITAL COUPON PASS MODAL */}
      <CouponModal
        booking={selectedCoupon}
        isOpen={selectedCoupon !== null}
        onClose={() => setSelectedCoupon(null)}
      />

      {/* UNIVERSAL QR SCANNER MODAL */}
      <QRScannerModal
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onBookingFound={(b) => setSelectedCoupon(b)}
      />
    </div>
  );
};
