import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminSummary, fetchAllBookings, getExportCsvUrl } from '../../services/api';
import { AnalyticsSummary, Booking } from '../../types';
import { useStore } from '../../store/useStore';
import { LayoutDashboard, Users, IndianRupee, CheckCircle2, XCircle, Clock, Download, Search, Filter, Monitor, Settings as SettingsIcon, Sliders, LogOut } from 'lucide-react';
import { KarnatakaBadge } from '../../components/KarnatakaBadge';

export const AdminDashboard: React.FC = () => {
  const { adminUser, setAdminAuth } = useStore();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [statusFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumData, bookData] = await Promise.all([
        fetchAdminSummary(),
        fetchAllBookings(statusFilter || undefined)
      ]);
      setSummary(sumData);
      setBookings(bookData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.token_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.citizen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      
      {/* Top Navbar */}
      <nav className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-black text-emerald-950">
            S
          </div>
          <div>
            <span className="font-bold text-sm text-white block">Shivamogga Seva Admin</span>
            <span className="text-[11px] text-slate-400">Logged in: {adminUser?.name || 'District Operator'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <Link to="/admin/queue" className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 rounded-xl flex items-center gap-1.5">
            <Monitor className="w-4 h-4" /> Live Queue Control
          </Link>
          <Link to="/admin/services" className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-1.5">
            <Sliders className="w-4 h-4" /> Services Control
          </Link>
          <button
            onClick={() => setAdminAuth(null, null)}
            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <KarnatakaBadge />
            <h1 className="text-2xl font-black text-white mt-1">OPERATOR DASHBOARD & QUEUE MONITOR</h1>
          </div>

          <a
            href={getExportCsvUrl()}
            download
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Bookings CSV
          </a>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>TODAY'S BOOKINGS</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{summary?.today_bookings || 0}</div>
            <div className="text-[11px] text-slate-400">Online: {summary?.online_tokens} | Walk-in: {summary?.walkin_tokens}</div>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>TODAY'S REVENUE</span>
              <IndianRupee className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono">₹ {summary?.today_revenue || 0}</div>
            <div className="text-[11px] text-slate-400">Total fees collected today</div>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>COMPLETED TOKENS</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono">{summary?.completed_tokens || 0}</div>
            <div className="text-[11px] text-emerald-300 font-semibold">Priority Served: {summary?.priority_tokens}</div>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>CURRENT QUEUE</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{summary?.current_queue_len || 0}</div>
            <div className="text-[11px] text-slate-400">Avg Wait: ~{summary?.avg_wait_time_mins} mins</div>
          </div>
        </div>

        {/* Bookings Search & Filter Controls */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Recent Citizen Bookings</h3>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search token, name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 text-xs font-bold text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Called">Called</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Token #</th>
                  <th className="p-3">Citizen Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Slot Time</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-750 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400">{b.token_number}</td>
                    <td className="p-3 font-bold text-white">{b.citizen_name}</td>
                    <td className="p-3 text-slate-400">{b.phone}</td>
                    <td className="p-3 text-emerald-300 font-semibold">{b.service_name}</td>
                    <td className="p-3 text-slate-300">{b.visit_time}</td>
                    <td className="p-3">
                      {b.is_priority ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                          {b.priority_reason || 'Priority'}
                        </span>
                      ) : (
                        <span className="text-slate-500">Normal</span>
                      )}
                    </td>
                    <td className="p-3">{b.booking_type}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        b.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        b.status === 'Called' ? 'bg-amber-500/20 text-amber-300' :
                        b.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
