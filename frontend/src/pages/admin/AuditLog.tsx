import React, { useEffect, useState, useCallback } from 'react';
import { ScrollText, RefreshCw, Search, ChevronLeft, ChevronRight, User, Zap, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface LogEntry {
  id: number;
  user_name: string;
  action: string;
  details?: string;
  timestamp: string;
}

interface AuditPage {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  logs: LogEntry[];
}

const ACTION_COLOR: Record<string, string> = {
  admin_login:        'text-blue-400 bg-blue-500/10 border-blue-500/30',
  booking_created:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  citizen_cancel:     'text-red-400 bg-red-500/10 border-red-500/30',
  service_status_change: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  queue_call_next:    'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  queue_skip:         'text-slate-400 bg-slate-500/10 border-slate-500/30',
  queue_pause:        'text-orange-400 bg-orange-500/10 border-orange-500/30',
  queue_resume:       'text-green-400 bg-green-500/10 border-green-500/30',
};

const actionBadge = (action: string) => {
  const cls = ACTION_COLOR[action] ?? 'text-slate-400 bg-slate-800 border-slate-700';
  return (
    <span className={`inline-block text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${cls}`}>
      {action.replace(/_/g, ' ')}
    </span>
  );
};

export const AuditLogViewer: React.FC = () => {
  const [data, setData] = useState<AuditPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [actor, setActor] = useState('');
  const [actionType, setActionType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { page, limit: 50 };
      if (actor)      params.actor       = actor;
      if (actionType) params.action_type = actionType;
      if (dateFrom)   params.date_from   = dateFrom;
      if (dateTo)     params.date_to     = dateTo;

      const res = await api.get('/admin/audit-logs', { params });
      setData(res.data);
    } catch (e) {
      setError('Failed to load audit logs. Backend may be offline.');
    } finally {
      setLoading(false);
    }
  }, [page, actor, actionType, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <ScrollText className="w-6 h-6 text-amber-400" />
          Admin Audit Log
        </h1>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold hover:border-amber-500 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="glass-panel rounded-2xl p-5 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Actor / User</label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={actor}
              onChange={e => setActor(e.target.value)}
              placeholder="e.g. Admin Staff"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Action Type</label>
          <div className="relative">
            <Zap className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={actionType}
              onChange={e => setActionType(e.target.value)}
              placeholder="e.g. booking_created"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all"
          >
            <Search className="w-4 h-4" /> Apply Filters
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-950/60 border border-red-800 rounded-2xl text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr>
                {['Timestamp', 'Actor', 'Action', 'Details'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-extrabold text-slate-400 uppercase tracking-widest text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50 animate-pulse">
                    {[1, 2, 3, 4].map(c => (
                      <td key={c} className="px-5 py-4">
                        <div className="h-3 bg-slate-800 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              )}
              {!loading && data?.logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-600">
                    <ScrollText className="w-10 h-10 mx-auto mb-3" />
                    No audit logs match the current filters.
                  </td>
                </tr>
              )}
              {!loading && data?.logs.map(log => (
                <tr key={log.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-400 whitespace-nowrap">{log.timestamp.replace('T', ' ').slice(0, 19)}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-200 whitespace-nowrap">{log.user_name}</td>
                  <td className="px-5 py-3.5">{actionBadge(log.action)}</td>
                  <td className="px-5 py-3.5 text-slate-400 max-w-xs truncate">{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 bg-slate-900 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              {data.total} total entries · Page {data.page} of {data.total_pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40 hover:border-amber-500 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40 hover:border-amber-500 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
