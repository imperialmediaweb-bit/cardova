import { Helmet } from 'react-helmet-async';
import { Crown, Check, Sparkles, CreditCard } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { stripeApi } from '../api/stripe';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Billing() {
  const { user } = useAuthStore();

  const handleUpgrade = async (plan: 'monthly' | 'lifetime') => {
    try {
      const res = await stripeApi.createCheckout(plan);
      window.location.href = res.data.data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
    }
  };

  const proFeatures = [
    'All 6 premium themes',
    'Unlimited AI generations',
    'AI bio improvement',
    'No "Powered by Cardova" badge',
    'Priority support',
    'All future features',
  ];

  const freeFeatures = [
    '3 free themes',
    '10 AI credits',
    'QR code & vCard export',
    'Business card features',
    'Analytics tracking',
  ];

  return (
    <>
      <Helmet><title>Billing — Cardova</title></Helmet>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Billing & Subscription</h1>
        <p className="text-zinc-400 mb-8">Manage your plan</p>

        {/* Current Plan */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                user?.isPro ? 'bg-gradient-to-br from-brand-500 to-purple-500' : 'bg-zinc-800'
              }`}>
                {user?.isPro ? (
                  <Crown className="w-6 h-6 text-white" />
                ) : (
                  <CreditCard className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  {user?.isPro ? 'Pro Plan' : 'Free Plan'}
                </h2>
                <p className="text-sm text-zinc-500">
                  {user?.isPro
                    ? 'All features unlocked'
                    : 'Upgrade to unlock all features'}
                </p>
              </div>
            </div>
            {user?.isPro && (
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-brand-500/20 text-brand-400 text-sm font-medium rounded-full">
                  Active
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    try {
                      const res = await stripeApi.createPortal();
                      window.location.href = res.data.data.url;
                    } catch {
                      toast.error('Unable to open billing portal. Contact support.');
                    }
                  }}
                >
                  Manage Subscription
                </Button>
              </div>
            )}
          </div>
        </div>

        {!user?.isPro && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Free */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-zinc-200 mb-1">Free</h3>
              <p className="text-3xl font-bold text-zinc-100 mb-6">$0</p>
              <ul className="space-y-3 mb-6">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full" disabled>
                Current Plan
              </Button>
            </div>

            {/* Pro */}
            <div className="bg-zinc-900/50 border-2 border-brand-500/50 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  RECOMMENDED
                </span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-1">Pro</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <p className="text-3xl font-bold text-zinc-100">$19</p>
                <span className="text-zinc-500 text-sm">lifetime</span>
              </div>
              <ul className="space-y-3 mb-6">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <Button onClick={() => handleUpgrade('lifetime')} className="w-full">
                  <Crown className="w-4 h-4 mr-2" />
                  Get Pro — $19 Lifetime
                </Button>
                <button
                  onClick={() => handleUpgrade('monthly')}
                  className="w-full text-center text-xs text-zinc-500 hover:text-zinc-400 transition-colors py-1"
                >
                  or $4.99/month
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel your monthly subscription at any time. Your Pro features will remain active until the end of the billing period.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, and Apple Pay / Google Pay through Stripe.' },
              { q: 'Is the lifetime plan really lifetime?', a: 'Yes! Pay once and get Pro features forever, including all future updates.' },
              { q: 'Can I get a refund?', a: 'Yes, we offer a 14-day money-back guarantee. Contact us at support@cardova.app.' },
            ].map((item) => (
              <div key={item.q}>
                <h4 className="text-sm font-medium text-zinc-300 mb-1">{item.q}</h4>
                <p className="text-sm text-zinc-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
