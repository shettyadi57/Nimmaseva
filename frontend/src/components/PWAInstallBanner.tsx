import React, { useState, useEffect } from 'react';
import { Download, X, Zap, Wifi, Bell, Share } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = () => /android/i.test(navigator.userAgent);

const isAlreadyInstalled = () =>
  (window.navigator as any).standalone === true ||
  window.matchMedia('(display-mode: standalone)').matches;

// Show banner at most once every 3 days (in localStorage)
const DISMISSED_KEY = 'pwa-banner-last-dismissed';
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

const wasDismissedRecently = () => {
  const stored = localStorage.getItem(DISMISSED_KEY);
  if (!stored) return false;
  return Date.now() - Number(stored) < COOLDOWN_MS;
};

const markDismissed = () => localStorage.setItem(DISMISSED_KEY, String(Date.now()));

// ── Component ─────────────────────────────────────────────────────────────────
export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Already running as installed PWA — skip
    if (isAlreadyInstalled()) return;
    // Dismissed within last 3 days — skip
    if (wasDismissedRecently()) return;

    // Detect platform
    if (isIOS()) {
      setPlatform('ios');
      // iOS Safari never fires beforeinstallprompt — always show guide after 2s
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }

    if (isAndroid()) setPlatform('android');

    // Android / Desktop: capture beforeinstallprompt
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner 1.5s after the event fires
      setTimeout(() => setVisible(true), 1500);
    };
    window.addEventListener('beforeinstallprompt', onPrompt as EventListener);

    // Fallback: if beforeinstallprompt never fires (e.g. already installed,
    // HTTP, or browser doesn't support it) still show after 4s
    const fallback = setTimeout(() => setVisible(true), 4000);

    const onTrigger = () => setVisible(true);
    window.addEventListener('trigger-pwa-install', onTrigger);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setTimeout(() => setVisible(false), 2500);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt as EventListener);
      window.removeEventListener('trigger-pwa-install', onTrigger);
      clearTimeout(fallback);
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
    markDismissed();
  };

  if (!visible) return null;

  return (
    <>
      {/* Bottom-sheet on mobile, floating card on desktop */}
      <div
        className="fixed z-[999] bottom-0 inset-x-0 sm:bottom-6 sm:left-1/2 sm:inset-x-auto sm:w-[22rem]"
        style={{
          transform: typeof window !== 'undefined' && window.innerWidth >= 640 ? 'translateX(-50%)' : undefined,
          animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div className="mx-0 sm:mx-0 rounded-t-3xl sm:rounded-3xl bg-slate-900 border-t border-x sm:border border-slate-700/70 shadow-2xl shadow-black/70 overflow-hidden">

          {/* Accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500" />

          {/* Drag handle (mobile only) */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-700" />
          </div>

          <div className="p-5 relative">
            {/* Close */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ── Installed success ── */}
            {installed ? (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="text-4xl mb-3">🎉</span>
                <h3 className="text-white font-extrabold text-lg mb-1">App Installed!</h3>
                <p className="text-slate-400 text-sm">Nimma Seva is now on your home screen.</p>
              </div>

            ) : platform === 'ios' ? (
              /* ── iOS Step-by-step guide ── */
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🏛️</span>
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-sm leading-tight">Add Nimma Seva to Home Screen</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">ನಿಮ್ಮ ಸೇವಾ · निम्म सेवा</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {[
                    { n: '1', icon: Share, text: 'Tap the Share button', hint: 'Bottom bar in Safari' },
                    { n: '2', icon: Download, text: '"Add to Home Screen"', hint: 'Scroll the share sheet' },
                    { n: '3', icon: Bell, text: 'Tap "Add"', hint: 'Done! App appears on home' },
                  ].map(({ n, icon: Icon, text, hint }) => (
                    <div key={n} className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-800/70 border border-slate-700/50">
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">{n}</span>
                      <Icon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="text-white text-xs font-semibold">{text}</div>
                        <div className="text-slate-500 text-[10px]">{hint}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleDismiss}
                  className="w-full py-3 rounded-2xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all"
                >
                  Got it!
                </button>
              </>

            ) : (
              /* ── Android / Desktop install ── */
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                      <span className="text-2xl">🏛️</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <span className="text-[9px] text-white font-black">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-base">Install Nimma Seva</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">ನಿಮ್ಮ ಸೇವಾ · निम्म सेवा</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
                      <span className="text-slate-500 text-[10px] ml-1">Govt Verified</span>
                    </div>
                  </div>
                </div>

                {/* Feature pills */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { icon: Zap,  label: 'Fast',    color: 'text-amber-400' },
                    { icon: Wifi, label: 'Offline', color: 'text-emerald-400' },
                    { icon: Bell, label: 'Alerts',  color: 'text-indigo-400' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-white text-[11px] font-bold">{label}</span>
                    </div>
                  ))}
                </div>

                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Instant token booking, live queue tracking &amp; schemes — even offline.
                </p>

                <div className="flex gap-2.5">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-3 rounded-2xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={deferredPrompt ? handleInstall : handleDismiss}
                    disabled={installing}
                    className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/40 active:scale-95 transition-all disabled:opacity-70"
                  >
                    {installing ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {installing ? 'Installing…' : deferredPrompt ? 'Install App' : 'Add to Home'}
                  </button>
                </div>

                {!deferredPrompt && (
                  <p className="text-center text-slate-600 text-[10px] mt-2.5">
                    Tap your browser menu → "Install app" or "Add to Home Screen"
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(48px); }
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
