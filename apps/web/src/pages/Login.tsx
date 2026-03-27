import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LogIn } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      const { accessToken, user } = res.data.data;
      setAuth(user, accessToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.errors) {
        setErrors(
          Object.fromEntries(
            Object.entries(err.response.data.errors).map(([k, v]) => [k, (v as string[])[0]]),
          ),
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Log In — Cardova</title></Helmet>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-100">Welcome back</h1>
            <p className="text-zinc-400 mt-2">Log in to manage your digital card</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              error={errors.password}
              required
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
            <p className="text-[11px] text-zinc-600 uppercase tracking-wider font-medium mb-3">Try a demo account</p>
            {[
              { emoji: '👩', label: 'Personal Card', sublabel: 'Free tier — Sarah Chen', email: 'sarah@demo.cardova.app', password: 'Demo123!', badge: 'Free', badgeColor: 'text-zinc-400 bg-zinc-800' },
              { emoji: '🍝', label: 'Bella Cucina', sublabel: 'Restaurant business card', email: 'bella@demo.cardova.app', password: 'Demo123!', badge: 'Pro', badgeColor: 'text-brand-400 bg-brand-500/10' },
              { emoji: '🚀', label: 'Luminous Digital', sublabel: 'Agency business card', email: 'luminous@demo.cardova.app', password: 'Demo123!', badge: 'Pro', badgeColor: 'text-brand-400 bg-brand-500/10' },
            ].map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => { setEmail(account.email); setPassword(account.password); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors text-left group"
              >
                <span className="text-lg">{account.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">{account.label}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${account.badgeColor}`}>{account.badge}</span>
                  </div>
                  <p className="text-[11px] text-zinc-600">{account.sublabel}</p>
                </div>
                <span className="text-[10px] text-zinc-700 group-hover:text-brand-400 transition-colors font-medium">click to fill</span>
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
