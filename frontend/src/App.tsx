import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { useStore } from './store/useStore';
import { AdminLayout } from './components/AdminLayout';

// ── Lazy-loaded routes for code splitting ────────────────────────────────────
// Citizen-facing routes
const Home            = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const BookingForm     = lazy(() => import('./pages/BookingForm').then(m => ({ default: m.BookingForm })));
const TokenView       = lazy(() => import('./pages/TokenView').then(m => ({ default: m.TokenView })));
const QueueTracker    = lazy(() => import('./pages/QueueTracker').then(m => ({ default: m.QueueTracker })));
const SchemeSearch    = lazy(() => import('./pages/SchemeSearch').then(m => ({ default: m.SchemeSearch })));
const CitizenLogin    = lazy(() => import('./pages/CitizenLogin').then(m => ({ default: m.CitizenLogin })));
const MyBookings      = lazy(() => import('./pages/MyBookings').then(m => ({ default: m.MyBookings })));
const Grievance       = lazy(() => import('./pages/Grievance').then(m => ({ default: m.Grievance })));
const ServiceDocuments = lazy(() => import('./pages/ServiceDocuments').then(m => ({ default: m.ServiceDocuments })));

// Policy / compliance routes
const Terms           = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Privacy         = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Accessibility   = lazy(() => import('./pages/Accessibility').then(m => ({ default: m.Accessibility })));
const Hyperlinking    = lazy(() => import('./pages/Hyperlinking').then(m => ({ default: m.Hyperlinking })));
const Sitemap         = lazy(() => import('./pages/Sitemap').then(m => ({ default: m.Sitemap })));

// Admin routes (heaviest — isolated chunk)
const AdminLogin      = lazy(() => import('./pages/admin/Login').then(m => ({ default: m.AdminLogin })));
const AdminDashboard  = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const QueueManagement = lazy(() => import('./pages/admin/QueueManagement').then(m => ({ default: m.QueueManagement })));
const ServicesControl = lazy(() => import('./pages/admin/Services').then(m => ({ default: m.ServicesControl })));
const AdminAnalytics  = lazy(() => import('./pages/admin/Analytics').then(m => ({ default: m.AdminAnalytics })));
const AdminSettings   = lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.AdminSettings })));
const AuditLogViewer  = lazy(() => import('./pages/admin/AuditLog').then(m => ({ default: m.AuditLogViewer })));
const DisplayBoard    = lazy(() => import('./pages/DisplayBoard').then(m => ({ default: m.DisplayBoard })));

// ── Route transition / loading fallback ─────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading…</p>
    </div>
  </div>
);

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { adminToken } = useStore();
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <PWAInstallBanner />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"          element={<Home />} />
              <Route path="/services"  element={<ServiceDocuments />} />
              <Route path="/login"     element={<CitizenLogin />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/book"      element={<BookingForm />} />

              <Route path="/token/:tokenNumber" element={<TokenView />} />
              <Route path="/queue"     element={<QueueTracker />} />
              <Route path="/schemes"   element={<SchemeSearch />} />
              <Route path="/grievance" element={<Grievance />} />

              {/* Policies & Compliance */}
              <Route path="/terms"         element={<Terms />} />
              <Route path="/privacy"       element={<Privacy />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/hyperlinking"  element={<Hyperlinking />} />
              <Route path="/sitemap"       element={<Sitemap />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedAdminRoute>} />
              <Route path="/admin/queue"     element={<ProtectedAdminRoute><AdminLayout><QueueManagement /></AdminLayout></ProtectedAdminRoute>} />
              <Route path="/admin/services"  element={<ProtectedAdminRoute><AdminLayout><ServicesControl /></AdminLayout></ProtectedAdminRoute>} />
              <Route path="/admin/analytics" element={<ProtectedAdminRoute><AdminLayout><AdminAnalytics /></AdminLayout></ProtectedAdminRoute>} />
              <Route path="/admin/audit-log" element={<ProtectedAdminRoute><AdminLayout><AuditLogViewer /></AdminLayout></ProtectedAdminRoute>} />
              <Route path="/admin/settings"  element={<ProtectedAdminRoute><AdminLayout><AdminSettings /></AdminLayout></ProtectedAdminRoute>} />
              {/* Display board — admin-protected, no Header/Footer */}
              <Route path="/display/:officeId" element={<ProtectedAdminRoute><DisplayBoard /></ProtectedAdminRoute>} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
};
