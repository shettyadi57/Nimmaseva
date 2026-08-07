import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchOffices, fetchServices, createBooking } from '../services/api';
import { sendFirebaseOTP, verifyFirebaseOTP, clearRecaptcha } from '../lib/firebase';
import { Office, Service, Booking } from '../types';
import { useStore } from '../store/useStore';
import { useLang } from '../context/LanguageContext';
import { 
  Ticket, CheckCircle2, AlertCircle, ShieldCheck, User, Phone, Calendar, Clock, 
  ArrowRight, ArrowLeft, FileText, Sparkles, AlertTriangle, HeartHandshake, Zap, Shield, Check, Smartphone, AlertOctagon
} from 'lucide-react';
import { ServerDownModal } from '../components/ServerDownModal';

export const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { selectedOffice, selectedService, setCurrentBooking, citizenProfile } = useStore();

  const [step, setStep] = useState<number>(1);
  const [offices, setOffices] = useState<Office[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // Form State (Auto-filled if citizen logged in)
  const [fullName, setFullName] = useState(citizenProfile?.fullName || '');
  const [age, setAge] = useState<number | ''>(citizenProfile?.age ?? '');
  const [gender, setGender] = useState(citizenProfile?.gender || 'Male');
  const [phone, setPhone] = useState(citizenProfile?.phone || '');
  const [aadhaar, setAadhaar] = useState(citizenProfile?.aadhaar || ''); 
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(!!citizenProfile);

  // Priority & Service state
  const [officeId, setOfficeId] = useState<number>(selectedOffice?.id || 1);
  const [serviceId, setServiceId] = useState<number>(selectedService?.id || 1);
  const [isPriority, setIsPriority] = useState(false);
  const [priorityReason, setPriorityReason] = useState('None');
  const [bookingType, setBookingType] = useState('Online');

  // Server Outage Modal state
  const [serverDownModalOpen, setServerDownModalOpen] = useState(false);
  const [outageService, setOutageService] = useState<Service | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (citizenProfile) {
      if (citizenProfile.fullName) setFullName(citizenProfile.fullName);
      if (citizenProfile.phone) setPhone(citizenProfile.phone);
      if (citizenProfile.aadhaar) setAadhaar(citizenProfile.aadhaar);
      if (citizenProfile.age) setAge(citizenProfile.age);
      if (citizenProfile.gender) setGender(citizenProfile.gender);
      setPhoneVerified(true);
    }
  }, [citizenProfile]);


  const loadOptions = async () => {
    try {
      const [offData, srvData] = await Promise.all([fetchOffices(), fetchServices()]);
      setOffices(offData);
      setServices(srvData);
      if (selectedOffice) setOfficeId(selectedOffice.id);
      if (selectedService) setServiceId(selectedService.id);
    } catch (e) {
      console.error(e);
    }
  };

  const currentService = services.find((s) => s.id === Number(serviceId));
  const currentOffice = offices.find((o) => o.id === Number(officeId));

  useEffect(() => {
    if (services.length > 0) {
      const current = services.find((s) => s.id === Number(serviceId));
      if (current && (current.server_status === 'Down' || current.server_status === 'Maintenance' || !current.is_active)) {
        setOutageService(current);
        setServerDownModalOpen(true);
      }
    }
  }, [services, serviceId]);

  const handleServiceSelectChange = (newId: number) => {
    setServiceId(newId);
    const target = services.find((s) => s.id === newId);
    if (target && (target.server_status === 'Down' || target.server_status === 'Maintenance' || !target.is_active)) {
      setOutageService(target);
      setServerDownModalOpen(true);
    }
  };

  const selectFirstActiveService = () => {
    const active = services.find((s) => s.server_status === 'Active' && s.is_active);
    if (active) {
      setServiceId(active.id);
    }
  };

  useEffect(() => {
    if (typeof age === 'number' && age >= 60) {
      setIsPriority(true);
      setPriorityReason('Senior Citizen (60+)');
    }
  }, [age]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      await sendFirebaseOTP(phone);
      setOtpSent(true);
    } catch (err: any) {
      const msg = err?.code === 'auth/invalid-phone-number'
        ? 'Invalid phone number. Please check and try again.'
        : err?.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please wait a few minutes.'
        : 'Failed to send OTP. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryOTP = () => {
    clearRecaptcha();
    setOtpSent(false);
    setOtp('');
    setErrorMsg('');
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setErrorMsg('Please enter the 6-digit code sent to your mobile');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await verifyFirebaseOTP(otp);
      setPhoneVerified(true);
    } catch (err: any) {
      const msg = err?.code === 'auth/invalid-verification-code'
        ? 'Incorrect OTP. Please check the SMS and try again.'
        : err?.code === 'auth/code-expired'
        ? 'OTP expired. Please request a new one.'
        : 'Verification failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneVerified) {
      setErrorMsg('Please verify your mobile number with Phone OTP before submitting');
      return;
    }

    if (currentService && (currentService.server_status === 'Down' || currentService.server_status === 'Maintenance' || !currentService.is_active)) {
      setOutageService(currentService);
      setServerDownModalOpen(true);
      setErrorMsg(`Service '${currentService.name}' server is currently ${currentService.server_status.toUpperCase()}. Online booking is temporarily suspended.`);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        citizen_name: fullName || 'Citizen',
        phone,
        aadhaar: aadhaar || 'NOT_PROVIDED',
        age: Number(age) || 30,
        gender,
        is_priority: isPriority || Number(age) >= 60,
        priority_reason: priorityReason !== 'None' ? priorityReason : (Number(age) >= 60 ? 'Senior Citizen (60+)' : null),
        booking_type: bookingType,
        office_id: Number(officeId),
        service_id: Number(serviceId)
      };

      const result: Booking = await createBooking(payload);
      setCurrentBooking(result);
      navigate(`/token/${result.token_number}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { title: 'Senior Citizen (60+)', reason: 'Senior Citizen (60+)', desc: 'Automatic priority pass for citizens aged 60+' },
    { title: 'Person with Disability (PwD)', reason: 'Person with Disability (PwD)', desc: 'Dedicated accessible counter allocation' },
    { title: 'Pregnant Women', reason: 'Pregnant Women', desc: 'Direct priority slot assignment' },
    { title: 'Emergency Case', reason: 'Emergency Case', desc: 'Immediate medical/legal urgent token' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center sm:text-left">
            <span className="text-amber-400 font-extrabold text-xs tracking-widest uppercase block">
              Shivamogga Digital Pass Allocation
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white">{t.bookTitle}</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Instant digital slot reservation for GramOne and Seva Sindhu offices</p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-xl flex-shrink-0">
            <Ticket className="w-7 h-7" />
          </div>
        </div>

        {/* Multi-step Progress Bar */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between text-xs font-bold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono ${step >= 1 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-800'}`}>1</span>
            <span className="hidden sm:inline">Citizen Info</span>
          </div>
          <div className="w-8 sm:w-16 h-[2px] bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono ${step >= 2 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-800'}`}>2</span>
            <span className="hidden sm:inline">Service &amp; Office</span>
          </div>
          <div className="w-8 sm:w-16 h-[2px] bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono ${step >= 3 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-800'}`}>3</span>
            <span className="hidden sm:inline">Review &amp; Pass</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-950/80 border border-red-800/80 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-bold">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Citizen Details & Firebase Mobile Phone Auth */}
        {step === 1 && (
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-extrabold text-white">Step 1: Citizen Profile &amp; Mobile Verification</h2>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Firebase Phone SMS Auth
              </span>
            </div>

            {/* Express Auto-Fill Banner */}
            {citizenProfile ? (
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-300">
                      Express Auto-Fill Active! Logged in as {citizenProfile.fullName}
                    </div>
                    <div className="text-xs text-slate-400">
                      Your phone (+91 {citizenProfile.phone}) & profile details have been automatically filled to save your time.
                    </div>
                  </div>
                </div>
                <Link to="/login" className="text-xs text-amber-400 font-semibold hover:underline flex-shrink-0 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                  Edit Profile
                </Link>
              </div>
            ) : (
              <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-amber-400">Save time next time!</span> Log in or set up your citizen profile once to auto-fill details on every ticket booking.
                  </div>
                </div>
                <Link to="/login" className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow transition-all flex-shrink-0">
                  Citizen Login
                </Link>
              </div>
            )}


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">{t.fullName}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 35"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Aadhaar / Ration Card No. <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  placeholder="Optional 12-digit number"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Phone Verification Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <span>Mobile Phone Number Verification</span>
                </div>
                {phoneVerified && (
                  <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-xs rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Phone Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1">10-Digit Mobile Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">+91</span>
                    <input
                      type="text"
                      maxLength={10}
                      disabled={phoneVerified}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={otpSent || phoneVerified || loading || phone.length < 10}
                    onClick={handleSendOTP}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{loading ? 'Sending SMS...' : 'Send Phone OTP'}</span>
                  </button>
                </div>
              </div>

              {/* Firebase reCAPTCHA container — required for signInWithPhoneNumber */}
              <div id="firebase-recaptcha-container" />

              {otpSent && !phoneVerified && (
                <div className="pt-3 space-y-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      OTP sent to <span className="text-amber-300 font-bold">+91 {phone.slice(0, 3)}*****{phone.slice(-2)}</span>. Check your SMS.
                    </span>
                    <button
                      type="button"
                      onClick={handleRetryOTP}
                      className="text-slate-400 hover:text-white text-[11px] font-semibold underline underline-offset-2"
                    >
                      Resend OTP
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit SMS OTP"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-mono tracking-[0.3em] focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length < 6}
                      className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!fullName.trim()) {
                    setErrorMsg('Please enter your Full Name');
                    return;
                  }
                  if (!phoneVerified) {
                    setErrorMsg('Please complete Mobile Phone OTP verification');
                    return;
                  }
                  setErrorMsg('');
                  setStep(2);
                }}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                <span>Next: Choose Service &amp; Office</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Service & Office Selection + Priority Pass */}
        {step === 2 && (
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-extrabold text-white">Step 2: Service &amp; Office Center</h2>
              <span className="text-xs text-amber-400 font-mono">Tatkal Wait Time Prediction Active</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Select Service Required</label>
                <select
                  value={serviceId}
                  onChange={(e) => handleServiceSelectChange(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-semibold focus:border-amber-500 focus:outline-none"
                >
                  {services.map((s) => {
                    const isDown = s.server_status === 'Down' || !s.is_active;
                    const isMaint = s.server_status === 'Maintenance';
                    const tag = isDown ? ' [🔴 SERVER DOWN]' : isMaint ? ' [🟡 MAINTENANCE]' : '';
                    return (
                      <option key={s.id} value={s.id}>
                        {tag} {s.name} ({s.category}) - ₹{s.fee}
                      </option>
                    );
                  })}
                </select>
                {currentService && (
                  <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                    <p>{currentService.description}</p>
                    <div className="flex items-center gap-4 text-emerald-400 font-mono font-bold pt-1">
                      <span>Est. Duration: {currentService.avg_processing_time_mins} Mins</span>
                      <span>Daily Cap: {currentService.daily_capacity} Tokens</span>
                    </div>

                    {(currentService.server_status === 'Down' || currentService.server_status === 'Maintenance' || !currentService.is_active) && (
                      <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-2 font-bold">
                          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                          <span>Server status: {currentService.server_status.toUpperCase()}. Online booking paused.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOutageService(currentService);
                            setServerDownModalOpen(true);
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] rounded-lg shrink-0 shadow"
                        >
                          View Outage Notice
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Select GramOne / Seva Sindhu Office Center</label>
                <select
                  value={officeId}
                  onChange={(e) => setOfficeId(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-semibold focus:border-amber-500 focus:outline-none"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.type}) - {o.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Pass Allocation Box */}
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Priority Pass Allocation</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPriority}
                      onChange={(e) => setIsPriority(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs font-bold text-slate-200">Request Priority Token</span>
                  </label>
                </div>

                {isPriority && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {priorityOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPriorityReason(opt.reason)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          priorityReason === opt.reason
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                <span>Next: Review &amp; Confirm Token</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Final Confirmation */}
        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-extrabold text-white">Step 3: Review &amp; Issue Token Pass</h2>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ready for Allocation
              </span>
            </div>

            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Citizen Name</span>
                  <span className="text-white font-extrabold text-sm">{fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Verified Phone</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">+91 {phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Age / Gender</span>
                  <span className="text-slate-200 font-bold">{age} Yrs ({gender})</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">ID Reference</span>
                  <span className="text-slate-200 font-mono">{aadhaar || 'Mobile Verified'}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Selected Office</span>
                  <span className="text-amber-400 font-extrabold text-sm">{currentOffice?.name}</span>
                  <p className="text-slate-400 text-[11px]">{currentOffice?.address}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">Selected Service</span>
                  <span className="text-emerald-400 font-extrabold text-sm">{currentService?.name}</span>
                  <p className="text-slate-400 text-[11px]">Fee: ₹{currentService?.fee} | Est: {currentService?.avg_processing_time_mins} mins</p>
                </div>
              </div>

              {isPriority && (
                <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-xl text-xs text-amber-300 font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Priority Token Pass Assigned: {priorityReason}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2.5 px-9 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-950/50 active:scale-95 transition-all disabled:opacity-50"
              >
                <Ticket className="w-5 h-5 text-white" />
                <span>{loading ? 'Generating Token Pass...' : 'Issue Digital Token Pass'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <ServerDownModal
        service={outageService}
        isOpen={serverDownModalOpen}
        onClose={() => setServerDownModalOpen(false)}
        onSelectAlternative={() => selectFirstActiveService()}
      />
    </div>
  );
};
