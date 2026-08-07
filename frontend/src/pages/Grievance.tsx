import React, { useState } from 'react';
import { HelpCircle, Send, ShieldAlert, CheckCircle2, Phone, Mail, Building } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { KarnatakaBadge } from '../components/KarnatakaBadge';

export const Grievance: React.FC = () => {
  const { t } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    tokenNumber: '',
    centerName: 'GramOne Shivamogga Main',
    category: 'Delayed Counter Service',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generated = 'GRV-' + Math.floor(100000 + Math.random() * 900000);
    setTicketId(generated);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <KarnatakaBadge />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 mt-4">
            <HelpCircle className="w-8 h-8 text-amber-500" />
            {t.navGrievance}
          </h1>
          <p className="text-slate-400 text-sm">
            Public Grievance Redressal Mechanism • Shivamogga District Administration, Government of Karnataka
          </p>
        </div>

        {/* Escalation Information Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Toll Free Helpline</div>
              <div className="text-sm font-bold text-white">08182-271234</div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Grievance Cell Email</div>
              <div className="text-sm font-bold text-white">grievance@shivamogga.gov.in</div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <Building className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Escalation Authority</div>
              <div className="text-sm font-bold text-white">DC Office Shivamogga</div>
            </div>
          </div>
        </div>

        {/* Form or Success State */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white">Grievance Submitted Successfully!</h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Your grievance reference ticket number is:
              </p>
              <div className="inline-block bg-slate-950 border border-emerald-500/40 px-6 py-3 rounded-2xl font-mono text-xl font-bold text-emerald-400">
                {ticketId}
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                An SMS confirmation has been dispatched to {formData.mobile}. The Nodal Officer at Shivamogga District Administration will review and respond within 48 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                Submit Another Grievance
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                Submit Citizen Grievance Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.fullName} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.mobile} *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Token Pass Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.tokenNumber}
                    onChange={(e) => setFormData({ ...formData, tokenNumber: e.target.value })}
                    placeholder="e.g. SMG-A102"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Grievance Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>Delayed Counter Service</option>
                    <option>Token System Glitch</option>
                    <option>Staff Misbehavior / Denial</option>
                    <option>Infrastructure / Ramp Accessibility Issue</option>
                    <option>Other Complaints</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Grievance Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide clear details of the issue faced at the service center..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                Submit Formal Grievance
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
