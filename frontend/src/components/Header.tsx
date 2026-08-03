import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Ticket, Search, LayoutDashboard, ShieldCheck, Download, Menu, X, Landmark, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Header: React.FC = () => {
  const location = useLocation();
  const { adminToken } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      alert("App is ready! Tap your browser menu and select 'Add to Home Screen' or 'Install App'.");
    }
  };

  const navLinks = [
    { path: '/', label: 'Home & Map', icon: Building2 },
    { path: '/book', label: 'Book Token', icon: Ticket },
    { path: '/queue', label: 'Live Queue', icon: Landmark },
    { path: '/schemes', label: 'Govt Schemes', icon: Search },
  ];

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
                  Nimma Seva
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-inner">
                  Smart PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">Shivamogga GramOne & Seva Sindhu</p>
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
              <span>All Systems Operational</span>
            </div>

            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Install PWA</span>
            </button>

            {adminToken ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs border border-amber-500/30 shadow-md transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                <span>Admin Panel</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700/80 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Staff Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
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
              <span>{adminToken ? "Admin Dashboard" : "Staff / Operator Portal"}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
