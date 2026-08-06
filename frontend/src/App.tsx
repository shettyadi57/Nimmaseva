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
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { QueueManagement } from './pages/admin/QueueManagement';
import { ServicesControl } from './pages/admin/Services';
import { AdminAnalytics } from './pages/admin/Analytics';
import { AdminSettings } from './pages/admin/Settings';
import { useStore } from './store/useStore';

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
            <Route path="/book" element={<BookingForm />} />

            <Route path="/token/:tokenNumber" element={<TokenView />} />
            <Route path="/queue" element={<QueueTracker />} />
            <Route path="/schemes" element={<SchemeSearch />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/queue" element={<ProtectedAdminRoute><QueueManagement /></ProtectedAdminRoute>} />
            <Route path="/admin/services" element={<ProtectedAdminRoute><ServicesControl /></ProtectedAdminRoute>} />
            <Route path="/admin/analytics" element={<ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute>} />
            <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};
