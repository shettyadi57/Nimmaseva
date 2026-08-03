import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchQueueState, fetchOffices } from '../services/api';
import { QueueState, Office } from '../types';
import { Landmark, Users, Clock, Monitor, RefreshCw, Volume2, PauseCircle, PlayCircle } from 'lucide-react';
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

  const currentOffice = offices.find((o) => o.id === selectedOfficeId);

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <KarnatakaBadge />
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-2 flex items-center gap-3">
              <Landmark className="w-8 h-8 text-amber-500" />
              <span>LIVE QUEUE DISPLAY BOARD</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">Real-time WebSocket token tracking for Shivamogga public service counters</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-bold px-2">Select Office:</span>
            <select
              value={selectedOfficeId}
              onChange={(e) => setSelectedOfficeId(Number(e.target.value))}
              className="bg-slate-900 text-amber-400 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
            >
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.type})
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>{wsConnected ? 'LIVE WS' : 'POLLING'}</span>
            </div>
          </div>
        </div>

        {/* Big Counter Display Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Current Serving Token */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 border border-emerald-700/60 rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-emerald-950 font-black text-xs px-4 py-1.5 rounded-bl-2xl uppercase">
              NOW SERVING
            </div>

            <span className="text-slate-300 font-bold text-sm tracking-widest uppercase block">Counter Serving Token</span>

            <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-amber-400 py-4 drop-shadow-md">
              {queueState?.current_token || 'None'}
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800/80 rounded-2xl text-emerald-200 text-xs font-bold border border-emerald-600/40">
              <Monitor className="w-4 h-4 text-amber-400" />
              <span>Counter Number: 01 & 02 Active</span>
            </div>
          </div>

          {/* Next Token & Queue Stats */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block mb-2">Up Next Token</span>
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-100">
                {queueState?.next_token || 'None'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-bold block">Total People Waiting</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{queueState?.total_waiting || 0}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-bold block">Served Today</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{queueState?.total_completed_today || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Est Wait Time per Token: ~12 Mins</span>
              </div>
              {queueState?.is_paused && (
                <span className="px-2.5 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg border border-red-500/40 flex items-center gap-1">
                  <PauseCircle className="w-3.5 h-3.5" /> Queue Paused
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Office Info Strip */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <h3 className="text-lg font-bold text-white">{currentOffice?.name}</h3>
            <p className="text-slate-400">{currentOffice?.address} • Phone: {currentOffice?.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-slate-900 text-slate-300 rounded-xl font-bold border border-slate-700">
              Hours: 09:00 AM - 05:00 PM
            </span>
            <button
              onClick={() => loadQueue(selectedOfficeId)}
              className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
