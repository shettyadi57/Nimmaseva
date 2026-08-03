import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminSummary, fetchAllBookings, getExportCsvUrl } from '../../services/api';
import { AnalyticsSummary, Booking } from '../../types';
import { useStore } from '../../store/useStore';
import { LayoutDashboard, Users, IndianRupee, CheckCircle2, XCircle, Clock, Download, Search, Filter, Monitor, Settings as SettingsIcon, Sliders, LogOut, Activity, ArrowUpRight } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* Top Navbar */}
      <nav className="glass-header sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-md">
            S
          </div>
          <div>
            <span className="font-extrabold text-base text-white tracking-tight block">Shivamogga Operator Control</span>
            <span className="text-xs text-slate-400 font-mono">Logged in as: {adminUser?.name || 'District Admin'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <Link to="/admin/queue" className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl flex items-center gap-2 shadow transition-all">
            <Monitor className="w-4 h-4 text-amber-300" /> Counter Queue Control
          </Link>
          <Link to="/admin/services" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 flex items-center gap-2 transition-all">
            <Sliders className="w-4 h-4 text-emerald-400" /> Services Overrides
          </Link>
          <button
            onClick={() => setAdminAuth(null, null)}
            className="p-2.5 bg-red-950/80 text-red-400 hover:bg-red-900/80 rounded-xl border border-red-800/80 shadow"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <KarnatakaBadge />
            <h1 className="text-3xl font-black text-white tracking-tight mt-2">ADMINISTRATOR CONTROL DASHBOARD</h1>
          </div>

          <a
            href={getExportCsvUrl()}
            download
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" /> Export Bookings CSV
          </a>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-extrabold tracking-wider uppercase">
              <span>TODAY'S BOOKINGS</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-4xl font-black text-white font-mono">{summary?.today_bookings || 0}</div>
            <div className="text-xs text-slate-400 font-mono">Online: {summary?.online_tokens} | Walk-in: {summary?.walkin_tokens}</div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-extrabold tracking-wider uppercase">
              <span>TODAY'S REVENUE</span>
              <IndianRupee className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-4xl font-black text-amber-400 font-mono">₹ {summary?.today_revenue || 0}</div>
            <div className="text-xs text-slate-400">Total fees collected today</div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-extrabold tracking-wider uppercase">
              <span>COMPLETED TOKENS</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-4xl font-black text-emerald-400 font-mono">{summary?.completed_tokens || 0}</div>
            <div className="text-xs text-emerald-400 font-bold">Priority Served: {summary?.priority_tokens}</div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-extrabold tracking-wider uppercase">
              <span>CURRENT QUEUE</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-4xl font-black text-white font-mono">{summary?.current_queue_len || 0}</div>
            <div className="text-xs text-slate-400">Avg Processing: ~{summary?.avg_wait_time_mins} mins</div>
          </div>
        </div>

        {/* Bookings Data Table */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-xl font-extrabold text-white">Recent Citizen Booking Records</h3>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search token, name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 text-xs font-bold text-slate-200 px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Called">Called</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Token #</th>
                  <th className="p-4">Citizen Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Slot Time</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-4 font-mono font-black text-amber-400 text-sm">{b.token_number}</td>
                    <td className="p-4 font-bold text-white text-sm">{b.citizen_name}</td>
                    <td className="p-4 text-slate-400 font-mono">{b.phone}</td>
                    <td className="p-4 text-emerald-300 font-extrabold">{b.service_name}</td>
                    <td className="p-4 text-slate-300">{b.visit_time}</td>
                    <td className="p-4">
                      {b.is_priority ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-bold text-[10px]">
                          {b.priority_reason || 'Priority'}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">General</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{b.booking_type}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                        b.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        b.status === 'Called' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        b.status === 'Cancelled' ? 'bg-red-950 text-red-400 border border-red-800' :
                        'bg-slate-900 text-slate-400 border border-slate-800'
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
