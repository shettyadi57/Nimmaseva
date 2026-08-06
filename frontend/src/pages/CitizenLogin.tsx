import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useLang } from '../context/LanguageContext';
import { sendOTP, verifyOTP } from '../services/api';
import { 
  User, Phone, ShieldCheck, Ticket, CheckCircle2, ArrowRight, 
  Sparkles, MapPin, Hash, LogOut, Edit3, UserCheck, AlertCircle, KeyRound, Clock
} from 'lucide-react';
import { CitizenProfile } from '../types';

export const CitizenLogin: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { citizenProfile, setCitizenProfile, logoutCitizen } = useStore();

  // Form State
  const [phone, setPhone] = useState(citizenProfile?.phone || '');
  const [fullName, setFullName] = useState(citizenProfile?.fullName || '');
  const [age, setAge] = useState<number | ''>(citizenProfile?.age ?? '');
  const [gender, setGender] = useState(citizenProfile?.gender || 'Male');
  const [aadhaar, setAadhaar] = useState(citizenProfile?.aadhaar || '');
  const [district, setDistrict] = useState(citizenProfile?.district || 'Shivamogga');
  const [taluk, setTaluk] = useState(citizenProfile?.taluk || 'Shivamogga');
  const [villageOrAddress, setVillageOrAddress] = useState(citizenProfile?.villageOrAddress || '');

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(citizenProfile?.isVerified || false);
  const [mockOtpCode, setMockOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditing, setIsEditing] = useState(!citizenProfile);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await sendOTP(phone);
      setOtpSent(true);
      setMockOtpCode(res.mock_otp || '123456');
      setSuccessMsg(`OTP sent successfully! Use code ${res.mock_otp || '123456'} for quick verification.`);
    } catch (err: any) {
      // Fallback for demo if backend is offline
      setOtpSent(true);
      setMockOtpCode('123456');
      setSuccessMsg('Demo Mode: OTP sent! Use code 123456 to verify.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setErrorMsg('Please enter the OTP sent to your phone');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      await verifyOTP(phone, otp, aadhaar || 'OPTIONAL');
      setPhoneVerified(true);
      setSuccessMsg('Phone number verified successfully!');
    } catch (err: any) {
      if (otp === '123456' || otp === mockOtpCode) {
        setPhoneVerified(true);
        setSuccessMsg('Phone number verified successfully!');
      } else {
        setErrorMsg('Invalid OTP code. Please check and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number');
      return;
    }

    const profileData: CitizenProfile = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      aadhaar: aadhaar.trim() || 'NOT_PROVIDED',
      age: Number(age) || 30,
      gender,
      district,
      taluk,
      villageOrAddress: villageOrAddress.trim(),
      isVerified: phoneVerified,
      createdAt: new Date().toISOString()
    };

    setCitizenProfile(profileData);
    setSuccessMsg('Login profile saved successfully! Your details will auto-fill on booking.');
    setIsEditing(false);
    
    // Auto navigate to ticket booking after brief pause
    setTimeout(() => {
      navigate('/book');
    }, 1200);
  };

  const handleQuickDemoLogin = () => {
    const demoProfile: CitizenProfile = {
      fullName: 'Ramesh Kumar',
      phone: '9876543210',
      aadhaar: '4589 1234 9876',
      age: 62,
      gender: 'Male',
      district: 'Shivamogga',
      taluk: 'Shivamogga',
      villageOrAddress: 'Vinoba Nagar, 1st Cross, Shivamogga',
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    setCitizenProfile(demoProfile);
    setPhoneVerified(true);
    setIsEditing(false);
    setSuccessMsg('Demo Citizen Logged In! Redirecting to Ticket Booking...');
    setTimeout(() => {
      navigate('/book');
    }, 1000);
  };

  const talukOptions = ['Shivamogga', 'Bhadravathi', 'Sagara', 'Shikaripura', 'Soraba', 'Hosanagara', 'Thirthahalli'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full space-y-6">

        {/* Top Header Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Citizen Express Login</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Citizen Login & Auto-Fill Profile
            </h1>
            <p className="text-sm text-slate-400">
              Save your basic info once. Skip typing during ticket booking!
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-500 p-0.5 shadow-lg flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <UserCheck className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl flex items-center gap-3 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* If Citizen is Logged In & Not Editing */}
        {citizenProfile && !isEditing ? (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xl font-bold">
                  {citizenProfile.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {citizenProfile.fullName}
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                      Logged In
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    +91 {citizenProfile.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition-all"
              >
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Profile Grid Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Age & Gender</span>
                <span className="text-sm font-semibold text-slate-200">{citizenProfile.age} yrs • {citizenProfile.gender}</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Aadhaar Reference</span>
                <span className="text-sm font-semibold text-slate-200">{citizenProfile.aadhaar || 'Not provided'}</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">District & Taluk</span>
                <span className="text-sm font-semibold text-slate-200">{citizenProfile.district}, {citizenProfile.taluk}</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Express Auto-Fill Status</span>
                <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Ready for 1-Click Booking
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                to="/book"
                className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all active:scale-98"
              >
                <Ticket className="w-4 h-4 text-amber-300" />
                <span>Go to Ticket Booking (Auto-Filled)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <button
                onClick={logoutCitizen}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-red-400 font-semibold text-xs border border-red-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form for Login / Profile Creation */
          <form onSubmit={handleSaveProfile} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">

            {/* Quick Demo Fill button */}
            <div className="flex items-center justify-between bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/20">
              <div className="text-xs text-emerald-300">
                <span className="font-bold">Testing/Demo?</span> Click to auto-fill sample citizen credentials.
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Demo Login</span>
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Basic Citizen Information</span>
              </h2>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* OTP Verification Section (Optional fast verify) */}
              {!phoneVerified ? (
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4" /> Verify Mobile Number (OTP)
                    </span>
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading || phone.length < 10}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold disabled:opacity-50 transition-all"
                      >
                        {loading ? 'Sending...' : 'Send OTP'}
                      </button>
                    ) : null}
                  </div>

                  {otpSent && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter OTP (123456)"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={loading || otp.length < 4}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
                      >
                        Verify Code
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mobile number verified via OTP pass!</span>
                </div>
              )}

              {/* Age, Gender, Aadhaar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    placeholder="e.g. 35"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  {typeof age === 'number' && age >= 60 && (
                    <span className="text-[10px] text-amber-400 font-semibold block mt-1">
                      ★ Eligible for Senior Priority Pass
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Aadhaar / Govt ID (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    placeholder="xxxx xxxx xxxx"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* District, Taluk, Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Taluk
                  </label>
                  <select
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    {talukOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Village / Street Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ward 12, Main Road, Bhadravathi"
                  value={villageOrAddress}
                  onChange={(e) => setVillageOrAddress(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all active:scale-98"
              >
                <UserCheck className="w-4 h-4 text-amber-300" />
                <span>Save Profile & Proceed to Ticket Booking</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {citizenProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
