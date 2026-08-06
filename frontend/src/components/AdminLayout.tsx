/**
 * AdminLayout.tsx — Shared sidebar layout for all admin pages.
 * Every admin route wraps its content with this component.
 * Sidebar collapses on tablet/mobile.
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wrench, BarChart3, Settings,
  ShieldAlert, LogOut, Menu, X, ChevronRight, Activity,
  ScrollText
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/admin/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/admin/queue',      label: 'Queue Control', icon: Users },
  { path: '/admin/services',   label: 'Services',      icon: Wrench },
  { path: '/admin/analytics',  label: 'Analytics',     icon: BarChart3 },
  { path: '/admin/audit-log',  label: 'Audit Log',     icon: ScrollText },
  { path: '/admin/settings',   label: 'Settings',      icon: Settings },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { setAdminAuth } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setAdminAuth(null, null);
    window.location.href = '/admin/login';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className={`p-5 border-b border-slate-800 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <ShieldAlert className="w-5 h-5 text-slate-950" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-xs font-black text-white tracking-tight">NIMMA SEVA</p>
            <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Live indicator */}
      {!collapsed && (
        <div className="mx-4 mt-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-[10px] text-emerald-300 font-bold">All Systems Live</span>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'} transition-colors`} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/40 transition-all ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-56'}`}>
        <div className="flex justify-end p-2 border-b border-slate-800">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR (drawer) ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl bg-slate-800 text-slate-200">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-white">Nimma Seva Admin</span>
        </div>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
