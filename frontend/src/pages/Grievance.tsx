import React, { useState } from 'react';
import {
  HelpCircle, Send, ShieldAlert, CheckCircle2, Phone, Mail, Building,
  AlertCircle, RefreshCw, Search, ClipboardCheck, Clock, XCircle
} from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { KarnatakaBadge } from '../components/KarnatakaBadge';
import { submitGrievance, trackGrievance, GrievanceResult } from '../services/api';

const STATUS_STYLE: Record<string, string> = {
  'Submitted':    'bg-amber-500/10 text-amber-300 border-amber-500/30',
  'Under Review': 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  'Resolved':     'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  'Rejected':     'bg-red-500/10 text-red-300 border-red-500/30',
};

export const Grievance: React.FC = () => {
  const { t } = useLang();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    tokenNumber: '',
    centerName: 'GramOne Shivamogga Main',
    category: 'Delayed Counter Service',
    description: '',
  });
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<GrievanceResult | null>(null);

  // Track tab
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');
  const [trackId, setTrackId]     = useState('');
  const [trackResult, setTrackResult] = useState<GrievanceResult | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await submitGrievance({
        citizen_name: formData.name,
        mobile: formData.mobile,
        token_number: formData.tokenNumber || undefined,
        center_name: formData.centerName,
        category: formData.category,
        description: formData.description,
      });
      setResult(res);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);
    try {
      const res = await trackGrievance(trackId.trim().toUpperCase());
      setTrackResult(res);
    } catch (err: any) {
      setTrackError(err.message || 'Ticket not found. Please check the ID.');
    } finally {
      setTrackLoading(false);
    }
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

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 gap-1">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'submit'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Submit Grievance
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'track'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" /> Track Status
          </button>
        </div>

        {/* ── Submit Tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'submit' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            {submitted && result ? (
              <div className="text-center py-8 space-y-5">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-white">Grievance Submitted Successfully!</h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Your complaint has been <strong className="text-white">saved in the Government Database</strong>. Use the ticket ID below to track your grievance status.
                </p>
                <div className="inline-block bg-slate-950 border-2 border-emerald-500/40 px-8 py-4 rounded-2xl">
                  <p className="text-xs text-slate-400 mb-1">Your Grievance Ticket ID</p>
                  <p className="font-mono text-2xl font-black text-emerald-400 tracking-widest">{result.ticket_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs mt-2">
                  <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-left">
                    <p className="text-slate-400">Status</p>
                    <p className="font-bold text-amber-300">{result.status}</p>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-left">
                    <p className="text-slate-400">Category</p>
                    <p className="font-bold text-slate-200">{result.category}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The Nodal Officer at Shivamogga District Administration will review your complaint and respond within <strong className="text-slate-300">48 business hours</strong>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={() => { setSubmitted(false); setResult(null); setFormData({ name: '', mobile: '', tokenNumber: '', centerName: 'GramOne Shivamogga Main', category: 'Delayed Counter Service', description: '' }); }}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                  >
                    Submit Another Grievance
                  </button>
                  <button
                    onClick={() => { setActiveTab('track'); setTrackId(result.ticket_id); }}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" /> Track This Grievance
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  Submit Citizen Grievance Details
                </h2>

                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Number *</label>
                    <input
                      type="tel" required pattern="[0-9]{10}"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Token Number (Optional)</label>
                    <input
                      type="text"
                      value={formData.tokenNumber}
                      onChange={(e) => setFormData({ ...formData, tokenNumber: e.target.value })}
                      placeholder="e.g. SMG-A102"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Grievance Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option>Delayed Counter Service</option>
                      <option>Token System Glitch</option>
                      <option>Staff Misbehavior / Denial</option>
                      <option>Infrastructure / Ramp Accessibility Issue</option>
                      <option>Wrong Priority Allocation</option>
                      <option>Overcharging / Bribe</option>
                      <option>Other Complaints</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Service Center Name *</label>
                  <select
                    value={formData.centerName}
                    onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option>GramOne Shivamogga Main</option>
                    <option>Seva Sindhu District Office</option>
                    <option>GramOne Bhadravathi East</option>
                    <option>GramOne Sagar Town</option>
                    <option>GramOne Shikaripura</option>
                    <option>GramOne Soraba</option>
                    <option>GramOne Hosanagara</option>
                    <option>GramOne Thirthahalli</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Grievance Description *
                    <span className="text-slate-500 font-normal ml-2">(min. 10 characters)</span>
                  </label>
                  <textarea
                    required minLength={10} rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the issue in detail — what happened, when it happened, and how it affected you..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? 'Submitting...' : 'Submit Formal Grievance'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Track Tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'track' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-400" />
              Track Your Grievance Status
            </h2>

            <form onSubmit={handleTrack} className="flex gap-3">
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value.toUpperCase())}
                placeholder="Enter Ticket ID  e.g. GRV-123456"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={trackLoading || !trackId.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 transition-all"
              >
                {trackLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Track
              </button>
            </form>

            {trackError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl flex items-center gap-2 text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>{trackError}</span>
              </div>
            )}

            {trackResult && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white font-mono">{trackResult.ticket_id}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_STYLE[trackResult.status] || STATUS_STYLE.Submitted}`}>
                    {trackResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                    <p className="text-xs text-slate-400 mb-0.5">Citizen</p>
                    <p className="font-semibold text-white">{trackResult.citizen_name}</p>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                    <p className="text-xs text-slate-400 mb-0.5">Category</p>
                    <p className="font-semibold text-white">{trackResult.category}</p>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                    <p className="text-xs text-slate-400 mb-0.5">Service Center</p>
                    <p className="font-semibold text-white">{trackResult.center_name}</p>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                    <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Submitted</p>
                    <p className="font-semibold text-white">{new Date(trackResult.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Description</p>
                  <p className="text-sm text-slate-200">{trackResult.description}</p>
                </div>

                {trackResult.resolution_notes && (
                  <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                    <p className="text-xs text-emerald-400 font-bold mb-1">Resolution Notes from Nodal Officer</p>
                    <p className="text-sm text-emerald-200">{trackResult.resolution_notes}</p>
                    {trackResult.resolved_at && (
                      <p className="text-xs text-slate-400 mt-2">Resolved on: {new Date(trackResult.resolved_at).toLocaleDateString('en-IN')}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
