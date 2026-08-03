import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchQueueState, fetchOffices } from '../services/api';
import { QueueState, Office } from '../types';
import { Landmark, Users, Clock, Monitor, RefreshCw, Volume2, PauseCircle, PlayCircle, Radio, Activity } from 'lucide-react';
import { KarnatakaBadge } from '../components/KarnatakaBadge';

export const QueueTracker: React.FC = () => {
  const [searchParams] = useSearchParams();
  const officeIdParam = searchParams.get('office') || '1';

  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number>(Number(officeIdParam));
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    loadOffices();
  }, []);

  useEffect(() => {
    loadQueue(selectedOfficeId);
    connectWebSocket(selectedOfficeId);
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
      const state = await fetchQueueState(id);
      setQueueState(state);
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
              <span>LIVE QUEUE DISPLAY BOARD</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">Real-time WebSocket token tracking for Shivamogga public service counters</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
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
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>{wsConnected ? 'LIVE WS' : 'POLLING'}</span>
            </div>
          </div>
        </div>

        {/* Big Counter Display Board */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Current Serving Token Card */}
          <div className="md:col-span-7 glass-panel rounded-3xl p-10 text-center space-y-6 shadow-2xl border border-emerald-500/30 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs px-5 py-2 rounded-bl-2xl uppercase tracking-widest shadow-lg">
              NOW SERVING
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-extrabold text-xs tracking-widest uppercase block">Active Counter Token</span>
              <p className="text-emerald-400 text-xs font-mono">Counter 01 & 02 Dedicated Processing</p>
            </div>

            <div className="text-7xl sm:text-9xl font-black font-mono tracking-tight text-amber-400 py-6 drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]">
              {queueState?.current_token || 'GO-001'}
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
                {queueState?.next_token || 'GO-002'}
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
    </div>
  );
};
