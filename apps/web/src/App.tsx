import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Admin from './pages/Admin';
import Leads from './pages/Leads';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Directory from './pages/Directory';
import PublicCard from './pages/PublicCard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import { useAuthStore } from './stores/authStore';
import { authApi } from './api/auth';

/**
 * Hosts the app itself lives on. Any other hostname is a customer's verified
 * custom domain (CNAME → cardova.net) and renders that customer's card only.
 */
function isAppHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]') return true;
  if (h === 'cardova.net' || h === 'www.cardova.net' || h.endsWith('.cardova.net')) return true;
  if (h.endsWith('.railway.app')) return true;
  const extra = (import.meta.env.VITE_APP_HOSTS as string | undefined)?.split(',').map((s) => s.trim().toLowerCase()) ?? [];
  return extra.includes(h);
}

function App() {
  const { setAuth, logout } = useAuthStore();
  const host = window.location.hostname;
  const customHost = !isAppHost(host);

  // Hooks stay unconditional; the custom-host branch only affects what is rendered.
  useEffect(() => {
    if (customHost) return;
    const token = useAuthStore.getState().accessToken;
    if (token) {
      authApi.getMe()
        .then((res) => {
          setAuth(res.data.data, token);
        })
        .catch(() => {
          logout();
        });
    }
  }, [setAuth, logout, customHost]);

  if (customHost) {
    return <PublicCard domain={host} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
      <Route path="/directory" element={<Directory />} />
      <Route path="/:username" element={<PublicCard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
