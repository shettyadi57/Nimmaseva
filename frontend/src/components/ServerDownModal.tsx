import React, { useState } from 'react';
import { AlertOctagon, X, Bell, PhoneCall, ShieldAlert, CheckCircle2, ArrowRight, Server, Zap, ShieldCheck } from 'lucide-react';
import { Service } from '../types';
import { useLang } from '../context/LanguageContext';

interface ServerStatusModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAlternative?: () => void;
  onProceedBooking?: () => void;
}

export const ServerDownModal: React.FC<ServerStatusModalProps> = ({
  service,
  isOpen,
  onClose,
  onSelectAlternative,
  onProceedBooking,
}) => {
  const { t } = useLang();
  const [notifyMobile, setNotifyMobile] = useState('');
  const [alertSaved, setAlertSaved] = useState(false);

  if (!isOpen || !service) return null;

  const isActive = service.server_status === 'Active' && service.is_active;
  const isMaintenance = service.server_status === 'Maintenance';

  const statusBadgeColor = isActive
    ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/40'
    : isMaintenance
    ? 'bg-amber-950/90 text-amber-400 border-amber-500/40'
    : 'bg-red-950/90 text-red-400 border-red-500/40';

  const accentGradient = isActive
    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500'
    : isMaintenance
    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
    : 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600';

  const handleSubscribeAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyMobile.length >= 10) {
      setAlertSaved(true);
      setTimeout(() => {
        setAlertSaved(false);
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Accent Top Bar */}
        <div className={`h-2 w-full ${accentGradient}`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Close Status Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header & Icon */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-950/50'
                : isMaintenance
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {isActive ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
              ) : (
                <AlertOctagon className="w-8 h-8 animate-pulse" />
              )}
            </div>

            <div className="space-y-1">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-black tracking-wider uppercase ${statusBadgeColor}`}>
                <Server className="w-3 h-3" />
                <span>
                  {isActive
                    ? '🟢 SERVER ONLINE & ACTIVE'
                    : isMaintenance
                    ? t.serviceStatusMaintenance
                    : t.serviceStatusDown}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {isActive
                  ? t.serverActiveTitle
                  : isMaintenance
                  ? t.serviceMaintenanceTitle
                  : t.serverDownTitle}
              </h2>
            </div>
          </div>

          {/* Service Details Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 uppercase font-mono font-bold">Selected Service</span>
              <span className="font-mono font-black text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{service.code}</span>
            </div>
            <div className="text-base font-extrabold text-white">{service.name}</div>
            <div className="text-xs text-emerald-400 font-semibold">{service.category} • Fee: ₹{service.fee}</div>
          </div>

          {/* Detailed Message Body */}
          <div className="text-xs text-slate-300 leading-relaxed space-y-2">
            <p>
              {isActive ? t.serverActiveNoticeMsg : t.serverDownNoticeMsg}
            </p>
            
            {isActive ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2 font-semibold">
                <Zap className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>Admin Status Control: Server verified active by Shivamogga District IT Team.</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>Shivamogga District Administration is actively monitoring the state server status.</span>
              </div>
            )}
          </div>

          {/* SMS Notification Registration (Only for Down or Maintenance) */}
          {!isActive && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>{t.notifyMeWhenBackOnline}</span>
              </div>

              {alertSaved ? (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t.alertRegisteredMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribeAlert} className="flex gap-2">
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={notifyMobile}
                    onChange={(e) => setNotifyMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all"
                  >
                    Register SMS Alert
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {isActive ? (
              <button
                onClick={() => {
                  onClose();
                  if (onProceedBooking) onProceedBooking();
                }}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.bookServiceNowLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  if (onSelectAlternative) onSelectAlternative();
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>{t.chooseAlternativeService}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <a
              href="tel:08182271234"
              className="py-3 px-4 rounded-2xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Helpline 08182-271234</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
