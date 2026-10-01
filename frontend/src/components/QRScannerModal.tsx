import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { fetchBookingByToken, fetchBookingsByPhone } from '../services/api';
import { Booking } from '../types';
import { CouponModal } from './CouponModal';
import { 
  Camera, Upload, Search, X, QrCode, AlertCircle, Sparkles, 
  CheckCircle2, RefreshCw, Zap 
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingFound?: (booking: Booking) => void;
  onScanSuccess?: (tokenNumber: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onBookingFound,
  onScanSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'lookup'>('camera');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lookupInput, setLookupInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Scanned / Loaded booking to pop up in CouponModal
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

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
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pleasant A5
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

  // Start camera when tab is camera and modal is open
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

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
        return; // Stop scanning once found
      }
    }

    animFrameId.current = requestAnimationFrame(scanVideoFrame);
  };

  // Extract token number from scanned URL or raw text
  const parseTokenFromText = (raw: string): string => {
    const trimmed = raw.trim();

    // Check if it's a URL: e.g. http://localhost:5173/token/GO-104 or https://.../token/SS-203
    const urlMatch = trimmed.match(/\/token\/([A-Za-z0-9\-]+)/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }

    // Check if it's format TOKEN:GO-104|...
    const pipeMatch = trimmed.match(/TOKEN:([A-Za-z0-9\-]+)/i);
    if (pipeMatch && pipeMatch[1]) {
      return pipeMatch[1];
    }

    // Otherwise treat entire text as token or code
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

    try {
      const clean = tokenOrPhone.trim();

      // If it looks like a 10-digit phone number
      if (/^\d{10}$/.test(clean)) {
        const bookings = await fetchBookingsByPhone(clean);
        if (bookings && bookings.length > 0) {
          const latest = bookings[0];
          setScannedBooking(latest);
          setShowCouponModal(true);
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
        setShowCouponModal(true);
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
        <div 
          className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-400/50 rounded-3xl shadow-2xl overflow-hidden my-8"
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
                  UNIVERSAL QR / COUPON SCANNER
                </h3>
                <p className="text-xs text-slate-400">
                  Scan any pass QR code to directly view the live digital coupon
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

          {/* Mode Switcher Tabs */}
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

          {/* Tab Content */}
          <div className="p-6 space-y-4">
            
            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3.5 bg-red-950/80 border border-red-800 rounded-2xl flex items-center gap-2.5 text-red-200 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

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
                      <span>Searching Coupon...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Find & Pop Up Coupon</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>

      {/* POP-UP COUPON MODAL ONCE DETECTED */}
      <CouponModal
        booking={scannedBooking}
        isOpen={showCouponModal}
        onClose={() => {
          setShowCouponModal(false);
          setScannedBooking(null);
          onClose();
        }}
      />
    </>
  );
};
