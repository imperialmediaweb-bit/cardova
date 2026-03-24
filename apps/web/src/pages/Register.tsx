import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { UserPlus } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await authApi.register({ name, email, password });
      setSuccess(true);
      toast.success('Account created! Check your email.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
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

  if (success) {
    return (
      <>
        <Helmet><title>Check Your Email — Cardova</title></Helmet>
        <Navbar />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-8 h-8 text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">Check your email</h1>
            <p className="text-zinc-400">
              We sent a verification link to <span className="text-zinc-200 font-medium">{email}</span>.
              Click the link to activate your account.
            </p>
            <Link to="/login" className="inline-block mt-6 text-brand-400 hover:text-brand-300 font-medium text-sm">
              Back to login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Sign Up — Cardova</title></Helmet>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-100">Create your card</h1>
            <p className="text-zinc-400 mt-2">Get your free digital business card in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              error={errors.name}
              required
            />
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
              placeholder="Min. 8 characters"
              error={errors.password}
              required
              minLength={8}
            />

            <Button type="submit" isLoading={loading} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
