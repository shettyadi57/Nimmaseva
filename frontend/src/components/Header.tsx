import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Ticket, Search, LayoutDashboard, ShieldCheck, Download, Menu, X, Landmark, Activity, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../context/ThemeContext';
import { useLang, Language } from '../context/LanguageContext';

const LANG_OPTIONS: { code: Language; label: string; native: string; flag: string }[] = [
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const { adminToken } = useStore();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = () => setLangDropdownOpen(false);
    if (langDropdownOpen) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [langDropdownOpen]);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      alert("App is ready! Tap your browser menu and select 'Add to Home Screen' or 'Install App'.");
    }
  };

  const navLinks = [
    { path: '/', label: t.navHome, icon: Building2 },
    { path: '/book', label: t.navBook, icon: Ticket },
    { path: '/queue', label: t.navQueue, icon: Landmark },
    { path: '/schemes', label: t.navSchemes, icon: Search },
  ];

  const currentLang = LANG_OPTIONS.find(l => l.code === lang)!;

  return (
    <header className="sticky top-0 z-50 glass-header text-slate-100 shadow-2xl">
      {/* Top Metallic Gold/Emerald Accent Line */}
      <div className="bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500 h-[2px] w-full opacity-80" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-0.5 shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Landmark className="w-6 h-6 text-amber-400 group-hover:rotate-6 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans group-hover:text-amber-400 transition-colors">
                  {t.appName}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-inner">
                  Smart PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">{t.appSubtitle}</p>
            </div>
          </Link>

          {/* Desktop Nav Pills */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/40 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons & System Status */}
          <div className="hidden md:flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-medium text-slate-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{t.allSystems}</span>
            </div>

            {/* Language Selector */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setLangDropdownOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-emerald-500/50 text-slate-200 text-xs font-semibold transition-all duration-200 active:scale-95"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">{currentLang.native}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  {LANG_OPTIONS.map(option => (
                    <button
                      key={option.code}
                      onClick={() => { setLang(option.code); setLangDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                        lang === option.code
                          ? 'bg-emerald-600/20 text-emerald-300 border-l-2 border-emerald-500'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{option.flag}</span>
                      <div className="text-left">
                        <div className="leading-tight">{option.native}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{option.label}</div>
                      </div>
                      {lang === option.code && <span className="ml-auto text-emerald-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 active:scale-95
                bg-slate-900/80 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800"
            >
              <span
                className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                style={{ opacity: theme === 'dark' ? 1 : 0, transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
              </span>
              <span
                className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                style={{ opacity: theme === 'light' ? 1 : 0, transform: theme === 'light' ? 'rotate(0deg)' : 'rotate(90deg)' }}
              >
                <Sun className="w-4 h-4 text-amber-500" />
              </span>
            </button>

            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t.installPwa}</span>
            </button>

            {adminToken ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs border border-amber-500/30 shadow-md transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                <span>{t.adminPanel}</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700/80 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t.staffLogin}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Language Select (compact) */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setLangDropdownOpen(prev => !prev)}
                className="flex items-center gap-1 px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold active:scale-95 transition-all"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px]">{currentLang.native.slice(0, 2)}</span>
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50">
                  {LANG_OPTIONS.map(option => (
                    <button
                      key={option.code}
                      onClick={() => { setLang(option.code); setLangDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                        lang === option.code ? 'bg-emerald-600/20 text-emerald-300' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{option.flag}</span>
                      <span>{option.native}</span>
                      {lang === option.code && <span className="ml-auto text-emerald-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 active:scale-95 transition-all"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
            <button
              onClick={handleInstallPWA}
              className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-slate-900 text-sm font-semibold border border-slate-900"
              >
                <Icon className="w-5 h-5 text-amber-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              to={adminToken ? "/admin/dashboard" : "/admin/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{adminToken ? t.adminPanel : t.staffLogin}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
