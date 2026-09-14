import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <Helmet><title>Invalid Link — Cardova</title></Helmet>
        <Navbar />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">Invalid Reset Link</h1>
            <p className="text-zinc-400 mb-4">This password reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="text-brand-400 hover:text-brand-300 font-medium">
              Request a new link
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Reset Password — Cardova</title></Helmet>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-100">Set new password</h1>
            <p className="text-zinc-400 mt-2">Enter your new password below</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              minLength={8}
            />
            <Button type="submit" isLoading={loading} className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
