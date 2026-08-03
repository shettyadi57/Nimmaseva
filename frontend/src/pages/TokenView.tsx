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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Token Not Found</h2>
        <p className="text-slate-500 text-xs mb-4">Please check your token number and try again.</p>
        <Link to="/" className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <Link to="/" className="text-xs font-bold text-slate-600 hover:text-emerald-700">
            ← Back to Home
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            
            <a
              href={downloadPDFUrl(booking.token_number)}
              download
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" /> Download PDF Pass
            </a>
          </div>
        </div>

        {/* Digital Token Pass Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 print:shadow-none print:border-none">
          {/* Header Strip */}
          <div className="karnataka-gradient p-6 text-white text-center space-y-2 relative">
            <KarnatakaBadge />
            <h2 className="text-xl font-extrabold tracking-tight mt-1">OFFICIAL TOKEN PASS</h2>
            <p className="text-xs text-emerald-100 font-medium">{booking.office_name}</p>
          </div>

          {/* Token Big Number Area */}
          <div className="p-6 text-center border-b border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Allocated Token Number</span>
            <div className="text-4xl sm:text-6xl font-black tracking-tight text-emerald-800 font-mono">
              {booking.token_number}
            </div>
            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-mono text-xs font-bold">
              Verification Code: {booking.verification_code}
            </div>
          </div>

          {/* Details & Tatkal Prediction Grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Citizen Name</span>
                <span className="font-bold text-slate-900 text-sm">{booking.citizen_name}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Service Requested</span>
                <span className="font-bold text-emerald-800 text-sm">{booking.service_name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-semibold block">Visit Date</span>
                  <span className="font-bold text-slate-800">{booking.visit_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Time Slot</span>
                  <span className="font-bold text-slate-800">{booking.visit_time}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Priority Category</span>
                <span className="font-bold text-amber-700">{booking.priority_reason || 'General Normal'}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Fee Amount</span>
                <span className="font-bold text-slate-900">₹ {booking.amount_paid}</span>
              </div>
            </div>

            {/* QR & Tatkal Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between items-center text-center space-y-4">
              
              {/* Tatkal Probability Indicator */}
              <div className="w-full bg-emerald-950 text-white rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Tatkal AI Prediction
                  </span>
                  <span className="font-mono text-emerald-300 font-bold">{booking.tatkal_probability}%</span>
                </div>
                <p className="text-[10px] text-emerald-200 text-left">
                  High probability of completion today based on current workload & active counters.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-inner">
                <QrCode className="w-24 h-24 text-emerald-950" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Scan at office entry counter</span>
            </div>
          </div>

          {/* Footer instructions */}
          <div className="bg-slate-100 p-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Arrival Time: Please arrive 10 mins before {booking.visit_time}</span>
            </div>
            <Link to={`/queue?office=${booking.office_id}`} className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              Track Queue <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
