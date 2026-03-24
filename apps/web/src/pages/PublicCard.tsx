import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Download, Share2, Twitter, Linkedin, Github, Instagram, Globe, Mail, Phone, MapPin } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { publicApi, PublicCardData } from '../api/public';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const socialIcons = [
  { key: 'twitter', icon: Twitter, label: 'Twitter' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { key: 'github', icon: Github, label: 'GitHub' },
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
  { key: 'website', icon: Globe, label: 'Website' },
  { key: 'email', icon: Mail, label: 'Email' },
  { key: 'phone', icon: Phone, label: 'Phone' },
] as const;

function getSocialUrl(key: string, value: string) {
  if (key === 'email') return `mailto:${value}`;
  if (key === 'phone') return `tel:${value}`;
  if (value.startsWith('http')) return value;
  return `https://${value}`;
}

export default function PublicCard() {
  const { username } = useParams<{ username: string }>();

  const { data: card, isLoading, error } = useQuery({
    queryKey: ['public-card', username],
    queryFn: () => publicApi.getCard(username!).then((res) => res.data.data),
    enabled: !!username,
    retry: false,
  });

  const handleDownloadVCF = async () => {
    try {
      const response = await fetch(`${API_URL}/api/card/vcf`, {
        headers: { 'Content-Type': 'application/json' },
      });
      // For public VCF, we build it client-side since the API route requires auth
      if (!card) return;

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${card.displayName}`,
      ];
      if (card.title) lines.push(`TITLE:${card.title}`);
      if (card.company) lines.push(`ORG:${card.company}`);
      if (card.location) lines.push(`ADR;TYPE=WORK:;;${card.location};;;;`);
      if (card.bio) lines.push(`NOTE:${card.bio}`);
      if (card.socialLinks?.email) lines.push(`EMAIL;TYPE=INTERNET:${card.socialLinks.email}`);
      if (card.socialLinks?.phone) lines.push(`TEL;TYPE=CELL:${card.socialLinks.phone}`);
      if (card.socialLinks?.website) lines.push(`URL:${card.socialLinks.website}`);
      lines.push('END:VCARD');

      const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${card.username}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silent fail for VCF download
    }
  };

  const handleShare = async () => {
    const url = `https://cardova.net/${username}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: card?.displayName, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <>
        <Helmet><title>Card Not Found — Cardova</title></Helmet>
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
          <div className="text-center">
            <p className="text-6xl font-bold text-zinc-700 mb-4">404</p>
            <h1 className="text-xl font-bold text-zinc-100 mb-2">Card not found</h1>
            <p className="text-zinc-400 mb-6">This card doesn't exist or hasn't been published yet.</p>
            <Link to="/" className="btn-primary">Get your own card</Link>
          </div>
        </div>
      </>
    );
  }

  const imgSrc = card.avatarUrl
    ? card.avatarUrl.startsWith('http')
      ? card.avatarUrl
      : `${API_URL}${card.avatarUrl}`
    : null;

  const activeSocials = socialIcons.filter(
    (s) => card.socialLinks?.[s.key as keyof typeof card.socialLinks],
  );

  const themeStyles = {
    minimal: {
      bg: 'bg-zinc-50 min-h-screen',
      card: 'bg-white shadow-2xl shadow-zinc-200/50',
      name: 'text-zinc-900',
      subtitle: 'text-zinc-600',
      bio: 'text-zinc-700',
      iconBg: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700',
      contactBtn: 'bg-zinc-900 hover:bg-zinc-800 text-white',
      badge: 'text-zinc-400',
      actionBtn: 'text-zinc-500 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200',
    },
    bold: {
      bg: 'bg-zinc-950 min-h-screen',
      card: 'bg-zinc-900 border border-zinc-800',
      name: 'text-white',
      subtitle: 'text-zinc-400',
      bio: 'text-zinc-300',
      iconBg: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300',
      contactBtn: 'bg-brand-500 hover:bg-brand-600 text-white',
      badge: 'text-zinc-600',
      actionBtn: 'text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700',
    },
    glass: {
      bg: 'min-h-screen bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600',
      card: 'bg-white/10 backdrop-blur-2xl border border-white/20',
      name: 'text-white',
      subtitle: 'text-white/70',
      bio: 'text-white/80',
      iconBg: 'bg-white/10 hover:bg-white/20 text-white/90',
      contactBtn: 'bg-white hover:bg-white/90 text-zinc-900',
      badge: 'text-white/30',
      actionBtn: 'text-white/50 hover:text-white/80 bg-white/10 hover:bg-white/20',
    },
  };

  const t = themeStyles[card.theme];

  return (
    <>
      <Helmet>
        <title>{card.displayName} — Cardova</title>
        <meta property="og:title" content={card.displayName} />
        <meta property="og:description" content={card.bio || `${card.title || ''} ${card.company ? `at ${card.company}` : ''}`.trim() || 'Digital business card on Cardova'} />
        {imgSrc && <meta property="og:image" content={imgSrc} />}
        <meta property="og:url" content={`https://cardova.net/${card.username}`} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={card.displayName} />
        <meta name="twitter:description" content={card.bio || `${card.title || ''} ${card.company ? `at ${card.company}` : ''}`.trim()} />
        {imgSrc && <meta name="twitter:image" content={imgSrc} />}
      </Helmet>

      <div className={`${t.bg} flex items-center justify-center px-4 py-12`}>
        <div className="w-full max-w-sm">
          <div className={`rounded-2xl p-8 ${t.card}`}>
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-full overflow-hidden mb-5 ring-4 ring-white/10">
                {imgSrc ? (
                  <img src={imgSrc} alt={card.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-500 text-white text-3xl font-bold">
                    {card.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name */}
              <h1 className={`text-2xl font-bold ${t.name}`}>{card.displayName}</h1>

              {/* Title & Company */}
              {(card.title || card.company) && (
                <p className={`text-sm mt-1.5 ${t.subtitle}`}>
                  {card.title}
                  {card.title && card.company && ' at '}
                  {card.company}
                </p>
              )}

              {/* Location */}
              {card.location && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${t.subtitle}`}>
                  <MapPin className="w-3 h-3" />
                  {card.location}
                </p>
              )}

              {/* Bio */}
              {card.bio && (
                <p className={`text-sm mt-5 leading-relaxed ${t.bio}`}>{card.bio}</p>
              )}

              {/* Social Icons */}
              {activeSocials.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2.5 mt-6">
                  {activeSocials.map(({ key, icon: Icon, label }) => {
                    const value = card.socialLinks[key as keyof typeof card.socialLinks]!;
                    return (
                      <a
                        key={key}
                        href={getSocialUrl(key, value)}
                        target={key !== 'email' && key !== 'phone' ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        title={label}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${t.iconBg}`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Contact Button */}
              {(card.socialLinks?.email || card.socialLinks?.phone) && (
                <a
                  href={card.socialLinks.email ? `mailto:${card.socialLinks.email}` : `tel:${card.socialLinks.phone}`}
                  className={`mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${t.contactBtn}`}
                >
                  <Mail className="w-4 h-4" />
                  Contact Me
                </a>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-5">
                <button onClick={handleDownloadVCF} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${t.actionBtn}`}>
                  <Download className="w-4 h-4" />
                  Save Contact
                </button>
                <button onClick={handleShare} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${t.actionBtn}`}>
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              {/* Powered by Cardova */}
              {!card.isPro && (
                <Link to="/" className={`mt-8 text-xs hover:underline ${t.badge}`}>
                  Powered by Cardova
                </Link>
              )}
            </div>
          </div>

          {/* Get your card CTA */}
          <div className="text-center mt-6">
            <Link
              to="/register"
              className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Get your free digital card →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
