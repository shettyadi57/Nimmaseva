import React, { useState, useEffect } from 'react';
import { Download, X, Zap, Wifi, Bell, Share } from 'lucide-react';

// Detect iOS Safari
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;

const isInStandaloneMode = () =>
  (window.navigator as any).standalone === true ||
  window.matchMedia('(display-mode: standalone)').matches;

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isInStandaloneMode()) return;
    // Don't show if dismissed this session
    if (sessionStorage.getItem('pwa-banner-dismissed')) return;

    const ios = isIOS();
    setIsIos(ios);

    if (ios) {
      // iOS: always show the install guide after 3s
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }

    // Android/Desktop: wait for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setTimeout(() => setVisible(false), 2500);
    });

    // Fallback: show after 5s even without event (some browsers suppress it)
    const fallbackTimer = setTimeout(() => {
      setVisible(true);
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstalling(false);
    if (outcome === 'accepted') {
      setInstalled(true);
      setTimeout(() => setVisible(false), 2500);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm"
        onClick={handleDismiss}
        style={{ animation: 'fadeIn 0.3s ease' }}
      />

      {/* Card */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[999] sm:bottom-6 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-sm"
        style={{
          transform: window.innerWidth >= 640 ? 'translateX(-50%)' : undefined,
          animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="mx-0 sm:mx-4 rounded-t-3xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-t border-x sm:border border-slate-700/60 shadow-2xl shadow-black/60 overflow-hidden">

          {/* Accent stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500" />

          {/* Drag handle (mobile) */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-700" />
          </div>

          <div className="p-5 sm:p-6 relative">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {installed ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-white font-extrabold text-lg mb-1">App Installed!</h3>
                <p className="text-slate-400 text-sm">Nimma Seva added to your home screen.</p>
              </div>
            ) : isIos ? (
              /* iOS Install Guide */
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-0.5 shadow-lg flex-shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[12px] flex items-center justify-center">
                      <span className="text-2xl">🏛️</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-base">Add to Home Screen</h3>
                    <p className="text-slate-400 text-xs mt-0.5">ನಿಮ್ಮ ಸೇವಾ · निम्म सेवा</p>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  {[
                    { step: '1', icon: Share, text: 'Tap the Share button', sub: 'Bottom toolbar in Safari' },
                    { step: '2', icon: Download, text: 'Tap "Add to Home Screen"', sub: 'Scroll down in the share sheet' },
                    { step: '3', icon: Bell, text: 'Tap "Add"', sub: 'App appears on your home screen' },
                  ].map(({ step, icon: Icon, text, sub }) => (
                    <div key={step} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                        {step}
                      </div>
                      <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="text-white text-xs font-semibold">{text}</div>
                        <div className="text-slate-500 text-[10px]">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleDismiss}
                  className="w-full py-3 rounded-2xl border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all"
                >
                  Got it, thanks!
                </button>
              </>
            ) : (
              /* Android / Desktop */
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-0.5 shadow-lg">
                      <div className="w-full h-full bg-slate-950 rounded-[12px] flex items-center justify-center">
                        <span className="text-2xl">🏛️</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                      <span className="text-[9px] text-white font-black">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-base">Install Nimma Seva</h3>
                    <p className="text-slate-400 text-xs mt-0.5">ನಿಮ್ಮ ಸೇವಾ · निम्म सेवा</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
                      <span className="text-slate-500 text-[10px] ml-1">Govt Verified</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { icon: Zap, label: 'Fast', sub: 'Lightning', color: 'text-amber-400' },
                    { icon: Wifi, label: 'Offline', sub: 'Works offline', color: 'text-emerald-400' },
                    { icon: Bell, label: 'Alerts', sub: 'Token updates', color: 'text-indigo-400' },
                  ].map(({ icon: Icon, label, sub, color }) => (
                    <div key={label} className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span className="text-white text-[11px] font-bold">{label}</span>
                      <span className="text-slate-500 text-[9px] text-center leading-tight">{sub}</span>
                    </div>
                  ))}
                </div>

                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Add <span className="text-emerald-400 font-semibold">Nimma Seva</span> to your home screen for instant access — even without internet.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-3 rounded-2xl border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={deferredPrompt ? handleInstall : handleDismiss}
                    disabled={installing}
                    className="flex-[2] flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/50 active:scale-95 transition-all disabled:opacity-70"
                  >
                    {installing ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                        </svg>
                        Installing…
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        {deferredPrompt ? 'Install App' : 'Add to Home'}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-slate-600 text-[10px] mt-3">
                  Free · No sign-up required · Karnataka Govt Portal
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
};
