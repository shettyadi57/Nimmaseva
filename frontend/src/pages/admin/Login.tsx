import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/api';
import { useStore } from '../../store/useStore';
import { ShieldCheck, Lock, Mail, AlertCircle, Landmark } from 'lucide-react';
import { KarnatakaBadge } from '../../components/KarnatakaBadge';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setAdminAuth } = useStore();

  const [emailOrPhone, setEmailOrPhone] = useState('admin@nimmaseva.in');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await adminLogin(emailOrPhone, password);
      setAdminAuth(res.access_token, { name: res.user_name, role: res.role });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid staff credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <KarnatakaBadge />
          
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
            <Landmark className="w-7 h-7" />
          </div>
          
          <h2 className="text-3xl font-black text-white tracking-tight">Staff Operator Portal</h2>
          <p className="text-xs text-slate-400">Shivamogga GramOne & Seva Sindhu Control Center Access</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-950/80 border border-red-800/80 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Staff Email / Phone</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                placeholder="admin@nimmaseva.in"
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Demo Creds:</span>
            <span className="text-amber-400 font-bold">admin@nimmaseva.in / Admin@123</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-500/20 active:scale-95 mt-2"
          >
            {loading ? 'Authenticating Access...' : 'Sign In to Operator Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
