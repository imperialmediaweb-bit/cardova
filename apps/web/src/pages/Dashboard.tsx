import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, BarChart3, Crown, ExternalLink, Copy, Check, Eye, TrendingUp, Globe, Share2, QrCode, Download, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import CardEditor from '../components/card/CardEditor';
import CardPreview from '../components/card/CardPreview';
import ViewsChart from '../components/analytics/ViewsChart';
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

  const { data: cardData, isLoading: cardLoading, error: cardError } = useQuery({
    queryKey: ['card'],
    queryFn: () => cardApi.getCard().then((res) => res.data.data),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.getViews().then((res) => res.data.data),
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

  const handleUpgrade = async () => {
    try {
      const res = await stripeApi.createCheckout('lifetime');
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

  const handleShare = async () => {
    const url = `https://cardova.net/${cardForm?.username || ''}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: cardForm?.displayName, url });
      } catch { /* cancelled */ }
    } else {
      copyLink();
    }
  };

  const handleDownloadQR = async () => {
    try {
      const res = await cardApi.getQRCode();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cardForm?.username || 'card'}-qr.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  const handleDownloadVCF = async () => {
    try {
      const res = await cardApi.getVCF();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cardForm?.username || 'card'}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download vCard');
    }
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

  if (cardError) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="text-center">
            <p className="text-zinc-400 mb-4">Failed to load your card. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </div>
        </div>
      </>
    );
  }

  const displayCard = cardForm || cardData;
  const viewsTotal = analyticsData?.total || 0;
  const viewsLast30 = analyticsData?.views?.reduce((sum: number, v: any) => sum + v.count, 0) || 0;

  return (
    <>
      <Helmet><title>Dashboard — Cardova</title></Helmet>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Top Bar: Card link + Quick Actions */}
        {displayCard && (
          <div className="mb-6 lg:mb-8">
            {/* Card URL Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl lg:text-2xl font-bold text-zinc-100 truncate">
                    {displayCard.displayName || 'Your Card'}
                  </h1>
                  {user?.isPro && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-full flex-shrink-0">
                      PRO
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <span className="text-xs text-zinc-500">cardova.net/</span>
                    <span className="text-xs text-zinc-200 font-medium">{displayCard.username}</span>
                  </div>
                  <button
                    onClick={copyLink}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    title="Copy link"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={`/${displayCard.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    title="View card"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:inline">QR</span>
                </button>
                <button
                  onClick={handleDownloadVCF}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">vCard</span>
                </button>
              </div>
            </div>

            {/* Stats Bar + Upgrade */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-brand-400" />
                  <span className="text-xs text-zinc-500">Total Views</span>
                </div>
                <p className="text-xl font-bold text-zinc-100">{viewsTotal.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-zinc-500">Last 30 Days</span>
                </div>
                <p className="text-xl font-bold text-zinc-100">{viewsLast30.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-zinc-500">Top Source</span>
                </div>
                <p className="text-sm font-bold text-zinc-100 truncate">
                  {analyticsData?.topReferrers?.[0]?.referrer || 'Direct'}
                </p>
              </div>
              {!user?.isPro ? (
                <button
                  onClick={handleUpgrade}
                  className="p-4 bg-gradient-to-br from-brand-500/10 to-purple-500/10 border border-brand-500/30 rounded-xl text-left hover:from-brand-500/20 hover:to-purple-500/20 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-4 h-4 text-brand-400" />
                    <span className="text-xs text-brand-400/70">Upgrade</span>
                  </div>
                  <p className="text-sm font-bold text-brand-300 flex items-center gap-1">
                    Get Pro — $19
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </button>
              ) : (
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-zinc-500">AI Credits</span>
                  </div>
                  <p className="text-xl font-bold text-zinc-100">
                    {user?.isPro ? 'Unlimited' : `${user?.aiCreditsUsed || 0}/10`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl w-fit mb-6 border border-zinc-800">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'editor'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Editor
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </div>

        {/* Editor Tab */}
        {activeTab === 'editor' && displayCard && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left: Editor (3 cols) */}
            <div className="lg:col-span-3">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 lg:p-6">
                <CardEditor
                  card={displayCard}
                  onChange={(updated) => setCardForm(updated)}
                />
              </div>
            </div>

            {/* Right: Preview (2 cols) */}
            <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-zinc-400">Live Preview</p>
                <a
                  href={`/${displayCard.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                >
                  Open full page
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="border border-zinc-800 rounded-2xl overflow-hidden">
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
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="py-20 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : analyticsData && analyticsData.views?.length > 0 ? (
              <>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 lg:p-6">
                  <h3 className="text-base font-semibold text-zinc-100 mb-4">Views — Last 30 Days</h3>
                  <ViewsChart data={analyticsData.views} />
                </div>
                {analyticsData.topReferrers?.length > 0 && (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 lg:p-6">
                    <h3 className="text-base font-semibold text-zinc-100 mb-4">Top Referrers</h3>
                    <div className="space-y-1">
                      {analyticsData.topReferrers.map((ref: any, i: number) => (
                        <div
                          key={ref.referrer}
                          className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-600 w-5">{i + 1}.</span>
                            <span className="text-sm text-zinc-300">{ref.referrer || 'Direct'}</span>
                          </div>
                          <span className="text-sm font-medium text-zinc-400">{ref.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
                <Eye className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-300 mb-2">No views yet</h3>
                <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                  Share your card to start tracking views. Your analytics will appear here.
                </p>
                <Button onClick={handleShare} size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Your Card
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
