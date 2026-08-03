import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBookingByToken, downloadPDFUrl } from '../services/api';
import { Booking } from '../types';
import { Ticket, Download, Printer, Share2, Sparkles, Clock, CheckCircle2, Shield, QrCode, ArrowRight, User } from 'lucide-react';
import { KarnatakaBadge } from '../components/KarnatakaBadge';

export const TokenView: React.FC = () => {
  const { tokenNumber } = useParams<{ tokenNumber: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tokenNumber) {
      loadToken(tokenNumber);
    }
  }, [tokenNumber]);

  const loadToken = async (tok: string) => {
    try {
      const data = await fetchBookingByToken(tok);
      setBooking(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
          <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Return to Home
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-800 transition-all"
            >
              <Printer className="w-4 h-4 text-amber-400" /> Print Pass
            </button>
            
            <a
              href={downloadPDFUrl(booking.token_number)}
              download
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <Download className="w-4 h-4" /> Download Official PDF
            </a>
          </div>
        </div>

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
            <div className="inline-block px-4 py-1.5 bg-emerald-950 text-emerald-400 rounded-full font-mono text-xs font-bold border border-emerald-800">
              Verification Code: {booking.verification_code}
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
