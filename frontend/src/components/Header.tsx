import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2, Ticket, Search, LayoutDashboard, ShieldCheck, FileText,
  Menu, X, Landmark, Activity, Sun, Moon, Globe, ChevronDown, ChevronRight, User, History
} from 'lucide-react';
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
  const { adminToken, citizenProfile } = useStore();

  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);

  // Close desktop lang dropdown on outside click
  useEffect(() => {
    const handler = () => setLangDropdownOpen(false);
    if (langDropdownOpen) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [langDropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const navLinks = [
    { path: '/', label: t.navHome, icon: Building2 },
    { path: '/services', label: t.navServices || 'Services & Docs', icon: FileText },
    { path: '/book', label: t.navBook, icon: Ticket },
    { path: '/queue', label: t.navQueue, icon: Landmark },
    { path: '/schemes', label: t.navSchemes, icon: Search },
    ...(citizenProfile ? [{ path: '/my-bookings', label: 'My Bookings', icon: History }] : []),
  ];

  const currentLang = LANG_OPTIONS.find(l => l.code === lang)!;

  return (
    <header className="sticky top-0 z-50 glass-header text-slate-100 shadow-2xl">
      {/* Top accent line */}
      <div className="bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500 h-[2px] w-full opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-0.5 shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Landmark className="w-5 h-5 md:w-6 md:h-6 text-amber-400 group-hover:rotate-6 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg md:text-xl tracking-tight text-white font-sans group-hover:text-amber-400 transition-colors">
                  {t.appName}
                </span>
                <span className="hidden sm:inline bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-inner">
                  Smart PWA
                </span>
              </div>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-medium tracking-wide leading-tight">{t.appSubtitle}</p>
            </div>
          </Link>

          {/* ===== DESKTOP Nav Pills ===== */}
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

          {/* ===== DESKTOP Action Buttons ===== */}
          <div className="hidden md:flex items-center gap-3">

            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-medium text-slate-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{t.allSystems}</span>
            </div>

            {/* Desktop Language Selector */}
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

            {/* Desktop Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 active:scale-95 bg-slate-900/80 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800"
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

            {/* Citizen Profile / Login button */}
            <Link
              to="/login"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                citizenProfile
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
              }`}
            >
              <User className={`w-4 h-4 ${citizenProfile ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{citizenProfile ? citizenProfile.fullName.split(' ')[0] : (t.navLogin || 'Login')}</span>
            </Link>

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

          {/* ===== MOBILE: Only hamburger button ===== */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-2xl bg-slate-900/80 text-slate-200 border border-slate-700 active:scale-95 transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ===== MOBILE DRAWER (full-featured) ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 backdrop-blur-xl">
          {/* Nav Links */}
          <div className="px-4 pt-4 pb-2 space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-900 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-300' : 'text-amber-400'}`} />
                  <span>{link.label}</span>
                  {!isActive && <ChevronRight className="w-4 h-4 ml-auto text-slate-600" />}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mx-4 my-2 border-t border-slate-800" />

          {/* Settings row: Language + Theme */}
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Language selector (inline) */}
            <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <button
                onClick={() => setMobileLangOpen(!mobileLangOpen)}
                className="w-full flex items-center gap-3 px-4 py-3"
              >
                <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-200">{currentLang.native}</span>
                <span className="text-xs text-slate-500 ml-1">({currentLang.label})</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 ml-auto transition-transform ${mobileLangOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileLangOpen && (
                <div className="border-t border-slate-800">
                  {LANG_OPTIONS.map(option => (
                    <button
                      key={option.code}
                      onClick={() => { setLang(option.code); setMobileLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all ${
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

            {/* Theme toggle (large) */}
            <button
              onClick={toggleTheme}
              className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 active:scale-95 transition-all flex-shrink-0"
            >
              {theme === 'dark'
                ? <Moon className="w-5 h-5 text-indigo-400" />
                : <Sun className="w-5 h-5 text-amber-400" />
              }
              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </button>
          </div>

          {/* Citizen Login / Profile Link */}
          <div className="px-4 pt-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-emerald-400" />
                <span>{citizenProfile ? `Logged as ${citizenProfile.fullName}` : (t.navLogin || 'Citizen Login')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>

          {/* Admin / Staff link */}
          <div className="px-4 pb-5 pt-2">
            <Link
              to={adminToken ? '/admin/dashboard' : '/admin/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
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
