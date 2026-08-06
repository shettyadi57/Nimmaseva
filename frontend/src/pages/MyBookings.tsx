import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { fetchBookingsByPhone, cancelBooking } from '../services/api';
import { Booking } from '../types';
import {
  Ticket, Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight,
  Phone, CalendarDays, Building2, RefreshCw, History, LogIn, X, AlertCircle
} from 'lucide-react';

// ── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: Booking['status'] }> = ({ status }) => {
  const map: Record<string, string> = {
    Pending:    'bg-amber-500/10 text-amber-300 border-amber-500/30',
    Called:     'bg-blue-500/10 text-blue-300 border-blue-500/30',
    'In Progress': 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    Completed:  'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    Cancelled:  'bg-red-500/10 text-red-300 border-red-500/30',
    Skipped:    'bg-slate-500/10 text-slate-300 border-slate-500/30',
    'No-Show':  'bg-rose-500/10 text-rose-300 border-rose-500/30',
    Transferred:'bg-purple-500/10 text-purple-300 border-purple-500/30',
    'Approaching Counter': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  };
  return (
    <span className={`inline-block text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${map[status] ?? map.Skipped}`}>
      {status}
    </span>
  );
};

// ── Cancel confirmation modal ─────────────────────────────────────────────────
const CancelModal: React.FC<{
  booking: Booking;
  onConfirm: (reason: string) => void;
  onClose: () => void;
  loading: boolean;
}> = ({ booking, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-red-800/40 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <h2 className="text-lg font-extrabold text-white">Cancel Booking?</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400">Token</p>
          <p className="text-base font-black text-amber-400 font-mono">{booking.token_number}</p>
          <p className="text-xs text-slate-300">{booking.service_name} — {booking.visit_date} at {booking.visit_time}</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">Reason (optional)</label>
          <textarea
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Plans changed, rescheduling…"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm resize-none focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Yes, Cancel Booking
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-all"
          >
            Keep It
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const MyBookings: React.FC = () => {
  const { citizenProfile } = useStore();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!citizenProfile?.phone) return;
    load();
  }, [citizenProfile?.phone]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchBookingsByPhone(citizenProfile!.phone);
      setBookings(data);
    } catch (e) {
      setErrorMsg('Failed to load booking history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reason: string) => {
    if (!cancelTarget || !citizenProfile) return;
    setCancelLoading(true);
    setErrorMsg('');
    try {
      await cancelBooking(cancelTarget.id, citizenProfile.phone, reason);
      setSuccessMsg(`Token ${cancelTarget.token_number} cancelled successfully.`);
      setCancelTarget(null);
      // Refresh list
      await load();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const isCancellable = (b: Booking) =>
    !['Called', 'In Progress', 'Completed', 'Cancelled'].includes(b.status);

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!citizenProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="glass-panel rounded-3xl p-10 border border-slate-800 max-w-sm w-full text-center space-y-5">
          <History className="w-14 h-14 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-extrabold text-white">Login Required</h2>
          <p className="text-slate-400 text-sm">Please login to view your booking history.</p>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-extrabold text-sm"
          >
            <LogIn className="w-4 h-4" />
            Citizen Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
          loading={cancelLoading}
        />
      )}

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <History className="w-6 h-6 text-amber-400" />
                My Booking History
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                All tokens for +91 {citizenProfile.phone} — newest first
              </p>
            </div>
            <button
              onClick={load}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feedback */}
        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800 rounded-2xl p-4 flex items-center gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-800 rounded-2xl p-4 flex items-center gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-panel rounded-2xl p-5 border border-slate-800 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-800 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && bookings.length === 0 && (
          <div className="glass-panel rounded-3xl p-12 border border-slate-800 text-center space-y-4">
            <Ticket className="w-14 h-14 text-slate-700 mx-auto" />
            <p className="text-lg font-extrabold text-white">No Bookings Yet</p>
            <p className="text-sm text-slate-400">Book your first token to see your history here.</p>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-sm"
            >
              <Ticket className="w-4 h-4" />
              Book a Token
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Booking list */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map(b => (
              <div
                key={b.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Token badge */}
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center flex-shrink-0">
                    <Ticket className="w-5 h-5 text-amber-400 mb-0.5" />
                    <span className="text-[9px] font-black text-amber-400 font-mono leading-tight">{b.token_number.split('-')[1] || b.token_number}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-white truncate">{b.service_name || 'Government Service'}</span>
                      <StatusBadge status={b.status} />
                      {b.is_priority && (
                        <span className="text-[9px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                          Priority
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />{b.office_name || `Office #${b.office_id}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />{b.visit_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{b.visit_time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Token: <span className="font-mono text-slate-300">{b.token_number}</span></p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Link
                      to={`/token/${b.token_number}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
                    >
                      View Pass <ArrowRight className="w-3 h-3" />
                    </Link>
                    {isCancellable(b) && (
                      <button
                        onClick={() => { setErrorMsg(''); setSuccessMsg(''); setCancelTarget(b); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-950/70 text-xs font-bold text-red-400 border border-red-800/40 transition-all"
                      >
                        <XCircle className="w-3 h-3" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
