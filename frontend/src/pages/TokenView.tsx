import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBookingByToken, downloadPDFUrl, acknowledgeReminder, sendCitizenReminderSMS, submitRating } from '../services/api';
import { Booking } from '../types';
import { 
  Ticket, Download, Printer, Share2, Sparkles, Clock, CheckCircle2, Shield, 
  QrCode, ArrowRight, User, BellRing, Navigation, Check, AlertTriangle, Smartphone, Star
} from 'lucide-react';
import { KarnatakaBadge } from '../components/KarnatakaBadge';

export const TokenView: React.FC = () => {
  const { tokenNumber } = useParams<{ tokenNumber: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [ackLoading, setAckLoading] = useState(false);
  const [acknowledgedState, setAcknowledgedState] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (tokenNumber) {
      loadToken(tokenNumber);
      // Check if already rated (localStorage fallback)
      const stored = localStorage.getItem(`nimmaseva_rating_${tokenNumber}`);
      if (stored) setRatingSubmitted(true);
    }
  }, [tokenNumber]);

  // Live Auto-polling every 3 seconds to receive instant Queue Call Reminders
  useEffect(() => {
    if (!tokenNumber) return;
    const interval = setInterval(() => {
      loadToken(tokenNumber, false);
    }, 3000);
    return () => clearInterval(interval);
  }, [tokenNumber]);

  const loadToken = async (tok: string, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await fetchBookingByToken(tok);
      setBooking(data);
      if (data.acknowledged || data.status === 'Approaching Counter') {
        setAcknowledgedState(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!tokenNumber) return;
    setAckLoading(true);
    try {
      const updated = await acknowledgeReminder(tokenNumber);
      if (updated) {
        setBooking(updated);
        setAcknowledgedState(true);
      }

      // Optional Web Audio feedback chime
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance("Reminder collected. Please proceed directly to counter number " + (booking?.counter_number || 1));
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAckLoading(false);
    }
  };

  const handleManualTestReminder = async () => {
    if (!booking) return;
    await sendCitizenReminderSMS(booking.token_number);
    loadToken(booking.token_number, false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 text-slate-100">
        <h2 className="text-2xl font-bold text-white mb-2">Token Pass Not Found</h2>
        <p className="text-slate-400 text-xs mb-6">Please verify your token number or booking history.</p>
        <Link to="/" className="px-6 py-3 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow">
          Return to Citizen Portal
        </Link>
      </div>
    );
  }

  const isCalledOrReminder = booking.reminder_sent || booking.status === 'Called' || booking.status === 'Approaching Counter';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
          <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Return to Home
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualTestReminder}
              className="px-3 py-1.5 bg-amber-950/80 text-amber-400 hover:bg-amber-900 border border-amber-800 font-bold text-[11px] rounded-xl flex items-center gap-1.5"
              title="Test Automated SMS Notification"
            >
              <Smartphone className="w-3.5 h-3.5" /> Test SMS Reminder
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-800 transition-all"
            >
              <Printer className="w-4 h-4 text-amber-400" /> Print
            </button>
            
            <a
              href={downloadPDFUrl(booking.token_number)}
              download
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <Download className="w-4 h-4" /> PDF Pass
            </a>
          </div>
        </div>

        {/* AUTOMATED REMINDER NOTIFICATION BANNER */}
        {isCalledOrReminder && (
          <div className="p-6 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-2 border-amber-500 rounded-3xl space-y-4 shadow-2xl animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg">
                  <BellRing className="w-7 h-7 animate-bounce" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                    AUTOMATED COUNTER REMINDER DISPATCHED
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight mt-1">
                    YOUR TOKEN IS UP NEXT AT COUNTER 0{booking.counter_number || 1}!
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-amber-100 font-medium">
              ⚡ SMS reminder sent to mobile <span className="font-mono font-bold text-white">XXXX-XX{booking.phone.slice(-4)}</span>. Please approach the counter immediately with your verification code: <span className="font-mono font-black text-amber-300">{booking.verification_code}</span>.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-amber-800/80">
              <div className="text-[11px] text-amber-300 font-mono">
                {acknowledgedState ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Reminder Collected - Operator Notified (Approaching Counter)
                  </span>
                ) : (
                  <span>Status: Awaiting Citizen Acknowledgement</span>
                )}
              </div>

              {!acknowledgedState ? (
                <button
                  onClick={handleAcknowledge}
                  disabled={ackLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  {ackLoading ? 'Notifying Operator...' : 'I AM HEADING TO COUNTER NOW'}
                </button>
              ) : (
                <div className="px-4 py-2 bg-emerald-950 border border-emerald-700 text-emerald-300 font-black text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Heading to Counter 0{booking.counter_number || 1}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Boarding Pass Style Digital Ticket Card */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-slate-800 print:shadow-none print:border-none relative">
          
          {/* Top Karnataka Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-8 text-center space-y-3 border-b border-slate-800 relative">
            <KarnatakaBadge />
            <h2 className="text-2xl font-black tracking-tight text-white mt-1">OFFICIAL CITIZEN DIGITAL TOKEN PASS</h2>
            <p className="text-xs text-amber-400 font-bold">{booking.office_name}</p>
          </div>

          {/* Big Allocated Token Display Area */}
          <div className="p-8 text-center border-b border-dashed border-slate-800 bg-slate-950/90 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Allocated Token Number</span>
            <div className="text-6xl sm:text-7xl font-black tracking-tight text-amber-400 font-mono drop-shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              {booking.token_number}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <div className="inline-block px-4 py-1.5 bg-emerald-950 text-emerald-400 rounded-full font-mono text-xs font-bold border border-emerald-800">
                Verification Code: {booking.verification_code}
              </div>

              <div className={`inline-block px-4 py-1.5 rounded-full font-extrabold text-xs ${
                booking.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                booking.status === 'Approaching Counter' ? 'bg-emerald-900 text-emerald-300 border border-emerald-600' :
                booking.status === 'Called' ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse' :
                'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                Current Status: {booking.status}
              </div>
            </div>
          </div>

          {/* Details & Tatkal Prediction Grid */}
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px] mb-0.5">Citizen Name</span>
                <span className="font-extrabold text-white text-base">{booking.citizen_name}</span>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px] mb-0.5">Service Requested</span>
                <span className="font-extrabold text-amber-400 text-base">{booking.service_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 font-bold uppercase block text-[10px] mb-0.5">Visit Date</span>
                  <span className="font-bold text-slate-200">{booking.visit_date}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase block text-[10px] mb-0.5">Time Slot</span>
                  <span className="font-bold text-slate-200">{booking.visit_time}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px] mb-0.5">Priority Category</span>
                <span className="font-bold text-amber-400">{booking.priority_reason || 'General Normal'}</span>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase block text-[10px] mb-0.5">Government Fee</span>
                <span className="font-extrabold text-emerald-400 text-base font-mono">₹ {booking.amount_paid}</span>
              </div>
            </div>

            {/* Tatkal & QR Box */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between items-center text-center space-y-4">
              
              <div className="w-full bg-emerald-950/80 border border-emerald-800 text-white rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> Tatkal AI Prediction
                  </span>
                  <span className="font-mono text-emerald-400 font-black">{booking.tatkal_probability}%</span>
                </div>
                <p className="text-[10px] text-emerald-200 text-left">
                  High probability of completion today based on current workload & active counters.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200">
                <QrCode className="w-28 h-28 text-slate-950" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Present QR code at Shivamogga office counter</span>
            </div>
          </div>

          {/* Post-service star rating widget */}
          {booking.status === 'Completed' && !ratingSubmitted && (
            <div className="mx-6 mb-4 bg-gradient-to-br from-amber-950/40 to-slate-900 rounded-2xl p-5 border border-amber-800/30 space-y-4">
              <p className="text-sm font-extrabold text-white">How was your experience?</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    onMouseEnter={() => setRatingHover(s)}
                    onMouseLeave={() => setRatingHover(0)}
                    onClick={() => setRatingValue(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        s <= (ratingHover || ratingValue)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                {ratingValue > 0 && (
                  <span className="ml-2 text-xs font-bold text-amber-400">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratingValue]}
                  </span>
                )}
              </div>
              <textarea
                rows={2}
                value={ratingComment}
                onChange={e => setRatingComment(e.target.value)}
                placeholder="Any comments? (optional)"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs resize-none focus:border-amber-500 focus:outline-none"
              />
              <button
                onClick={async () => {
                  if (!ratingValue || !tokenNumber) return;
                  setRatingLoading(true);
                  await submitRating(tokenNumber, ratingValue, ratingComment);
                  setRatingSubmitted(true);
                  setRatingLoading(false);
                }}
                disabled={!ratingValue || ratingLoading}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                {ratingLoading ? 'Submitting…' : 'Submit Rating'}
              </button>
            </div>
          )}
          {booking.status === 'Completed' && ratingSubmitted && (
            <div className="mx-6 mb-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" /> Thank you for your feedback!
            </div>
          )}

          {/* Footer instructions */}
          <div className="bg-slate-900 p-5 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Please arrive 10 mins before your scheduled slot ({booking.visit_time})</span>
            </div>
            <Link to={`/queue?office=${booking.office_id}`} className="font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Live Queue Display <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
