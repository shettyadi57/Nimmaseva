import React from 'react';
import { Link } from 'react-router-dom';
import { Booking } from '../types';
import { downloadPDFUrl } from '../services/api';
import { KarnatakaBadge } from './KarnatakaBadge';
import { RealQRCode } from './RealQRCode';
import { 
  X, Clock, CheckCircle2, AlertCircle, ArrowRight, Download, Printer, 
  Sparkles, ShieldCheck, MapPin, User, Phone, Layers, Zap, Navigation 
} from 'lucide-react';

interface CouponModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge?: () => void;
  isAcknowledged?: boolean;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  booking,
  isOpen,
  onClose,
  onAcknowledge,
  isAcknowledged = false,
}) => {
  if (!isOpen || !booking) return null;

  const isCalled = booking.status === 'Called' || booking.status === 'Approaching Counter' || booking.reminder_sent;
  const isCompleted = booking.status === 'Completed';

  // Calculate or fallback timing predictions
  const waitMins = booking.estimated_wait_mins ?? booking.avg_wait_mins ?? 15;
  const callTime = booking.estimated_call_time || (isCalled ? 'Now at Counter' : `~${waitMins} Mins`);
  const serviceProcMins = booking.service_processing_mins ?? 15;
  const compTime = booking.estimated_completion_time || (isCompleted ? 'Completed' : `~${waitMins + serviceProcMins} Mins`);
  const timeSaved = booking.time_saved_by_dynamic_allocation_mins ?? 0;
  const activeCounters = booking.active_counters_for_service ?? 1;

  const tokenUrl = `${window.location.origin}/token/${booking.token_number}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-400/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-all active:scale-95"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Karnataka Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 p-6 text-center border-b border-slate-800 relative">
          <KarnatakaBadge />
          <h2 className="text-xl font-black text-white tracking-tight mt-1">
            OFFICIAL CITIZEN DIGITAL PASS
          </h2>
          <p className="text-xs text-amber-400 font-bold flex items-center justify-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {booking.office_name || 'GramOne Shivamogga Main Hub'}
          </p>
        </div>

        {/* Main Coupon Body */}
        <div className="p-6 space-y-6">
          
          {/* Big Token Number Display */}
          <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800 text-center space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />
            
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Allocated Coupon / Token Number
            </span>

            <div className="text-5xl sm:text-6xl font-black font-mono text-amber-400 tracking-tight drop-shadow-[0_0_20px_rgba(245,158,11,0.35)]">
              {booking.token_number}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="px-3 py-1 bg-emerald-950 text-emerald-400 rounded-full font-mono text-xs font-bold border border-emerald-800">
                Verify Code: {booking.verification_code}
              </span>
              
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                isCompleted ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                booking.status === 'Approaching Counter' ? 'bg-emerald-900 text-emerald-300 border-emerald-600' :
                booking.status === 'Called' ? 'bg-amber-950 text-amber-400 border-amber-800 animate-pulse' :
                'bg-slate-900 text-slate-300 border-slate-800'
              }`}>
                ● {booking.status}
              </span>

              <span className="px-3 py-1 bg-slate-900 text-white rounded-full font-mono text-xs font-black border border-slate-800">
                Counter 0{booking.counter_number || 1}
              </span>
            </div>
          </div>

          {/* DUAL PREDICTIVE TIMELINE ENGINE */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900/90 rounded-2xl p-5 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  AI Dynamic Predictive Timeline
                </span>
              </div>
              {timeSaved > 0 && (
                <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-black rounded-full border border-emerald-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  Saved ~{timeSaved} mins
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Prediction 1: Wait Time Before Person's Turn */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Wait Time Before Turn</span>
                </div>
                <div className="text-xl font-black text-amber-400 font-mono">
                  {isCompleted ? 'Served' : (isCalled ? 'Now at Counter' : `~${waitMins} Mins`)}
                </div>
                <p className="text-[10px] text-slate-400">
                  {isCompleted ? 'Service finished' : (isCalled ? 'Currently being called' : `Est. Call: ${callTime} (${booking.people_ahead ?? 0} ahead)`)}
                </p>
              </div>

              {/* Prediction 2: Completion of Citizen's Own Work */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Service Work Completion</span>
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  {isCompleted ? 'Completed' : `~${serviceProcMins} Mins`}
                </div>
                <p className="text-[10px] text-slate-400">
                  {isCompleted ? 'Documents delivered' : `Est. Total Finish: ${compTime}`}
                </p>
              </div>
            </div>

            {/* Dynamic Counter notice */}
            {activeCounters > 1 && (
              <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-800/80 text-[11px] text-emerald-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Dynamic Multi-Counter Enabled:</strong> {activeCounters} counters actively serving this queue to prevent long waiting times!
                </span>
              </div>
            )}
          </div>

          {/* Citizen & Service Details with Real QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px]">Citizen Name</span>
                <span className="font-extrabold text-white text-sm">{booking.citizen_name}</span>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px]">Requested Service</span>
                <span className="font-extrabold text-amber-400">{booking.service_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-bold uppercase block text-[10px]">Visit Slot</span>
                  <span className="font-bold text-slate-300 font-mono">{booking.visit_time}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase block text-[10px]">Fee Paid</span>
                  <span className="font-bold text-emerald-400 font-mono">₹{booking.amount_paid}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px]">Aadhaar Reference</span>
                <span className="font-bold text-slate-300 font-mono">{booking.aadhaar}</span>
              </div>
            </div>

            {/* Real Scannable QR Code */}
            <div className="flex flex-col items-center justify-center p-2 border-t sm:border-t-0 sm:border-l border-slate-800">
              <RealQRCode
                value={tokenUrl}
                tokenNumber={booking.token_number}
                size={130}
                showActions={false}
              />
            </div>
          </div>

          {/* Call Alert Action if Called */}
          {isCalled && !isCompleted && onAcknowledge && (
            <div className="p-4 bg-amber-950/80 border-2 border-amber-500 rounded-2xl space-y-3 animate-pulse">
              <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Token Called at Counter 0{booking.counter_number || 1}!
              </div>
              <p className="text-xs text-amber-200">
                Please proceed directly to the counter with your verification code: <span className="font-mono font-black text-white">{booking.verification_code}</span>.
              </p>
              {!isAcknowledged ? (
                <button
                  onClick={onAcknowledge}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                >
                  <Navigation className="w-4 h-4" />
                  I Am Heading to Counter Now
                </button>
              ) : (
                <div className="p-2 bg-emerald-950 border border-emerald-700 text-emerald-300 text-center font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Operator Notified (Approaching Counter)
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/token/${booking.token_number}`}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <span>Open Full Pass Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={downloadPDFUrl(booking.token_number)}
              download
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700 active:scale-95 transition-all"
              title="Download PDF Pass"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>PDF</span>
            </a>

            <button
              onClick={() => window.print()}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700 active:scale-95 transition-all"
              title="Print Pass"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
