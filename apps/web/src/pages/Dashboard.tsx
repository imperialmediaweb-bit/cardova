import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, BarChart3, Crown, ExternalLink, Copy, Check } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import CardEditor from '../components/card/CardEditor';
import CardPreview from '../components/card/CardPreview';
import ViewsChart from '../components/analytics/ViewsChart';
import StatsCards from '../components/analytics/StatsCards';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { cardApi, CardData } from '../api/card';
import { analyticsApi } from '../api/analytics';
import { stripeApi } from '../api/stripe';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics'>('editor');
  const [cardForm, setCardForm] = useState<CardData | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: cardData, isLoading: cardLoading } = useQuery({
    queryKey: ['card'],
    queryFn: () => cardApi.getCard().then((res) => res.data.data),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.getViews().then((res) => res.data.data),
    enabled: activeTab === 'analytics',
  });

  useEffect(() => {
    if (cardData && !cardForm) {
      setCardForm(cardData);
    }
  }, [cardData, cardForm]);

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      toast.success("You're now Pro! All features unlocked.");
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const handleUpgrade = async (plan: 'monthly' | 'lifetime') => {
    try {
      const res = await stripeApi.createCheckout(plan);
      window.location.href = res.data.data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
    }
  };

  const copyLink = () => {
    const url = `https://cardova.net/${cardForm?.username || ''}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (cardLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Spinner size="lg" />
        </div>
      </>
    );
  }

  const displayCard = cardForm || cardData;

  return (
    <>
      <Helmet><title>Dashboard — Cardova</title></Helmet>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Your Card</h1>
            {displayCard && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-zinc-400">cardova.net/{displayCard.username}</span>
                <button
                  onClick={copyLink}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`/${displayCard.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {!user?.isPro && (
            <Button onClick={() => handleUpgrade('lifetime')} size="sm">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro — $19
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg w-fit mb-8 border border-zinc-800">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'editor' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Editor
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </div>

        {/* Content */}
        {activeTab === 'editor' && displayCard && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Editor */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <CardEditor
                card={displayCard}
                onChange={(updated) => setCardForm(updated)}
              />
            </div>

            {/* Right: Preview */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-sm font-medium text-zinc-400 mb-4">Live Preview</p>
              <CardPreview
                displayName={displayCard.displayName}
                title={displayCard.title}
                company={displayCard.company}
                location={displayCard.location}
                bio={displayCard.bio}
                avatarUrl={displayCard.avatarUrl}
                theme={displayCard.theme}
                socialLinks={displayCard.socialLinks}
                isPro={user?.isPro}
                username={displayCard.username}
                cardType={displayCard.cardType}
                services={displayCard.services}
                customLinks={displayCard.customLinks}
                businessHours={displayCard.businessHours}
                gallery={displayCard.gallery}
              />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <Spinner size="lg" className="py-20" />
            ) : analyticsData ? (
              <>
                <StatsCards
                  total={analyticsData.total}
                  last30Days={analyticsData.views.reduce((sum, v) => sum + v.count, 0)}
                  topReferrer={analyticsData.topReferrers[0]?.referrer || 'Direct'}
                />
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-zinc-100 mb-4">Views — Last 30 Days</h3>
                  <ViewsChart data={analyticsData.views} />
                </div>
                {analyticsData.topReferrers.length > 0 && (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">Top Referrers</h3>
                    <div className="space-y-2">
                      {analyticsData.topReferrers.map((ref) => (
                        <div key={ref.referrer} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-800/50">
                          <span className="text-sm text-zinc-300">{ref.referrer}</span>
                          <span className="text-sm font-medium text-zinc-400">{ref.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-zinc-400 text-center py-20">No analytics data yet. Share your card to start tracking views.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
