import React, { useState, useEffect } from 'react';
import { fetchQueueState, controlQueueAction, fetchOffices } from '../../services/api';
import { QueueState, Office } from '../../types';
import { Monitor, Play, Pause, FastForward, CheckCircle2, RotateCcw, XCircle, ArrowRightLeft, Volume2, Shield } from 'lucide-react';
import { KarnatakaBadge } from '../../components/KarnatakaBadge';

export const QueueManagement: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number>(1);
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [counterNum, setCounterNum] = useState<number>(1);
  const [targetToken, setTargetToken] = useState<string>('');
  const [transferOfficeId, setTransferOfficeId] = useState<number>(2);
  const [loading, setLoading] = useState(false);

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
      setTargetToken('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <KarnatakaBadge />
            <h1 className="text-2xl font-black mt-1">COUNTER OPERATOR QUEUE CONTROL</h1>
            <p className="text-xs text-slate-400">Call, Skip, Recall, Complete or Transfer tokens in real-time</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold">Select Office:</span>
            <select
              value={selectedOfficeId}
              onChange={(e) => setSelectedOfficeId(Number(e.target.value))}
              className="bg-slate-800 text-amber-400 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700"
            >
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Display & Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active Token Display */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4 text-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Currently Serving Token</span>
            <div className="text-5xl font-mono font-black text-amber-400 py-2">
              {queueState?.current_token || 'None'}
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-300">Counter Assigned:</span>
              <select
                value={counterNum}
                onChange={(e) => setCounterNum(Number(e.target.value))}
                className="bg-slate-900 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-700"
              >
                <option value={1}>Counter 01</option>
                <option value={2}>Counter 02</option>
                <option value={3}>Counter 03</option>
                <option value={4}>Counter 04 (Priority)</option>
              </select>
            </div>
          </div>

          {/* Up Next & Status */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Next In Queue</span>
              <div className="text-3xl font-mono font-bold text-slate-200 mt-1">
                {queueState?.next_token || 'None'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs bg-slate-900 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10px]">Waiting</span>
                <span className="font-bold text-amber-400 text-base">{queueState?.total_waiting}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Completed Today</span>
                <span className="font-bold text-emerald-400 text-base">{queueState?.total_completed_today}</span>
              </div>
            </div>
          </div>

          {/* Pause / Resume Controls */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Queue Status</span>
            
            <div className="text-center">
              {queueState?.is_paused ? (
                <span className="inline-block px-4 py-1.5 bg-red-500/20 text-red-400 text-xs font-extrabold rounded-full border border-red-500/40">
                  PAUSED
                </span>
              ) : (
                <span className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-extrabold rounded-full border border-emerald-500/40">
                  ACTIVE OPERATIONAL
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAction('pause')}
                disabled={queueState?.is_paused || loading}
                className="flex-1 py-2.5 bg-red-600/80 hover:bg-red-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Pause className="w-4 h-4" /> Pause Queue
              </button>
              <button
                onClick={() => handleAction('resume')}
                disabled={!queueState?.is_paused || loading}
                className="flex-1 py-2.5 bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Resume Queue
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls Grid */}
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-3">Execute Queue Actions</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <button
              onClick={() => handleAction('call_next')}
              disabled={loading}
              className="p-4 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <FastForward className="w-6 h-6" />
              <span>Call Next Token</span>
            </button>

            <button
              onClick={() => handleAction('complete')}
              disabled={loading}
              className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>Mark Served / Completed</span>
            </button>

            <button
              onClick={() => handleAction('skip')}
              disabled={loading}
              className="p-4 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <RotateCcw className="w-6 h-6" />
              <span>Skip Citizen Token</span>
            </button>

            <button
              onClick={() => handleAction('recall')}
              disabled={loading}
              className="p-4 bg-slate-700 hover:bg-slate-600 text-emerald-300 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Volume2 className="w-6 h-6" />
              <span>Recall / Announce Token</span>
            </button>
          </div>

          {/* Specific Target Token & Transfer Section */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Target Specific Token Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. GO-015"
                value={targetToken}
                onChange={(e) => setTargetToken(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Transfer Token to Office</label>
              <div className="flex gap-2">
                <select
                  value={transferOfficeId}
                  onChange={(e) => setTransferOfficeId(Number(e.target.value))}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAction('transfer')}
                  disabled={!targetToken || loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1"
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
