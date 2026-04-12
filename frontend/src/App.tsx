import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {/* Single canvas mounted once — renders behind every page */}
          <BackgroundParticles />

          <Routes>
            {/* Public */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"            element={<DashboardPage />} />
              <Route path="/campaigns"            element={<CampaignsPage />} />
              <Route path="/campaigns/new"        element={<CreateCampaignPage />} />
              <Route path="/campaigns/:id"        element={<CampaignDetailsPage />} />
              <Route path="/campaigns/:id/edit"   element={<EditCampaignPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}