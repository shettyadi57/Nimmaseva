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
      setErrorMsg(err.response?.data?.detail || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
        <div className="text-center space-y-2">
          <KarnatakaBadge />
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mt-2">
            <Landmark className="w-7 h-7 text-emerald-950" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Staff / Operator Portal</h2>
          <p className="text-xs text-slate-400">Shivamogga GramOne & Seva Sindhu Admin Access</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email or Phone</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-[11px] text-slate-400">
            <span className="font-bold text-amber-400 block mb-0.5">Demo Admin Credentials:</span>
            User: <code className="text-emerald-300 font-mono">admin@nimmaseva.in</code> | Pass: <code className="text-emerald-300 font-mono">Admin@123</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
