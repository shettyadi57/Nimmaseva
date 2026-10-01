import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { fetchBookingByToken, fetchBookingsByPhone, updateBookingStatus, controlQueueAction } from '../services/api';
import { Booking } from '../types';
import { CouponModal } from './CouponModal';
import { 
  Camera, Upload, Search, X, QrCode, AlertCircle, Sparkles, 
  CheckCircle2, RefreshCw, Zap, Check, ArrowRight, User, Phone, 
  ShieldCheck, Layers, RotateCcw, FastForward, Navigation, FileText 
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingFound?: (booking: Booking) => void;
  onScanSuccess?: (tokenNumber: string) => void;
  mode?: 'citizen' | 'admin';
  officeId?: number;
  currentCounterNumber?: number;
  onActionExecuted?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onBookingFound,
  onScanSuccess,
  mode = 'citizen',
  officeId = 1,
  currentCounterNumber = 1,
  onActionExecuted,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'lookup'>('camera');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lookupInput, setLookupInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Scanned / Loaded booking
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Admin action execution state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [reassignCounterNum, setReassignCounterNum] = useState<number>(currentCounterNumber);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Play audio confirmation chime
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // AudioContext not permitted or supported
    }
  };

  useEffect(() => {
    setReassignCounterNum(currentCounterNumber);
  }, [currentCounterNumber]);

  // Start camera when tab is camera and modal is open
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !scannedBooking) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, scannedBooking]);

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        animFrameId.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings or use Image Upload / Token Lookup below.'
          : 'Unable to access device camera. Please upload a QR image or enter token number.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
  };

  // Continuous frame-by-frame scanner
  const scanVideoFrame = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animFrameId.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const video = videoRef.current;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        playScanBeep();
        handleExtractedData(code.data);
        return;
      }
    }

    animFrameId.current = requestAnimationFrame(scanVideoFrame);
  };

  // Extract token number from scanned URL or raw text
  const parseTokenFromText = (raw: string): string => {
    const trimmed = raw.trim();

    const urlMatch = trimmed.match(/\/token\/([A-Za-z0-9\-]+)/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }

    const pipeMatch = trimmed.match(/TOKEN:([A-Za-z0-9\-]+)/i);
    if (pipeMatch && pipeMatch[1]) {
      return pipeMatch[1];
    }

    return trimmed;
  };

  const handleExtractedData = async (rawCode: string) => {
    stopCamera();
    const token = parseTokenFromText(rawCode);
    await processTokenLookup(token);
  };

  const processTokenLookup = async (tokenOrPhone: string) => {
    if (!tokenOrPhone.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setActionSuccessMsg(null);

    try {
      const clean = tokenOrPhone.trim();

      // If it looks like a 10-digit phone number
      if (/^\d{10}$/.test(clean)) {
        const bookings = await fetchBookingsByPhone(clean);
        if (bookings && bookings.length > 0) {
          const latest = bookings[0];
          setScannedBooking(latest);
          if (mode === 'citizen') {
            setShowCouponModal(true);
          }
          onBookingFound && onBookingFound(latest);
          onScanSuccess && onScanSuccess(latest.token_number);
          return;
        } else {
          setErrorMsg(`No active token pass found for mobile number ${clean}.`);
          return;
        }
      }

      // Otherwise look up by token number
      const booking = await fetchBookingByToken(clean);
      if (booking) {
        setScannedBooking(booking);
        if (mode === 'citizen') {
          setShowCouponModal(true);
        }
        onBookingFound && onBookingFound(booking);
        onScanSuccess && onScanSuccess(booking.token_number);
      } else {
        setErrorMsg(`Coupon / Token '${clean}' not found. Please verify the token number.`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Could not find coupon for '${tokenOrPhone}'. Please verify and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            playScanBeep();
            handleExtractedData(code.data);
          } else {
            setErrorMsg('No valid QR code detected in the uploaded image. Please ensure the QR code is clear.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processTokenLookup(lookupInput);
  };

  // ── ADMIN OPERATOR ACTIONS ON SCANNED CITIZEN TOKEN ──
  const handleAdminExecuteAction = async (action: 'call' | 'in_progress' | 'complete' | 'skip' | 'reassign') => {
    if (!scannedBooking) return;
    setActionLoading(true);
    setActionSuccessMsg(null);
    setErrorMsg(null);

    const targetOffId = scannedBooking.office_id || officeId || 1;

    try {
      if (action === 'call') {
        // Call token directly to current counter
        await controlQueueAction(targetOffId, {
          action: 'call_next',
          counter_number: currentCounterNumber,
          target_token: scannedBooking.token_number
        });
        await updateBookingStatus(scannedBooking.id, 'Called', currentCounterNumber);
        
        setScannedBooking({
          ...scannedBooking,
          status: 'Called',
          counter_number: currentCounterNumber
        });
        setActionSuccessMsg(`Token ${scannedBooking.token_number} called to Counter 0${currentCounterNumber}! Citizen notified.`);
      } else if (action === 'in_progress') {
        await updateBookingStatus(scannedBooking.id, 'In Progress', currentCounterNumber);
        setScannedBooking({
          ...scannedBooking,
          status: 'In Progress',
          counter_number: currentCounterNumber
        });
        setActionSuccessMsg(`Token ${scannedBooking.token_number} marked In Progress at Counter 0${currentCounterNumber}.`);
      } else if (action === 'complete') {
        await controlQueueAction(targetOffId, {
          action: 'complete',
          counter_number: currentCounterNumber,
          target_token: scannedBooking.token_number
        });
        await updateBookingStatus(scannedBooking.id, 'Completed', currentCounterNumber);
        setScannedBooking({
          ...scannedBooking,
          status: 'Completed',
          counter_number: currentCounterNumber
        });
        setActionSuccessMsg(`Token ${scannedBooking.token_number} successfully marked as Completed & Served!`);
      } else if (action === 'skip') {
        await controlQueueAction(targetOffId, {
          action: 'skip',
          counter_number: currentCounterNumber,
          target_token: scannedBooking.token_number
        });
        await updateBookingStatus(scannedBooking.id, 'Skipped', currentCounterNumber);
        setScannedBooking({
          ...scannedBooking,
          status: 'Skipped'
        });
        setActionSuccessMsg(`Token ${scannedBooking.token_number} has been skipped.`);
      } else if (action === 'reassign') {
        await updateBookingStatus(scannedBooking.id, scannedBooking.status || 'Pending', reassignCounterNum);
        setScannedBooking({
          ...scannedBooking,
          counter_number: reassignCounterNum
        });
        setActionSuccessMsg(`Token ${scannedBooking.token_number} reassigned to Counter 0${reassignCounterNum}.`);
      }

      window.dispatchEvent(new CustomEvent('nimmaseva:queue_updated', { detail: { officeId: targetOffId } }));
      onActionExecuted && onActionExecuted();
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Failed to execute counter operation. Please retry.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetScanner = () => {
    setScannedBooking(null);
    setActionSuccessMsg(null);
    setErrorMsg(null);
    setLookupInput('');
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
        <div 
          className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-400/50 rounded-3xl shadow-2xl overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  {mode === 'admin' ? 'COUNTER SCANNER & ADMISSION CONTROL' : 'UNIVERSAL QR / COUPON SCANNER'}
                </h3>
                <p className="text-xs text-slate-400">
                  {mode === 'admin' 
                    ? `Desk Counter 0${currentCounterNumber} • Scan citizen QR pass to instantly admit, call, or serve` 
                    : 'Scan any pass QR code to directly view the live digital coupon'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs (only shown if not actively displaying a scanned booking in admin mode) */}
          {(!scannedBooking || mode !== 'admin') && (
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'camera'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Camera Scan</span>
              </button>

              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'upload'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>

              <button
                onClick={() => setActiveTab('lookup')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'lookup'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Quick Lookup</span>
              </button>
            </div>
          )}

          {/* Tab Content / Admin Scanned Ticket Command Center */}
          <div className="p-6 space-y-4">
            
            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3.5 bg-red-950/80 border border-red-800 rounded-2xl flex items-center gap-2.5 text-red-200 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Notification */}
            {actionSuccessMsg && (
              <div className="p-3.5 bg-emerald-950/90 border border-emerald-700 rounded-2xl flex items-center gap-2.5 text-emerald-200 text-xs shadow-lg animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-bold">{actionSuccessMsg}</span>
              </div>
            )}

            {/* ── ADMIN SCANNED TICKET COMMAND CENTER ── */}
            {mode === 'admin' && scannedBooking ? (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Scanned Citizen Ticket Header Box */}
                <div className="bg-slate-950 rounded-2xl p-5 border-2 border-amber-500/40 relative overflow-hidden space-y-3 shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                        SCANNED CITIZEN TOKEN
                      </span>
                      <div className="text-4xl sm:text-5xl font-mono font-black text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.35)]">
                        {scannedBooking.token_number}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="px-3 py-1 bg-emerald-950 text-emerald-300 rounded-full font-mono text-xs font-bold border border-emerald-800 inline-block">
                        Code: {scannedBooking.verification_code}
                      </span>
                      <div className="text-xs font-mono font-bold text-slate-300">
                        Counter: <span className="text-amber-400">0{scannedBooking.counter_number || currentCounterNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Citizen Metadata Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-900 text-xs">
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Citizen</span>
                      <span className="font-extrabold text-white truncate block">{scannedBooking.citizen_name}</span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone</span>
                      <span className="font-mono text-slate-300 block">{scannedBooking.phone}</span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Service</span>
                      <span className="font-bold text-amber-400 truncate block">{scannedBooking.service_name}</span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
                      <span className={`font-black uppercase text-xs block ${
                        scannedBooking.status === 'Completed' ? 'text-emerald-400' :
                        scannedBooking.status === 'Called' ? 'text-amber-400 animate-pulse' :
                        scannedBooking.status === 'In Progress' ? 'text-blue-400' :
                        'text-slate-300'
                      }`}>
                        {scannedBooking.status}
                      </span>
                    </div>
                  </div>

                  {scannedBooking.is_priority && (
                    <div className="p-2 bg-amber-950/60 rounded-xl border border-amber-800/80 text-[11px] text-amber-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>
                        <strong>Priority Citizen Pass:</strong> {scannedBooking.priority_reason || 'Senior Citizen (60+)'} — Zero-step queue fast-track.
                      </span>
                    </div>
                  )}
                </div>

                {/* Operator Actions Command Grid */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                    Execute Desk Actions for Counter 0{currentCounterNumber}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Primary Button: Admit & Call to Current Counter */}
                    <button
                      onClick={() => handleAdminExecuteAction('call')}
                      disabled={actionLoading}
                      className="py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <FastForward className="w-4 h-4 text-slate-950" />
                      <span>Admit & Call to Counter 0{currentCounterNumber}</span>
                    </button>

                    {/* Secondary Button: Mark Serving / In Progress */}
                    <button
                      onClick={() => handleAdminExecuteAction('in_progress')}
                      disabled={actionLoading}
                      className="py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 text-white" />
                      <span>Mark In Progress / Serving</span>
                    </button>

                    {/* Tertiary Button: Mark Served / Completed */}
                    <button
                      onClick={() => handleAdminExecuteAction('complete')}
                      disabled={actionLoading}
                      className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Mark Completed & Served</span>
                    </button>

                    {/* Skip Citizen Button */}
                    <button
                      onClick={() => handleAdminExecuteAction('skip')}
                      disabled={actionLoading}
                      className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-400" />
                      <span>Skip Token</span>
                    </button>
                  </div>

                  {/* Reassign Counter Row */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Reallocate Desk:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={reassignCounterNum}
                        onChange={(e) => setReassignCounterNum(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none"
                      >
                        <option value={1}>Counter 01 (Revenue & Identity)</option>
                        <option value={2}>Counter 02 (Certificates)</option>
                        <option value={3}>Counter 03 (Utility Services)</option>
                        <option value={4}>Counter 04 (⚡ Dynamic Overflow)</option>
                        <option value={5}>Counter 05 (Priority Express)</option>
                      </select>

                      <button
                        onClick={() => handleAdminExecuteAction('reassign')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-lg border border-slate-700 transition-all disabled:opacity-50"
                      >
                        Reassign
                      </button>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                    <button
                      onClick={() => setShowCouponModal(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Official Digital Pass</span>
                    </button>

                    <button
                      onClick={handleResetScanner}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scan Another Citizen</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <>
                {/* TAB 1: LIVE CAMERA SCANNER */}
                {activeTab === 'camera' && (
                  <div className="space-y-4 text-center">
                    {cameraError ? (
                      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                        <p className="text-xs text-slate-300">{cameraError}</p>
                        <button
                          onClick={startCamera}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Retry Camera
                        </button>
                      </div>
                    ) : (
                      <div className="relative aspect-square max-w-sm mx-auto bg-black rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner">
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />

                        {/* Futuristic HUD Viewfinder Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div className="w-56 h-56 border-2 border-amber-400/70 rounded-2xl relative">
                            {/* Corner Accents */}
                            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                            {/* Animated Laser Scanning Beam */}
                            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-scanBeam" />
                          </div>
                        </div>

                        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                          <span className="px-3 py-1 bg-slate-950/80 backdrop-blur-sm text-[11px] font-bold text-amber-300 rounded-full border border-amber-500/30">
                            Align QR code inside square
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400">
                      Point your device camera at the printed token slip or phone screen.
                    </p>
                  </div>
                )}

                {/* TAB 2: UPLOAD IMAGE */}
                {activeTab === 'upload' && (
                  <div className="space-y-4">
                    <label className="flex flex-col items-center justify-center p-8 bg-slate-950 hover:bg-slate-950/70 border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-2xl cursor-pointer transition-all group">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 group-hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 transition-colors">
                        <Upload className="w-7 h-7" />
                      </div>
                      <span className="font-extrabold text-sm text-white mb-1">
                        Upload QR Pass Image or Screenshot
                      </span>
                      <span className="text-xs text-slate-400">
                        Supports PNG, JPG, WEBP (Instant auto-detection)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* TAB 3: QUICK TOKEN LOOKUP */}
                {activeTab === 'lookup' && (
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Enter Token Number or Registered Mobile
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. GO-104 or 9876543210"
                          value={lookupInput}
                          onChange={(e) => setLookupInput(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !lookupInput.trim()}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Searching Token...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Find Citizen Pass</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* POP-UP CITIZEN COUPON PASS MODAL */}
      <CouponModal
        booking={scannedBooking}
        isOpen={showCouponModal}
        onClose={() => {
          setShowCouponModal(false);
          if (mode === 'citizen') {
            setScannedBooking(null);
            onClose();
          }
        }}
      />
    </>
  );
};
