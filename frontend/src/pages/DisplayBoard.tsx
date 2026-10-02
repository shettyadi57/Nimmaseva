/**
 * DisplayBoard.tsx — Fullscreen kiosk display for office lobby TVs.
 * Shows current token being served, next token, counter number, and
 * vocalises bilingual Kannada-first announcements via Web Speech API.
 * Admin-protected. No navigation controls. Uses existing WebSocket channel.
 */
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQueueState } from '../services/api';
import { QueueState } from '../types';
import { Landmark, Monitor, Activity, Clock, Volume2 } from 'lucide-react';

const WS_BASE = (import.meta as any).env?.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

export const DisplayBoard: React.FC = () => {
  const { officeId } = useParams<{ officeId: string }>();
  const [queue, setQueue] = useState<QueueState | null>(null);
  const [time, setTime] = useState(new Date());
  const [tokenFlash, setTokenFlash] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const prevTokenRef = useRef<string | null>(null);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Bilingual (Kannada first, then English) speech announcement ─────────────
  const announceToken = (token: string, counter: number) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();

      const knText = `ಟೋಕನ್ ಸಂಖ್ಯೆ ${token.replace(/-/g, ' ')}, ಕೌಂಟರ್ ${counter} ಕ್ಕೆ ದಯವಿಟ್ಟು ಬನ್ನಿ.`;
      const enText = `Token number ${token.replace(/-/g, ' ')}, please proceed to Counter ${counter}.`;

      const utterKn = new SpeechSynthesisUtterance(knText);
      utterKn.lang = 'kn-IN';
      utterKn.rate = 0.85;
      utterKn.pitch = 1.0;

      const utterEn = new SpeechSynthesisUtterance(enText);
      utterEn.lang = 'en-IN';
      utterEn.rate = 0.9;
      utterEn.pitch = 1.0;

      window.speechSynthesis.speak(utterKn);
      window.speechSynthesis.speak(utterEn);
    } catch (e) {
      console.error('Speech synthesis error', e);
    }
  };

  const loadQueue = (id: number) => {
    fetchQueueState(id).then(setQueue).catch(console.error);
  };

  // Initial load & dynamic event listener
  useEffect(() => {
    if (!officeId) return;
    const numId = Number(officeId);
    loadQueue(numId);

    const handleQueueUpdated = (e: any) => {
      const targetId = e?.detail?.officeId;
      if (!targetId || targetId === numId) {
        loadQueue(numId);
      }
    };

    window.addEventListener('nimmaseva:queue_updated', handleQueueUpdated);

    // Dynamic auto-poll fallback every 3s
    const interval = setInterval(() => {
      loadQueue(numId);
    }, 3000);

    return () => {
      window.removeEventListener('nimmaseva:queue_updated', handleQueueUpdated);
      clearInterval(interval);
    };
  }, [officeId]);

  // ── Detect new token call → announce + flash visual ─────────────────────────
  useEffect(() => {
    if (!queue?.current_token || queue.current_token === 'None') return;
    if (queue.current_token !== prevTokenRef.current) {
      prevTokenRef.current = queue.current_token;
      const counter = (queue as any).counter_number || queue.active_counters || 1;
      announceToken(queue.current_token, counter);

      // Visual flash pulse for 5 seconds (hearing-impaired accessibility)
      setTokenFlash(true);
      const t = setTimeout(() => setTokenFlash(false), 5000);
      return () => clearTimeout(t);
    }
  }, [queue?.current_token]);

  // WebSocket for live updates
  useEffect(() => {
    if (!officeId) return;

    const connect = () => {
      try {
        const ws = new WebSocket(`${WS_BASE}/api/queue/ws/${officeId}`);

        wsRef.current = ws;

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            setQueue(prev => ({ ...prev!, ...data }));
          } catch (_) {}
        };

        ws.onclose = () => {
          setTimeout(connect, 3000);
        };
      } catch (_) {}
    };

    connect();
    return () => wsRef.current?.close();
  }, [officeId]);

  const isClosed = !queue || queue.is_paused;
  const counterNum = (queue as any)?.counter_number || null;

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none">

      {/* Top Karnataka colour strip */}
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
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Bilingual Voice Active</span>
          </div>
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
            <p className="text-4xl font-black text-amber-400">SERVICE PAUSED / ಸೇವೆ ನಿಲ್ಲಿಸಲಾಗಿದೆ</p>
            <p className="text-xl text-slate-400">Counters are temporarily paused. Please wait. / ದಯವಿಟ್ಟು ಕಾಯಿರಿ.</p>
          </div>
        ) : (
          <>
            {/* Currently serving */}
            <div className="text-center space-y-3">
              <p className="text-lg font-bold text-slate-400 uppercase tracking-[0.4em]">
                ಈಗ ಸೇವೆ ಸ್ವೀಕರಿಸುತ್ತಿರುವ / Now Serving
              </p>
              <div className="relative">
                <div className={`absolute inset-0 rounded-[3rem] blur-3xl transition-colors duration-1000 ${tokenFlash ? 'bg-amber-400/40' : 'bg-amber-500/20'}`} />
                <div className={`relative border-2 rounded-[2.5rem] px-20 py-10 shadow-2xl transition-all duration-700 ${tokenFlash
                    ? 'bg-gradient-to-br from-amber-900/80 to-slate-900 border-amber-400 shadow-amber-500/30'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/50'
                }`}>
                  <span className="text-[120px] font-black text-amber-400 font-mono leading-none tracking-tighter">
                    {queue?.current_token || '—'}
                  </span>
                </div>
              </div>

              {/* ── Counter Desk Badge (KEY FIX) ── */}
              {counterNum && (
                <div className="flex items-center justify-center mt-4">
                  <div className="flex items-center gap-4 bg-slate-900 border-2 border-emerald-500/50 rounded-2xl px-8 py-3 shadow-lg shadow-emerald-500/10">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">ಕೌಂಟರ್ ಡೆಸ್ಕ್</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">COUNTER DESK</p>
                    </div>
                    <div className="text-6xl font-black font-mono text-emerald-400">
                      0{counterNum}
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-emerald-400 font-bold">ದಯವಿಟ್ಟು ಬನ್ನಿ</p>
                      <p className="text-xs text-emerald-400 font-bold">Proceed Here →</p>
                    </div>
                  </div>
                </div>
              )}

              {queue?.active_counters && (
                <p className="text-2xl font-bold text-emerald-300 mt-2">
                  ಸಕ್ರಿಯ ಕೌಂಟರ್‌ಗಳು: <span className="text-4xl font-black text-emerald-400">{queue.active_counters}</span>
                  <span className="text-lg text-slate-400 ml-3">Active Counters</span>
                </p>
              )}
            </div>

            {/* Next token + stats */}
            <div className="flex items-center gap-8 mt-4">
              <div className="text-center bg-slate-900 rounded-3xl px-12 py-6 border border-slate-700">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">ಮುಂದಿನ ಟೋಕನ್ / Next Token</p>
                <p className="text-5xl font-black text-slate-200 font-mono">{queue?.next_token || '—'}</p>
              </div>
              <div className="text-center bg-slate-900 rounded-3xl px-12 py-6 border border-slate-700">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">ಕಾಯುತ್ತಿರುವವರು / Waiting</p>
                <p className="text-5xl font-black text-slate-200 font-mono">{queue?.total_waiting ?? '—'}</p>
              </div>
              <div className="text-center bg-slate-900 rounded-3xl px-12 py-6 border border-slate-700">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">ಇಂದು ಪೂರ್ಣ / Completed Today</p>
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
          <span className="text-xs text-emerald-300 font-bold">LIVE — Real-time Queue Display • ನೇರ ಪ್ರಸಾರ</span>
        </div>
        <p className="text-xs text-slate-600">GramOne / Seva Sindhu — Shivamogga District • ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ</p>
      </div>
    </div>
  );
};
