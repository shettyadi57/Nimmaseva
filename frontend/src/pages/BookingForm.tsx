import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOffices, fetchServices, sendOTP, verifyOTP, createBooking } from '../services/api';
import { Office, Service, Booking } from '../types';
import { useStore } from '../store/useStore';
import { Ticket, CheckCircle2, AlertCircle, ShieldCheck, User, Phone, Calendar, Clock, ArrowRight, ArrowLeft, FileText, Sparkles, AlertTriangle } from 'lucide-react';

export const BookingForm: React.FC = () => {
  const navigate = useNavigate();
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

  // Auto-detect Senior Citizen Priority when age >= 60
  useEffect(() => {
    if (typeof age === 'number' && age >= 60) {
      setIsPriority(true);
      setPriorityReason('Senior Citizen (60+)');
    }
  }, [age]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number');
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

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800 flex items-center justify-between">
          <div>
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">Karnataka Smart Seva</span>
            <h1 className="text-2xl font-bold">Book Government Service Token</h1>
            <p className="text-emerald-200 text-xs mt-1">GramOne & Seva Sindhu Centers • Shivamogga District</p>
          </div>
          <Ticket className="w-10 h-10 text-amber-400 opacity-80 hidden sm:block" />
        </div>

        {/* Multi-step Navigation Progress */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between text-xs font-bold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>1</span>
            <span>Citizen & Aadhaar</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>2</span>
            <span>Service & Office</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-emerald-700 text-white' : 'bg-slate-200'}`}>3</span>
            <span>Review & Confirm</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Citizen Details & Aadhaar Auth */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Step 1: Citizen & Verification Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (as per Aadhaar)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 digit mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 62"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Fake Aadhaar Verification Box */}
            <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-sm text-slate-900">Fake Aadhaar Demo Authentication</span>
                </div>
                {aadhaarVerified && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aadhaar Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Aadhaar Number (12 digits)</label>
                  <input
                    type="text"
                    maxLength={12}
                    disabled={aadhaarVerified}
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    placeholder="e.g. 123456789012"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={otpSent || aadhaarVerified || loading}
                    onClick={handleSendOTP}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && !aadhaarVerified && (
                <div className="pt-2 space-y-2 border-t border-amber-200">
                  <div className="flex items-center justify-between text-xs text-amber-800">
                    <span>Mock OTP sent to {phone}</span>
                    <span className="font-mono bg-amber-200 px-2 py-0.5 rounded font-bold">Demo OTP: {mockOtpCode}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      className="py-2 px-5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl"
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Location Auto Detect */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">District</span>
                <span className="font-bold text-slate-800">{district}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Taluk</span>
                <select value={taluk} onChange={(e) => setTaluk(e.target.value)} className="font-bold text-slate-800 bg-transparent">
                  <option value="Shivamogga">Shivamogga</option>
                  <option value="Bhadravathi">Bhadravathi</option>
                  <option value="Sagar">Sagar</option>
                  <option value="Shikaripura">Shikaripura</option>
                  <option value="Thirthahalli">Thirthahalli</option>
                </select>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Village / Ward</span>
                <span className="font-bold text-slate-800">{village}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!fullName || !phone || !age || !aadhaarVerified) {
                    setErrorMsg('Please fill all citizen details and verify Aadhaar');
                    return;
                  }
                  setErrorMsg('');
                  setStep(2);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl"
              >
                <span>Next: Choose Service</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Service & Office Selection + Priority Rules */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Step 2: Service, Office & Priority Status</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Government Service</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category}) — {s.fee === 0 ? 'FREE' : `₹${s.fee}`} [{s.server_status}]
                    </option>
                  ))}
                </select>
              </div>

              {currentService && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900">Service Fee: ₹{currentService.fee}</span>
                    <span className="text-emerald-700">Avg Time: {currentService.avg_processing_time_mins} mins</span>
                  </div>
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-1">Required Documents Checklist:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      {currentService.required_documents.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Center Office</label>
                <select
                  value={officeId}
                  onChange={(e) => setOfficeId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.type}) — {o.address} [{o.server_status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Category Section */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" /> Special Priority Queue Category
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Category</label>
                    <select
                      value={priorityReason}
                      onChange={(e) => {
                        setPriorityReason(e.target.value);
                        setIsPriority(e.target.value !== 'None');
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    >
                      <option value="None">None (General Category)</option>
                      <option value="Senior Citizen (60+)">Senior Citizen (60+)</option>
                      <option value="Person with Disability">Person with Disability (PwD)</option>
                      <option value="Pregnant Women">Pregnant Women</option>
                      <option value="Emergency Case">Emergency Medical / Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Booking Type</label>
                    <select
                      value={bookingType}
                      onChange={(e) => setBookingType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    >
                      <option value="Online">Online Token Booking</option>
                      <option value="Offline">Walk-in Counter Token</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
              >
                <span>Next: Review & Confirm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Final Submission */}
        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Step 3: Review & Generate Token Pass</h2>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-400">Citizen Name:</span> <b className="text-slate-800">{fullName}</b></div>
                <div><span className="text-slate-400">Phone:</span> <b className="text-slate-800">{phone}</b></div>
                <div><span className="text-slate-400">Aadhaar:</span> <b className="text-slate-800 font-mono">XXXX-XXXX-{aadhaar.slice(-4)}</b></div>
                <div><span className="text-slate-400">Age / Gender:</span> <b className="text-slate-800">{age} Yrs / {gender}</b></div>
                <div><span className="text-slate-400">Service:</span> <b className="text-emerald-700">{currentService?.name}</b></div>
                <div><span className="text-slate-400">Office:</span> <b className="text-slate-800">{currentOffice?.name}</b></div>
                <div><span className="text-slate-400">Priority:</span> <b className="text-amber-700">{priorityReason}</b></div>
                <div><span className="text-slate-400">Amount Due:</span> <b className="text-slate-900">₹ {currentService?.fee}</b></div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-sm rounded-xl shadow-md transition-transform active:scale-95"
              >
                <Ticket className="w-5 h-5" />
                <span>{loading ? 'Allocating Slot...' : 'Confirm & Generate Token'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
