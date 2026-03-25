import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authApi } from '../api/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    authApi.verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [searchParams]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResending(true);
    try {
      await authApi.resendVerification(resendEmail);
      toast.success('Verification email sent! Check your inbox.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Helmet><title>Verify Email — Cardova</title></Helmet>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {status === 'loading' && (
            <>
              <Spinner size="lg" className="mb-4" />
              <p className="text-zinc-400">Verifying your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-zinc-100 mb-2">Email Verified</h1>
              <p className="text-zinc-400 mb-6">{message}</p>
              <Link to="/login" className="btn-primary">
                Log in to your account
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-zinc-100 mb-2">Verification Failed</h1>
              <p className="text-zinc-400 mb-6">{message}</p>
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
                Try registering again
              </Link>

              <div className="mt-8 pt-6 border-t border-zinc-800">
                <p className="text-sm text-zinc-400 mb-4">
                  Didn't receive the email? Enter your email to resend.
                </p>
                <form onSubmit={handleResend} className="space-y-3">
                  <Input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <Button type="submit" isLoading={resending} className="w-full">
                    Resend verification email
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
