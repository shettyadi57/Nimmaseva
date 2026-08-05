import React, { useState, useEffect } from 'react';
import { fetchQueueState, controlQueueAction, fetchOffices } from '../../services/api';
import { QueueState, Office } from '../../types';
import { Monitor, Play, Pause, FastForward, CheckCircle2, RotateCcw, XCircle, ArrowRightLeft, Volume2, VolumeX, Shield, ArrowLeft } from 'lucide-react';
import { KarnatakaBadge } from '../../components/KarnatakaBadge';
import { Link } from 'react-router-dom';

export const QueueManagement: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number>(1);
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [counterNum, setCounterNum] = useState<number>(1);
  const [targetToken, setTargetToken] = useState<string>('');
  const [transferOfficeId, setTransferOfficeId] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedOfficeId) {
      loadQueue(selectedOfficeId);
    }
  }, [selectedOfficeId]);

  const loadInitialData = async () => {
    try {
      const offData = await fetchOffices();
      setOffices(offData);
      if (offData.length > 0) setSelectedOfficeId(offData[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const loadQueue = async (id: number) => {
    try {
      const data = await fetchQueueState(id);
      setQueueState(data);
    } catch (e) {
      console.error(e);
    }
  };

  const announceTokenAudio = (tokenStr: string, counter: number) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const text = `Attention please. Token number ${tokenStr.replace('-', ' ')}, please proceed to Counter 0 ${counter}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error', e);
    }
  };

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      const updated = await controlQueueAction(selectedOfficeId, {
        action,
        counter_number: counterNum,
        target_token: targetToken || undefined,
        transfer_office_id: action === 'transfer' ? Number(transferOfficeId) : undefined
      });
      setQueueState(updated);

      if ((action === 'call_next' || action === 'recall') && updated.current_token && updated.current_token !== 'None') {
        announceTokenAudio(updated.current_token, counterNum);
      }

      setTargetToken('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link to="/admin/dashboard" className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <KarnatakaBadge />
            </div>
            <h1 className="text-3xl font-black text-white mt-1">COUNTER QUEUE COMMAND CENTER</h1>
            <p className="text-xs text-slate-400">Call Next, Complete, Skip, Recall, or Transfer citizen tokens in real-time</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                soundEnabled ? 'bg-amber-950/80 border-amber-800 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title="Toggle Audio Token Voice Announcement"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Voice Alerts ON' : 'Muted'}</span>
            </button>

            <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-bold px-2">Control Office:</span>
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
            </div>
          </div>
        </div>

        {/* Live Display & Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Active Token Display */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-5 text-center shadow-xl">
            <span className="text-xs text-slate-400 font-black uppercase tracking-widest block">Currently Serving Token</span>
            <div className="text-6xl font-mono font-black text-amber-400 py-3 drop-shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              {queueState?.current_token || 'GO-104'}
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-400">Assigned Counter:</span>
              <select
                value={counterNum}
                onChange={(e) => setCounterNum(Number(e.target.value))}
                className="bg-slate-950 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value={1}>Counter 01</option>
                <option value={2}>Counter 02</option>
                <option value={3}>Counter 03</option>
                <option value={4}>Counter 04 (Priority)</option>
              </select>
            </div>
          </div>

          {/* Up Next & Status */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-xs text-slate-400 font-black uppercase tracking-widest block mb-1">Up Next In Line</span>
              <div className="text-4xl font-mono font-black text-white tracking-tight">
                {queueState?.next_token || 'GO-105'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs bg-slate-950 p-4 rounded-2xl border border-slate-900">
              <div>
                <span className="text-slate-500 font-extrabold uppercase block text-[10px]">Total Waiting</span>
                <span className="font-black text-amber-400 text-xl font-mono">{queueState?.total_waiting}</span>
              </div>
              <div>
                <span className="text-slate-500 font-extrabold uppercase block text-[10px]">Served Today</span>
                <span className="font-black text-emerald-400 text-xl font-mono">{queueState?.total_completed_today}</span>
              </div>
            </div>
          </div>

          {/* Pause / Resume Controls */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-5 flex flex-col justify-between shadow-xl">
            <span className="text-xs text-slate-400 font-black uppercase tracking-widest block">Queue Operation Mode</span>
            
            <div className="text-center">
              {queueState?.is_paused ? (
                <span className="inline-block px-5 py-2 bg-red-950 text-red-400 text-xs font-black rounded-full border border-red-800">
                  PAUSED
                </span>
              ) : (
                <span className="inline-block px-5 py-2 bg-emerald-950 text-emerald-400 text-xs font-black rounded-full border border-emerald-800">
                  ACTIVE OPERATIONAL
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAction('pause')}
                disabled={queueState?.is_paused || loading}
                className="flex-1 py-3 bg-red-950/80 hover:bg-red-900/80 disabled:opacity-40 text-red-200 font-bold text-xs rounded-xl border border-red-800 flex items-center justify-center gap-2"
              >
                <Pause className="w-4 h-4 text-red-400" /> Pause
              </button>
              <button
                onClick={() => handleAction('resume')}
                disabled={!queueState?.is_paused || loading}
                className="flex-1 py-3 bg-emerald-950/80 hover:bg-emerald-900/80 disabled:opacity-40 text-emerald-200 font-bold text-xs rounded-xl border border-emerald-800 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 text-emerald-400" /> Resume
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls Grid */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          <h3 className="text-xl font-extrabold text-white border-b border-slate-800 pb-4">Execute Counter Operations</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            
            <button
              onClick={() => handleAction('call_next')}
              disabled={loading}
              className="p-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
            >
              <FastForward className="w-7 h-7 text-slate-950" />
              <span>Call Next Token</span>
            </button>

            <button
              onClick={() => handleAction('complete')}
              disabled={loading}
              className="p-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-7 h-7 text-white" />
              <span>Mark Served / Completed</span>
            </button>

            <button
              onClick={() => handleAction('skip')}
              disabled={loading}
              className="p-5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-2xl font-black text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-2 border border-slate-800 transition-all active:scale-95"
            >
              <RotateCcw className="w-7 h-7 text-amber-400" />
              <span>Skip Citizen Token</span>
            </button>

            <button
              onClick={() => handleAction('recall')}
              disabled={loading}
              className="p-5 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-2xl font-black text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-2 border border-slate-800 transition-all active:scale-95"
            >
              <Volume2 className="w-7 h-7 text-emerald-400" />
              <span>Announce / Recall Token</span>
            </button>
          </div>

          {/* Specific Target Token & Transfer Section */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Target Specific Token Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. GO-105"
                value={targetToken}
                onChange={(e) => setTargetToken(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Transfer Token to Office</label>
              <div className="flex gap-2">
                <select
                  value={transferOfficeId}
                  onChange={(e) => setTransferOfficeId(Number(e.target.value))}
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-bold focus:outline-none"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAction('transfer')}
                  disabled={!targetToken || loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <ArrowRightLeft className="w-4 h-4" /> Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
