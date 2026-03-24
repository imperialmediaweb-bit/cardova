import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, XCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import { authApi } from '../api/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

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
            </>
          )}
        </div>
      </div>
    </>
  );
}
