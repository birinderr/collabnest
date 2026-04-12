import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import CampaignDetailsPage from './pages/CampaignDetailsPage';
import EditCampaignPage from './pages/EditCampaignPage';
import BackgroundParticles from './components/BackgroundParticles';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':        'Dashboard',
  '/campaigns':        'Campaigns',
  '/campaigns/new':    'New Campaign',
  '/login':            'Sign In',
  '/register':         'Create Account',
};

function PageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Exact match first, then prefix match for detail/edit routes
    const exact = PAGE_TITLES[pathname];
    if (exact) {
      document.title = `${exact} · CollabNest`;
      return;
    }
    if (pathname.endsWith('/edit')) {
      document.title = 'Edit Campaign · CollabNest';
    } else if (/^\/campaigns\/\d+$/.test(pathname)) {
      document.title = 'Campaign Details · CollabNest';
    } else {
      document.title = 'CollabNest';
    }
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {/* Single canvas — persists across all routes */}
          <BackgroundParticles />
          {/* Per-route <title> updates */}
          <PageTitle />

          <Routes>
            {/* Public */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"          element={<DashboardPage />} />
              <Route path="/campaigns"          element={<CampaignsPage />} />
              <Route path="/campaigns/new"      element={<CreateCampaignPage />} />
              <Route path="/campaigns/:id"      element={<CampaignDetailsPage />} />
              <Route path="/campaigns/:id/edit" element={<EditCampaignPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}