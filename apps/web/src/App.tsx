import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import PublicCard from './pages/PublicCard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { authApi } from './api/auth';

function App() {
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
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
  }, [setAuth, logout]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/:username" element={<PublicCard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
