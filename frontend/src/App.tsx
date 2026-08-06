import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Home } from './pages/Home';
import { BookingForm } from './pages/BookingForm';
import { TokenView } from './pages/TokenView';
import { QueueTracker } from './pages/QueueTracker';
import { SchemeSearch } from './pages/SchemeSearch';
import { CitizenLogin } from './pages/CitizenLogin';
import { MyBookings } from './pages/MyBookings';
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { QueueManagement } from './pages/admin/QueueManagement';
import { ServicesControl } from './pages/admin/Services';
import { AdminAnalytics } from './pages/admin/Analytics';
import { AdminSettings } from './pages/admin/Settings';
import { useStore } from './store/useStore';
import { AdminLayout } from './components/AdminLayout';
import { AuditLogViewer } from './pages/admin/AuditLog';
import { DisplayBoard } from './pages/DisplayBoard';

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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<CitizenLogin />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/book" element={<BookingForm />} />

            <Route path="/token/:tokenNumber" element={<TokenView />} />
            <Route path="/queue" element={<QueueTracker />} />
            <Route path="/schemes" element={<SchemeSearch />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedAdminRoute>} />
            <Route path="/admin/queue" element={<ProtectedAdminRoute><AdminLayout><QueueManagement /></AdminLayout></ProtectedAdminRoute>} />
            <Route path="/admin/services" element={<ProtectedAdminRoute><AdminLayout><ServicesControl /></AdminLayout></ProtectedAdminRoute>} />
            <Route path="/admin/analytics" element={<ProtectedAdminRoute><AdminLayout><AdminAnalytics /></AdminLayout></ProtectedAdminRoute>} />
            <Route path="/admin/audit-log" element={<ProtectedAdminRoute><AdminLayout><AuditLogViewer /></AdminLayout></ProtectedAdminRoute>} />
            <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminLayout><AdminSettings /></AdminLayout></ProtectedAdminRoute>} />
            {/* Display board — admin-protected, no Header/Footer */}
            <Route path="/display/:officeId" element={<ProtectedAdminRoute><DisplayBoard /></ProtectedAdminRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};
