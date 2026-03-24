import { Twitter, Linkedin, Github, Instagram, Globe, Mail, Phone, MapPin, Building2, ExternalLink } from 'lucide-react';

interface CardPreviewProps {
  displayName: string;
  title?: string;
  company?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string | null;
  theme: 'minimal' | 'bold' | 'glass' | 'neon' | 'sunset' | 'ocean';
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    website?: string;
    email?: string;
    phone?: string;
  };
  isPro?: boolean;
  username?: string;
}

const socialIcons = [
  { key: 'twitter', icon: Twitter, label: 'Twitter' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { key: 'github', icon: Github, label: 'GitHub' },
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
  { key: 'website', icon: Globe, label: 'Website' },
  { key: 'email', icon: Mail, label: 'Email' },
  { key: 'phone', icon: Phone, label: 'Phone' },
] as const;

export default function CardPreview({
  displayName,
  title,
  company,
  location,
  bio,
  avatarUrl,
  theme,
  socialLinks = {},
  isPro = false,
  username,
}: CardPreviewProps) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const imgSrc = avatarUrl
    ? avatarUrl.startsWith('http')
      ? avatarUrl
      : `${apiUrl}${avatarUrl}`
    : null;

  const activeSocials = socialIcons.filter(
    (s) => socialLinks[s.key as keyof typeof socialLinks],
  );

  const getSocialUrl = (key: string, value: string) => {
    if (key === 'email') return `mailto:${value}`;
    if (key === 'phone') return `tel:${value}`;
    if (value.startsWith('http')) return value;
    return `https://${value}`;
  };

  const themeStyles: Record<string, { card: string; name: string; subtitle: string; bio: string; iconBg: string; badge: string; border: string }> = {
    minimal: {
      card: 'bg-white text-zinc-900 shadow-xl',
      name: 'text-zinc-900',
      subtitle: 'text-zinc-600',
      bio: 'text-zinc-700',
      iconBg: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700',
      badge: 'text-zinc-400',
      border: '',
    },
    bold: {
      card: 'bg-zinc-900 text-white border border-zinc-700',
      name: 'text-white',
      subtitle: 'text-zinc-400',
      bio: 'text-zinc-300',
      iconBg: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300',
      badge: 'text-zinc-600',
      border: '',
    },
    glass: {
      card: 'bg-white/10 backdrop-blur-2xl text-white border border-white/20',
      name: 'text-white',
      subtitle: 'text-white/70',
      bio: 'text-white/80',
      iconBg: 'bg-white/10 hover:bg-white/20 text-white/80',
      badge: 'text-white/30',
      border: '',
    },
    neon: {
      card: 'bg-zinc-950 text-white border border-green-400/30 shadow-lg shadow-green-400/10',
      name: 'text-green-300',
      subtitle: 'text-cyan-400/80',
      bio: 'text-zinc-300',
      iconBg: 'bg-green-400/10 hover:bg-green-400/20 text-green-300',
      badge: 'text-green-400/30',
      border: '',
    },
    sunset: {
      card: 'bg-white/10 backdrop-blur-2xl text-white border border-white/20',
      name: 'text-white',
      subtitle: 'text-orange-100/80',
      bio: 'text-white/80',
      iconBg: 'bg-white/10 hover:bg-white/20 text-white/90',
      badge: 'text-white/30',
      border: '',
    },
    ocean: {
      card: 'bg-white/10 backdrop-blur-2xl text-white border border-white/20',
      name: 'text-white',
      subtitle: 'text-cyan-100/80',
      bio: 'text-white/80',
      iconBg: 'bg-white/10 hover:bg-white/20 text-white/90',
      badge: 'text-white/30',
      border: '',
    },
  };

  const t = themeStyles[theme] || themeStyles.minimal;

  const wrapperGradients: Record<string, string> = {
    glass: 'bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600',
    sunset: 'bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600',
    ocean: 'bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500',
  };
  const wrapperClass = wrapperGradients[theme];

  return (
    <div className={wrapperClass ? `p-6 rounded-3xl ${wrapperClass}` : ''}>
      <div className={`rounded-2xl p-8 max-w-sm mx-auto ${t.card}`}>
        {/* Avatar */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-200 mb-4 ring-4 ring-white/10">
            {imgSrc ? (
              <img src={imgSrc} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-500 text-white text-2xl font-bold">
                {displayName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* Name & Title */}
          <h2 className={`text-xl font-bold ${t.name}`}>{displayName || 'Your Name'}</h2>
          {(title || company) && (
            <p className={`text-sm mt-1 ${t.subtitle}`}>
              {title}
              {title && company && ' at '}
              {company}
            </p>
          )}
          {location && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${t.subtitle}`}>
              <MapPin className="w-3 h-3" />
              {location}
            </p>
          )}

          {/* Bio */}
          {bio && (
            <p className={`text-sm mt-4 leading-relaxed ${t.bio}`}>{bio}</p>
          )}

          {/* Social Icons */}
          {activeSocials.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {activeSocials.map(({ key, icon: Icon, label }) => {
                const value = socialLinks[key as keyof typeof socialLinks];
                return (
                  <a
                    key={key}
                    href={getSocialUrl(key, value!)}
                    target={key !== 'email' && key !== 'phone' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    title={label}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${t.iconBg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Contact Button */}
          {(socialLinks.email || socialLinks.phone) && (
            <a
              href={socialLinks.email ? `mailto:${socialLinks.email}` : `tel:${socialLinks.phone}`}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact
            </a>
          )}

          {/* Powered by Cardova */}
          {!isPro && (
            <p className={`mt-6 text-xs ${t.badge}`}>
              Powered by Cardova
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
