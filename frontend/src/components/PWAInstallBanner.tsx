import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Zap, Wifi, Bell } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

export const PWAInstallBanner: React.FC = () => {
  const { t } = useLang();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed this session
    if (sessionStorage.getItem('pwa-banner-dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after a short delay so page loads first
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setTimeout(() => setVisible(false), 2500);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
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
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (!visible || dismissed) return null;

  return (
    <>
      {/* Backdrop blur overlay */}
      <div
        className="fixed inset-0 z-[998] bg-black/30 backdrop-blur-sm"
        onClick={handleDismiss}
        style={{
          animation: 'fadeIn 0.3s ease',
        }}
      />

      {/* Install Card */}
      <div
        className="fixed bottom-6 left-1/2 z-[999] w-full max-w-md"
        style={{
          transform: 'translateX(-50%)',
          animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="mx-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/60 shadow-2xl shadow-black/60 overflow-hidden">
          
          {/* Top accent stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500" />

          <div className="p-6">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {installed ? (
              /* Installed success state */
              <div className="flex flex-col items-center py-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4 animate-bounce">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-white font-extrabold text-lg mb-1">App Installed!</h3>
                <p className="text-slate-400 text-sm">Nimma Seva has been added to your home screen.</p>
              </div>
            ) : (
              <>
                {/* Header row */}
                <div className="flex items-center gap-4 mb-5">
                  {/* App icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-0.5 shadow-lg shadow-emerald-900/50">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                        <span className="text-2xl">🏛️</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                      <span className="text-[9px] text-white font-black">✓</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-extrabold text-base leading-tight">
                      Install Nimma Seva
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">ನಿಮ್ಮ ಸೇವಾ · निम्म सेवा</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className="text-amber-400 text-xs">★</span>
                      ))}
                      <span className="text-slate-500 text-[10px] ml-1">Govt Verified</span>
                    </div>
                  </div>
                </div>

                {/* Feature pills */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { icon: Zap, label: 'Fast', sub: 'Lightning speed', color: 'text-amber-400' },
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

                {/* Description */}
                <p className="text-slate-400 text-xs leading-relaxed mb-5">
                  Add <span className="text-emerald-400 font-semibold">Nimma Seva</span> to your home screen for instant access to token booking, live queue tracking, and government schemes — even without internet.
                </p>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-3 rounded-2xl border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={handleInstall}
                    disabled={installing}
                    className="flex-2 flex-[2] flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/50 active:scale-95 transition-all disabled:opacity-70"
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
                        Install App
                      </>
                    )}
                  </button>
                </div>

                {/* Fine print */}
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
          from { opacity: 0; transform: translateX(-50%) translateY(40px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
};
