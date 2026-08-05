import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, adminRegister, getStoredAdmins, RegisteredAdmin } from '../../services/api';
import { useStore } from '../../store/useStore';
import { ShieldCheck, Lock, Mail, AlertCircle, Landmark, UserPlus, LogIn, BadgeCheck, Building2, CheckCircle2, ChevronDown, ChevronUp, User } from 'lucide-react';
import { KarnatakaBadge } from '../../components/KarnatakaBadge';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setAdminAuth } = useStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [emailOrPhone, setEmailOrPhone] = useState('admin@nimmaseva.in');
  const [password, setPassword] = useState('Admin@123');

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regEmailOrPhone, setRegEmailOrPhone] = useState('');
  const [regEmpId, setRegEmpId] = useState('');
  const [regDepartment, setRegDepartment] = useState('Revenue & E-Governance');
  const [regOfficeId, setRegOfficeId] = useState(1);
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Senior Revenue Officer');
  const [authCode, setAuthCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCredsList, setShowCredsList] = useState(false);
  const [storedAdmins, setStoredAdmins] = useState<RegisteredAdmin[]>([]);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = () => {
    const list = getStoredAdmins();
    setStoredAdmins(list);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await adminLogin(emailOrPhone, password);
      setAdminAuth(res.access_token, { 
        name: res.user_name || 'District Official', 
        role: res.role || 'Government Staff Operator' 
      });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid staff credentials or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        full_name: regFullName,
        email_or_phone: regEmailOrPhone,
        password: regPassword,
        employee_id: regEmpId || `KA-GOV-${Math.floor(1000 + Math.random() * 9000)}`,
        department: regDepartment,
        office_id: Number(regOfficeId),
        role: regRole
      };

      const res = await adminRegister(payload);
      setSuccessMsg(`Official Admin Registered Successfully! Staff ID: ${payload.employee_id}`);
      
      // Auto-fill login credentials
      setEmailOrPhone(regEmailOrPhone);
      setPassword(regPassword);
      loadAdmins();
      
      setTimeout(() => {
        setActiveTab('login');
      }, 1800);

    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to register new official account');
    } finally {
      setLoading(false);
    }
  };

  const useQuickCreds = (email: string, pass: string = 'Admin@123') => {
    setEmailOrPhone(email);
    setPassword(pass);
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-lg w-full mx-auto space-y-6 relative z-10">
        
        {/* Header Header */}
        <div className="text-center space-y-3">
          <KarnatakaBadge />
          
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20 text-slate-950">
            <Landmark className="w-8 h-8" />
          </div>
          
          <h2 className="text-3xl font-black text-white tracking-tight">Government Staff Control Portal</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Shivamogga District E-Governance, GramOne & Seva Sindhu Control Center
          </p>
        </div>

        {/* Form Container Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" /> Sign In to Operator Panel
            </button>

            <button
              onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Register New Official
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-4 bg-red-950/80 border border-red-800/80 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-bold animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN TAB */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Official Staff Email / Phone / Employee ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                    placeholder="admin@nimmaseva.in or KA-GOV-2026-001"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-500/20 active:scale-95 mt-2"
              >
                {loading ? 'Authenticating Access...' : 'Sign In to Operator Panel'}
              </button>
            </form>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Official Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                      placeholder="K. Vijaykumar"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Government Employee ID</label>
                  <div className="relative">
                    <BadgeCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={regEmpId}
                      onChange={(e) => setRegEmpId(e.target.value)}
                      placeholder="KA-GOV-2026-8941"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Official Email / Phone</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={regEmailOrPhone}
                    onChange={(e) => setRegEmailOrPhone(e.target.value)}
                    required
                    placeholder="vijay.gov@karnataka.gov.in"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Department</label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold focus:outline-none"
                  >
                    <option value="Revenue & E-Governance">Revenue & E-Governance</option>
                    <option value="Food & Civil Supplies">Food & Civil Supplies</option>
                    <option value="Social Welfare & Pensions">Social Welfare & Pensions</option>
                    <option value="Transport & RTO">Transport & RTO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Designated Office</label>
                  <select
                    value={regOfficeId}
                    onChange={(e) => setRegOfficeId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold focus:outline-none"
                  >
                    <option value={1}>GramOne Center - Shivamogga Main</option>
                    <option value={2}>Seva Sindhu District Office</option>
                    <option value={3}>GramOne Center - Bhadravathi East</option>
                    <option value={4}>GramOne Center - Sagar Town</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Staff Authorization Code</label>
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="GOVT2026 (Optional)"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 mt-2"
              >
                {loading ? 'Registering Account...' : 'Complete Official Registration'}
              </button>
            </form>
          )}

          {/* Quick Active Credentials Drawer */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowCredsList(!showCredsList)}
              className="w-full flex items-center justify-between text-xs font-bold text-amber-400 bg-amber-950/30 p-3 rounded-xl border border-amber-800/50 hover:bg-amber-950/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Available System & Registered Admin Credentials ({storedAdmins.length})</span>
              </div>
              {showCredsList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCredsList && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                {storedAdmins.map((adm, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-bold text-slate-100">{adm.name}</div>
                      <div className="text-[10px] text-slate-400">{adm.email} | ID: {adm.employee_id}</div>
                    </div>
                    <button
                      onClick={() => useQuickCreds(adm.email, adm.password || 'Admin@123')}
                      className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-[10px] hover:bg-amber-400 transition-all"
                    >
                      Use Creds
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
