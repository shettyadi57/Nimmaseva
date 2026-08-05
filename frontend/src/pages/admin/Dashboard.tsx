import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminSummary, fetchAllBookings, updateBookingStatus, createWalkinBooking, fetchServices, fetchOffices, getExportCsvUrl } from '../../services/api';
import { AnalyticsSummary, Booking, Service, Office } from '../../types';
import { useStore } from '../../store/useStore';
import { 
  Users, IndianRupee, CheckCircle2, XCircle, Clock, Download, Search, Filter, 
  Monitor, Sliders, LogOut, Activity, PlusCircle, RefreshCw, Volume2, ShieldCheck, 
  Eye, Check, Phone, User, Calendar, ExternalLink
} from 'lucide-react';
import { KarnatakaBadge } from '../../components/KarnatakaBadge';

export const AdminDashboard: React.FC = () => {
  const { adminUser, setAdminAuth } = useStore();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [officeFilter, setOfficeFilter] = useState<number | ''>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Walk-in Ticket Modal State
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinServiceId, setWalkinServiceId] = useState(1);
  const [walkinOfficeId, setWalkinOfficeId] = useState(1);
  const [walkinPriority, setWalkinPriority] = useState(false);
  const [walkinPriorityReason, setWalkinPriorityReason] = useState('Senior Citizen (60+)');
  const [modalLoading, setModalLoading] = useState(false);

  // Selected Ticket Detail Modal
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadOptions();
  }, [statusFilter, officeFilter]);

  // Live Auto-Polling every 4 seconds to reflect citizen bookings in real-time
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, statusFilter, officeFilter]);

  const loadOptions = async () => {
    try {
      const [srvData, offData] = await Promise.all([fetchServices(), fetchOffices()]);
      setServices(srvData);
      setOffices(offData);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDashboardData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [sumData, bookData] = await Promise.all([
        fetchAdminSummary(officeFilter ? Number(officeFilter) : undefined),
        fetchAllBookings(statusFilter || undefined, officeFilter ? Number(officeFilter) : undefined)
      ]);
      setSummary(sumData);
      setBookings(bookData);
    } catch (e) {
      console.error(e);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: string, counterNumber: number = 1) => {
    try {
      await updateBookingStatus(bookingId, newStatus, counterNumber);
      loadDashboardData(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const payload = {
        citizen_name: walkinName || 'Walk-in Citizen',
        phone: walkinPhone || '9876543210',
        service_id: Number(walkinServiceId),
        office_id: Number(walkinOfficeId),
        is_priority: walkinPriority,
        priority_reason: walkinPriority ? walkinPriorityReason : null
      };

      await createWalkinBooking(payload);
      setShowWalkinModal(false);
      setWalkinName('');
      setWalkinPhone('');
      loadDashboardData(true);
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
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
            <span className="text-xs text-slate-400 font-mono">Logged in as: {adminUser?.name || 'District Admin'} ({adminUser?.role || 'Govt Official'})</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              autoRefresh ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Live Syncing' : 'Paused Sync'}
          </button>

          <Link to="/admin/queue" className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl flex items-center gap-2 shadow transition-all">
            <Monitor className="w-4 h-4 text-amber-300" /> Counter Queue Control
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Live Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-slate-300">
              DISTRICT SERVER STATUS: <span className="text-emerald-400">ONLINE & LIVE</span> | Office: Shivamogga Main & Seva Sindhu District Hub
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWalkinModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Issue Walk-in Ticket
            </button>

            <a
              href={getExportCsvUrl()}
              download
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-extrabold text-xs rounded-xl shadow transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" /> Export CSV
            </a>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <KarnatakaBadge />
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">ADMINISTRATOR TICKET & QUEUE CONTROL</h1>
          <p className="text-xs text-slate-400">Real-time citizen booking statistics, token state updates, and walk-in ticket management</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-extrabold tracking-wider uppercase">
              <span>TOTAL BOOKED TICKETS</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-4xl font-black text-white font-mono">{summary?.today_bookings || 0}</div>
            <div className="text-xs text-slate-400 font-mono">
              Online: <span className="text-emerald-400 font-bold">{summary?.online_tokens}</span> | Walk-in: <span className="text-amber-400 font-bold">{summary?.walkin_tokens}</span>
            </div>
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
              <span>SERVED / COMPLETED</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-4xl font-black text-emerald-400 font-mono">{summary?.completed_tokens || 0}</div>
            <div className="text-xs text-emerald-400 font-bold">Priority Pass Served: {summary?.priority_tokens}</div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-extrabold tracking-wider uppercase">
              <span>ACTIVE QUEUE LENGTH</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-4xl font-black text-white font-mono">{summary?.current_queue_len || 0}</div>
            <div className="text-xs text-slate-400">Avg Wait Time: ~{summary?.avg_wait_time_mins} mins</div>
          </div>
        </div>

        {/* Bookings Data Table Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-white">Live Citizen Booking Records</h3>
              <p className="text-xs text-slate-400">Click actions in the table to Call, Complete, or Cancel citizen tokens live</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search token, citizen name, phone..."
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
                <option value="Called">Called / In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={officeFilter}
                onChange={(e) => setOfficeFilter(e.target.value ? Number(e.target.value) : '')}
                className="bg-slate-950 text-xs font-bold text-slate-200 px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="">All Offices</option>
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
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
                  <th className="p-4">Requested Service</th>
                  <th className="p-4">Visit Time</th>
                  <th className="p-4">Priority / Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Live Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-bold">
                      No citizen booking records match the search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-4 font-mono font-black text-amber-400 text-sm">
                        <button
                          onClick={() => setSelectedTicket(b)}
                          className="hover:underline flex items-center gap-1 text-amber-400"
                        >
                          {b.token_number}
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </button>
                      </td>
                      <td className="p-4 font-bold text-white text-sm">{b.citizen_name}</td>
                      <td className="p-4 text-slate-400 font-mono">{b.phone}</td>
                      <td className="p-4 text-emerald-300 font-extrabold">{b.service_name}</td>
                      <td className="p-4 text-slate-300 font-mono">{b.visit_time}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {b.is_priority ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-bold text-[10px] w-fit">
                              {b.priority_reason || 'Priority Pass'}
                            </span>
                          ) : (
                            <span className="text-slate-500 font-medium text-[11px]">General</span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">[{b.booking_type}]</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                          b.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          b.status === 'Called' || b.status === 'In Progress' ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse' :
                          b.status === 'Cancelled' ? 'bg-red-950 text-red-400 border border-red-800' :
                          'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {b.status === 'Pending' && (
                            <button
                              onClick={() => handleStatusChange(b.id, 'Called')}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[10px] shadow transition-all"
                            >
                              Call Token
                            </button>
                          )}
                          {(b.status === 'Called' || b.status === 'Pending' || b.status === 'In Progress') && (
                            <button
                              onClick={() => handleStatusChange(b.id, 'Completed')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-[10px] shadow transition-all"
                            >
                              Serve Complete
                            </button>
                          )}
                          {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                            <button
                              onClick={() => handleStatusChange(b.id, 'Cancelled')}
                              className="px-2.5 py-1 bg-red-950 text-red-400 hover:bg-red-900 border border-red-800 font-bold rounded-lg text-[10px] transition-all"
                            >
                              Cancel
                            </button>
                          )}
                          <Link
                            to={`/token/${b.token_number}`}
                            target="_blank"
                            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800"
                            title="View E-Ticket Pass"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* WALK-IN TICKET CREATION MODAL */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-md w-full space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white">Issue Walk-in Ticket / On-Spot Token</h3>
              <button
                onClick={() => setShowWalkinModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWalkin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Citizen Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Citizen Name"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="9876543210"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Requested Service</label>
                <select
                  value={walkinServiceId}
                  onChange={(e) => setWalkinServiceId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} (Fee: ₹{s.fee})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Assigned GramOne / Seva Sindhu Office</label>
                <select
                  value={walkinOfficeId}
                  onChange={(e) => setWalkinOfficeId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 font-bold text-amber-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walkinPriority}
                    onChange={(e) => setWalkinPriority(e.target.checked)}
                    className="rounded border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>Grant Express Priority Pass</span>
                </label>

                {walkinPriority && (
                  <select
                    value={walkinPriorityReason}
                    onChange={(e) => setWalkinPriorityReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold focus:outline-none"
                  >
                    <option value="Senior Citizen (60+)">Senior Citizen (60+)</option>
                    <option value="Person with Disability (PwD)">Person with Disability (PwD)</option>
                    <option value="Pregnant Women">Pregnant Women</option>
                    <option value="Emergency Case">Emergency Case</option>
                  </select>
                )}
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
              >
                {modalLoading ? 'Generating Walk-in Token...' : 'Print & Issue Walk-in Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SELECTED TICKET AUDIT MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">TICKET AUDIT RECORD</span>
                <h3 className="text-2xl font-black text-white font-mono">{selectedTicket.token_number}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-slate-400">Citizen Name:</span>
                <span className="text-white font-bold">{selectedTicket.citizen_name}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-slate-400">Phone:</span>
                <span className="text-white font-bold">{selectedTicket.phone}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-slate-400">Aadhaar Reference:</span>
                <span className="text-emerald-400 font-bold">{selectedTicket.aadhaar}</span>
              </div>
                <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-slate-400">Service:</span>
                <span className="text-amber-400 font-bold">{selectedTicket.service_name}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-slate-400">Current Status:</span>
                <span className="text-white font-bold">{selectedTicket.status}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to={`/token/${selectedTicket.token_number}`}
                target="_blank"
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl text-center shadow"
              >
                Open E-Pass Ticket Page
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
