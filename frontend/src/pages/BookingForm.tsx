import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOffices, fetchServices, sendOTP, verifyOTP, createBooking } from '../services/api';
import { Office, Service, Booking } from '../types';
import { useStore } from '../store/useStore';
import { useLang } from '../context/LanguageContext';
import { 
  Ticket, CheckCircle2, AlertCircle, ShieldCheck, User, Phone, Calendar, Clock, 
  ArrowRight, ArrowLeft, FileText, Sparkles, AlertTriangle, HeartHandshake, Zap, Shield, Check
} from 'lucide-react';

export const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { selectedOffice, selectedService, setCurrentBooking } = useStore();

  const [step, setStep] = useState<number>(1);
  const [offices, setOffices] = useState<Office[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [mockOtpCode, setMockOtpCode] = useState('');

  // Location Auto-Detect State
  const [district] = useState('Shivamogga');
  const [taluk, setTaluk] = useState('Shivamogga');
  const [village, setVillage] = useState('Shivamogga Urban');

  // Priority & Service state
  const [officeId, setOfficeId] = useState<number>(selectedOffice?.id || 1);
  const [serviceId, setServiceId] = useState<number>(selectedService?.id || 1);
  const [isPriority, setIsPriority] = useState(false);
  const [priorityReason, setPriorityReason] = useState('None');
  const [bookingType, setBookingType] = useState('Online');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadOptions();
  }, []);

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
    if (typeof age === 'number' && age >= 60) {
      setIsPriority(true);
      setPriorityReason('Senior Citizen (60+)');
    }
  }, [age]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!aadhaar || aadhaar.length !== 12) {
      setErrorMsg('Aadhaar Number must be exactly 12 numeric digits');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      const res = await sendOTP(phone, aadhaar);
      setOtpSent(true);
      setMockOtpCode(res.mock_otp || '123456');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await verifyOTP(phone, otp, aadhaar);
      setAadhaarVerified(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaarVerified) {
      setErrorMsg('Please complete Aadhaar OTP verification before submitting');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        citizen_name: fullName,
        phone,
        aadhaar,
        age: Number(age),
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
    { title: 'General Category', reason: 'None', desc: 'Standard walk-in or online queue allocation' },
    { title: 'Senior Citizen (60+)', reason: 'Senior Citizen (60+)', desc: 'Dedicated fast-track priority counter allocation' },
    { title: 'Person with Disability', reason: 'Person with Disability', desc: 'Special assistance and instant queue jump' },
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
            <span className="hidden sm:inline">Service & Office</span>
          </div>
          <div className="w-8 sm:w-16 h-[2px] bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono ${step >= 3 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-800'}`}>3</span>
            <span className="hidden sm:inline">Review & Pass</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-950/80 border border-red-800/80 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-bold">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Citizen Details & Aadhaar Auth */}
        {step === 1 && (
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-extrabold text-white">Step 1: Citizen Profile & Identity</h2>
              <span className="text-xs text-slate-400 font-mono">12-Digit Aadhaar OTP Protected</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">{t.fullName} (as per Aadhaar)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">{t.mobile}</label>
                <input
                  type="text"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 digit mobile number"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 62"
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
            </div>

            {/* Aadhaar Auth Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Aadhaar Identity Authentication</span>
                </div>
                {aadhaarVerified && (
                  <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-xs rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1">12-Digit Aadhaar Number</label>
                  <input
                    type="text"
                    maxLength={12}
                    disabled={aadhaarVerified}
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    placeholder="123456789012"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={otpSent || aadhaarVerified || loading}
                    onClick={handleSendOTP}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow transition-all"
                  >
                    {loading ? 'Sending OTP...' : 'Send Mobile OTP'}
                  </button>
                </div>
              </div>

              {otpSent && !aadhaarVerified && (
                <div className="pt-3 space-y-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-amber-300">
                    <span>Demo Mode OTP code: <b className="font-mono text-white bg-slate-900 px-2 py-0.5 rounded">{mockOtpCode}</b></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-mono focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl"
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!fullName || !phone || !age || !aadhaarVerified) {
                    setErrorMsg('Please complete all citizen details and verify your Aadhaar OTP.');
                    return;
                  }
                  setErrorMsg('');
                  setStep(2);
                }}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all"
              >
                <span>Next: Service & Priority</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Service & Office Selection + Priority Rules */}
        {step === 2 && (
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-extrabold text-white">Step 2: Service, Office & Priority Allocation</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Select Government Service</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category}) — {s.fee === 0 ? 'FREE' : `₹${s.fee}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Select Shivamogga Office Center</label>
                <select
                  value={officeId}
                  onChange={(e) => setOfficeId(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.type}) — {o.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interactive Priority Pass Cards */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                  Select Priority Queue Category
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {priorityOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setPriorityReason(opt.reason);
                        setIsPriority(opt.reason !== 'None');
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        priorityReason === opt.reason
                          ? 'bg-amber-500/10 border-amber-500/80 shadow-lg'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-white">{opt.title}</span>
                        {priorityReason === opt.reason && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-xs text-slate-400">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg"
              >
                <span>Next: Review Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Final Submission */}
        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-extrabold text-white">Step 3: Confirm Token Pass Generation</h2>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-500 uppercase block font-bold">Citizen Name</span> <b className="text-white text-sm">{fullName}</b></div>
                <div><span className="text-slate-500 uppercase block font-bold">Phone Number</span> <b className="text-white text-sm">{phone}</b></div>
                <div><span className="text-slate-500 uppercase block font-bold">Aadhaar</span> <b className="text-emerald-400 font-mono text-sm">XXXX-XXXX-{aadhaar.slice(-4)}</b></div>
                <div><span className="text-slate-500 uppercase block font-bold">Age / Gender</span> <b className="text-white text-sm">{age} Yrs / {gender}</b></div>
                <div><span className="text-slate-500 uppercase block font-bold">Service Requested</span> <b className="text-amber-400 text-sm">{currentService?.name}</b></div>
                <div><span className="text-slate-500 uppercase block font-bold">Center Office</span> <b className="text-white text-sm">{currentOffice?.name}</b></div>
                <div><span className="text-slate-500 uppercase block font-bold">Priority Status</span> <b className="text-amber-400 text-sm">{priorityReason}</b></div>
                <div><span className="text-slate-500 uppercase block font-bold">Govt Fee</span> <b className="text-emerald-400 text-base font-mono">₹ {currentService?.fee}</b></div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Ticket className="w-5 h-5 text-slate-950" />
                <span>{loading ? 'Generating Token...' : 'Confirm & Generate Digital Token'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
