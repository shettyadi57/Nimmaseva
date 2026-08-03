import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Ticket, Search, LayoutDashboard, ShieldCheck, Download, Menu, X, Landmark } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-emerald-950/95 backdrop-blur-md text-white border-b border-emerald-800/50 shadow-lg">
      {/* Top Karnataka Banner Strip */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-700 h-1.5 w-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Landmark className="w-6 h-6 text-emerald-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  Shivamogga Smart Seva
                </span>
                <span className="bg-emerald-800/80 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-600/50">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 font-medium">GramOne & Seva Sindhu Token System</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-amber-300 shadow-sm border border-emerald-700/60'
                      : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-semibold text-xs transition-transform active:scale-95 shadow"
            >
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </button>

            {adminToken ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-medium text-xs border border-emerald-600/50 shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 font-medium text-xs border border-emerald-800"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={handleInstallPWA}
              className="p-2 rounded-lg bg-amber-500 text-emerald-950 font-bold text-xs"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-emerald-900 text-emerald-100 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-emerald-900 border-b border-emerald-800 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-100 hover:bg-emerald-800 text-sm font-medium"
              >
                <Icon className="w-5 h-5 text-amber-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-emerald-800 flex flex-col gap-2">
            <Link
              to={adminToken ? "/admin/dashboard" : "/admin/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-amber-500 text-emerald-950 font-bold text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{adminToken ? "Admin Dashboard" : "Admin Portal"}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
