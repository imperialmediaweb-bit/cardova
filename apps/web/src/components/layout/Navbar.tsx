import { Link, useNavigate } from 'react-router-dom';
import { LogOut, CreditCard, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api/auth';
import Badge from '../ui/Badge';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors
    }
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-300 text-transparent bg-clip-text">Cardova</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.isPro && <Badge variant="pro">Pro</Badge>}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Get your card
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
