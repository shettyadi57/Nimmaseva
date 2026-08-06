/**
 * DisplayBoard.tsx — Fullscreen kiosk display for office lobby TVs.
 * Shows current token being served, next token, and counter number.
 * Admin-protected. No navigation controls. Uses existing WebSocket channel.
 */
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQueueState } from '../services/api';
import { QueueState } from '../types';
import { Landmark, Monitor, Activity, Clock } from 'lucide-react';

const WS_BASE = (import.meta as any).env?.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

export const DisplayBoard: React.FC = () => {
  const { officeId } = useParams<{ officeId: string }>();
  const [queue, setQueue] = useState<QueueState | null>(null);
  const [time, setTime] = useState(new Date());
  const wsRef = useRef<WebSocket | null>(null);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Initial load
  useEffect(() => {
    if (!officeId) return;
    fetchQueueState(Number(officeId)).then(setQueue).catch(console.error);
  }, [officeId]);

  // WebSocket for live updates — reuses the same /queue/ws/{officeId} channel
  useEffect(() => {
    if (!officeId) return;

    const connect = () => {
      const ws = new WebSocket(`${WS_BASE}/api/v1/queue/ws/${officeId}`);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setQueue(prev => ({ ...prev!, ...data }));
        } catch (_) {}
      };

      ws.onclose = () => {
        // Auto-reconnect after 3 s
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, [officeId]);

  const isClosed = !queue || queue.is_paused;

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none">

      {/* Top strip */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 h-2 w-full" />

      {/* Header bar */}
      <div className="flex items-center justify-between px-10 py-5 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <Landmark className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <p className="text-xl font-black text-white tracking-tight">ನಿಮ್ಮ ಸೇವಾ — Nimma Seva</p>
            <p className="text-xs text-slate-400 font-medium">Shivamogga Smart Token Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-slate-300">
          <div className="flex items-center gap-2 text-sm font-mono">
            <Clock className="w-4 h-4 text-amber-400" />
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Monitor className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">Office #{officeId}</span>
          </div>
        </div>
      </div>

      {/* Main display */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-10">

        {isClosed ? (
          <div className="text-center space-y-4">
            <div className="text-8xl">⏸️</div>
            <p className="text-4xl font-black text-amber-400">SERVICE PAUSED</p>
            <p className="text-xl text-slate-400">Counters are temporarily paused. Please wait.</p>
          </div>
        ) : (
          <>
            {/* Currently serving */}
            <div className="text-center space-y-3">
              <p className="text-lg font-bold text-slate-400 uppercase tracking-[0.4em]">Now Serving</p>
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-[3rem] blur-3xl" />
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/50 rounded-[2.5rem] px-20 py-10 shadow-2xl">
                  <span className="text-[120px] font-black text-amber-400 font-mono leading-none tracking-tighter">
                    {queue?.current_token || '—'}
                  </span>
                </div>
              </div>
              {queue?.active_counters && (
                <p className="text-2xl font-bold text-emerald-300">
                  Active Counters: <span className="text-4xl font-black text-emerald-400">{queue.active_counters}</span>
                </p>
              )}
            </div>

            {/* Next token */}
            <div className="flex items-center gap-8 mt-4">
              <div className="text-center bg-slate-900 rounded-3xl px-12 py-6 border border-slate-700">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Next Token</p>
                <p className="text-5xl font-black text-slate-200 font-mono">{queue?.next_token || '—'}</p>
              </div>
              <div className="text-center bg-slate-900 rounded-3xl px-12 py-6 border border-slate-700">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Waiting</p>
                <p className="text-5xl font-black text-slate-200 font-mono">{queue?.total_waiting ?? '—'}</p>
              </div>
              <div className="text-center bg-slate-900 rounded-3xl px-12 py-6 border border-slate-700">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Completed Today</p>
                <p className="text-5xl font-black text-emerald-400 font-mono">{queue?.total_completed_today ?? '—'}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-10 py-4 border-t border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-300 font-bold">LIVE — Real-time Queue Display</span>
        </div>
        <p className="text-xs text-slate-600">GramOne / Seva Sindhu — Shivamogga District</p>
      </div>
    </div>
  );
};
