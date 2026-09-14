import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/layout/Navbar';

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 — Cardova</title></Helmet>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-7xl font-bold text-brand-500 mb-4">404</p>
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Page not found</h1>
          <p className="text-zinc-400 mb-6">The page you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">Go home</Link>
        </div>
      </div>
    </>
  );
}
