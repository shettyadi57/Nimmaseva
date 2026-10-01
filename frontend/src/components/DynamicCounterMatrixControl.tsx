import React, { useEffect, useState } from 'react';
import { DynamicCounterMatrix, CounterAllocationItem, Service, Office } from '../types';
import { fetchDynamicCounters, reallocateCounter, autoBalanceCounters, fetchServices, fetchOffices } from '../services/api';
import { 
  Layers, Zap, AlertTriangle, CheckCircle2, RefreshCw, Users, Clock, 
  ArrowRightLeft, Sliders, ShieldCheck, ChevronRight, Activity, Flame 
} from 'lucide-react';

interface DynamicCounterMatrixControlProps {
  officeId?: number;
  onCounterUpdated?: () => void;
  className?: string;
  onOpenCoupon?: (tokenNumber: string) => void;
}

export const DynamicCounterMatrixControl: React.FC<DynamicCounterMatrixControlProps> = ({
  officeId = 1,
  onCounterUpdated,
  className = '',
  onOpenCoupon,
}) => {
  const [matrix, setMatrix] = useState<DynamicCounterMatrix | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [currentOfficeId, setCurrentOfficeId] = useState<number>(officeId);
  const [loading, setLoading] = useState(false);
  const [autoBalancing, setAutoBalancing] = useState(false);
  const [balanceSuccessMsg, setBalanceSuccessMsg] = useState<string | null>(null);
  const [editingCounter, setEditingCounter] = useState<number | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  useEffect(() => {
    setCurrentOfficeId(officeId);
  }, [officeId]);

  useEffect(() => {
    loadData(currentOfficeId);
    loadOptions();

    const interval = setInterval(() => {
      loadData(currentOfficeId, false);
    }, 5000);

    const handleQueueUpdated = () => {
      loadData(currentOfficeId, false);
    };

    window.addEventListener('nimmaseva:queue_updated', handleQueueUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('nimmaseva:queue_updated', handleQueueUpdated);
    };
  }, [currentOfficeId]);

  const loadOptions = async () => {
    try {
      const [srvList, offList] = await Promise.all([fetchServices(), fetchOffices()]);
      setServices(srvList);
      setOffices(offList);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async (oid: number, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await fetchDynamicCounters(oid);
      setMatrix(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleAutoBalance = async () => {
    setAutoBalancing(true);
    setBalanceSuccessMsg(null);
    try {
      const res = await autoBalanceCounters(currentOfficeId);
      setBalanceSuccessMsg(
        `Dynamic Rebalancing Active! Prevented citizen bottleneck — estimated ${res.estimated_minutes_saved} minutes saved today!`
      );
      await loadData(currentOfficeId, false);
      onCounterUpdated && onCounterUpdated();
      setTimeout(() => setBalanceSuccessMsg(null), 6000);
    } catch (e) {
      console.error(e);
    } finally {
      setAutoBalancing(false);
    }
  };

  const handleQuickReassign = async (counterNum: number, serviceId: number | 'all') => {
    try {
      const sIds = serviceId === 'all' ? services.map(s => s.id) : [Number(serviceId)];
      const mode = serviceId === 'all' ? 'Dynamic Auto-Balance' : 'Dedicated';
      await reallocateCounter(currentOfficeId, {
        counter_number: counterNum,
        assigned_service_ids: sIds,
        mode
      });
      await loadData(currentOfficeId, false);
      onCounterUpdated && onCounterUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusToggle = async (counter: CounterAllocationItem) => {
    const nextStatus = counter.status === 'Active' ? 'Break' : 'Active';
    try {
      await reallocateCounter(currentOfficeId, {
        counter_number: counter.counter_number,
        status: nextStatus
      });
      await loadData(currentOfficeId, false);
      onCounterUpdated && onCounterUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Top Controls & Auto-Balancing Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                DYNAMIC COUNTER ALLOCATION MATRIX
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automatically distributes and reassigns service desks to eliminate single-service bottlenecks
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {offices.length > 0 && (
              <select
                value={currentOfficeId}
                onChange={(e) => setCurrentOfficeId(Number(e.target.value))}
                className="bg-slate-950 text-xs font-bold text-slate-200 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            )}

            <button
              onClick={handleAutoBalance}
              disabled={autoBalancing}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Zap className={`w-4 h-4 ${autoBalancing ? 'animate-bounce' : ''}`} />
              <span>{autoBalancing ? 'Auto-Balancing Counters...' : '⚡ Smart Auto-Balance Counters'}</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {balanceSuccessMsg && (
          <div className="p-3.5 bg-emerald-950/90 border border-emerald-700 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs shadow-lg animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-bold">{balanceSuccessMsg}</span>
          </div>
        )}

        {/* AI Recommendation Alert */}
        {matrix?.ai_recommendation && (
          <div className="p-3.5 bg-gradient-to-r from-slate-950 to-slate-900 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-300 font-medium">
              <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
              <span>{matrix.ai_recommendation}</span>
            </div>
            {matrix.total_time_saved_today_mins > 0 && (
              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 text-[11px] font-black rounded-full border border-emerald-800 flex-shrink-0">
                ⚡ ~{matrix.total_time_saved_today_mins}m Saved
              </span>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {matrix?.counters.map((counter) => {
          const isActive = counter.status === 'Active';
          const isBusy = counter.status === 'Busy';
          const isBreak = counter.status === 'Break';

          return (
            <div 
              key={counter.counter_number}
              className={`glass-panel p-5 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between space-y-4 ${
                counter.is_overflow
                  ? 'border-amber-500/60 bg-gradient-to-b from-amber-950/20 to-slate-900'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Counter Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-white font-mono">
                      Counter 0{counter.counter_number}
                    </span>
                    {counter.is_overflow && (
                      <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full uppercase tracking-wider">
                        OVERFLOW
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    {counter.operator_name.split('(')[0]}
                  </span>
                </div>

                <button
                  onClick={() => handleStatusToggle(counter)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                    isActive ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900' :
                    isBreak ? 'bg-slate-950 text-amber-400 border-amber-800 hover:bg-slate-900' :
                    'bg-red-950 text-red-400 border-red-800 hover:bg-red-900'
                  }`}
                  title="Click to toggle status"
                >
                  ● {counter.status}
                </button>
              </div>

              {/* Currently Serving Token */}
              <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Currently Serving
                </span>
                {counter.current_token && counter.current_token !== 'None' && counter.current_token !== 'Ready / Idle' ? (
                  <button
                    onClick={() => onOpenCoupon && onOpenCoupon(counter.current_token!)}
                    className="text-2xl font-black font-mono text-amber-400 hover:underline tracking-tight"
                    title="Click to pop up coupon pass"
                  >
                    {counter.current_token}
                  </button>
                ) : (
                  <span className="text-sm font-bold text-slate-400 font-mono">
                    Ready / Open
                  </span>
                )}
              </div>

              {/* Queue Statistics */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Queue Load</span>
                  <span className="text-sm font-black text-white font-mono">
                    {counter.queue_count} Citizens
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Est. Wait</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    ~{counter.estimated_wait_mins}m
                  </span>
                </div>
              </div>

              {/* Assigned Services Badges */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Dynamically Assigned Services:
                </span>
                <div className="flex flex-wrap gap-1">
                  {counter.assigned_service_names.map((name, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 bg-slate-800 text-slate-200 text-[10px] font-bold rounded-lg border border-slate-700 truncate max-w-full"
                      title={name}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Reallocate Control */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">
                  Quick Dynamic Reallocate:
                </label>
                <select
                  onChange={(e) => handleQuickReassign(counter.counter_number, e.target.value as any)}
                  defaultValue=""
                  className="w-full bg-slate-950 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-800 focus:border-amber-400 focus:outline-none"
                >
                  <option value="" disabled>Change assigned service...</option>
                  <option value="all">⚡ Dynamic Overflow (All High Demand)</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

            </div>
          );
        })}
      </div>

      {/* Service Queue Congestion & Balancing Overview */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white">
              Real-Time Service Congestion & Capacity Monitoring
            </h3>
            <p className="text-xs text-slate-400">
              Citizens are prevented from waiting all day through proactive multi-counter load balancing
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            Total In Queue: {matrix?.total_pending_queue || 0} Citizens
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Service Name</th>
                <th className="p-3 text-center">Waiting Queue</th>
                <th className="p-3 text-center">Processing Time</th>
                <th className="p-3 text-center">Active Counters Assigned</th>
                <th className="p-3 text-center">Estimated Wait</th>
                <th className="p-3 text-center">Congestion Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {matrix?.service_congestion.map((sc) => (
                <tr key={sc.service_id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3 font-extrabold text-white">{sc.service_name}</td>
                  <td className="p-3 text-center font-mono font-black text-amber-400">
                    {sc.pending_count} citizens
                  </td>
                  <td className="p-3 text-center font-mono text-slate-300">
                    ~{sc.avg_processing_mins} mins/person
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold rounded-lg border border-slate-800">
                      {sc.allocated_counters} Counters
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono font-black text-emerald-400">
                    ~{sc.total_wait_mins} mins
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      sc.congestion_level === 'High Congestion'
                        ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                        : sc.congestion_level === 'Moderate'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {sc.congestion_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
