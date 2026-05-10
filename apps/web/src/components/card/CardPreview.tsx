import { Twitter, Linkedin, Github, Instagram, Globe, Mail, Phone, MapPin, Clock, ExternalLink, Briefcase, Code, Palette, Camera, Wrench, Heart, BookOpen, ShoppingBag, Link, Calendar, FileText, Map, Star, Menu } from 'lucide-react';
import type { ServiceItem, CustomLink, BusinessHour, GalleryItem } from '../../api/card';

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
  cardType?: 'personal' | 'business';
  services?: ServiceItem[];
  customLinks?: CustomLink[];
  businessHours?: BusinessHour[];
  gallery?: GalleryItem[];
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

const serviceIconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase, code: Code, palette: Palette, camera: Camera,
  wrench: Wrench, heart: Heart, 'book-open': BookOpen, 'shopping-bag': ShoppingBag,
};

const linkIconMap: Record<string, React.ElementType> = {
  link: Link, calendar: Calendar, 'shopping-bag': ShoppingBag, camera: Camera,
  'file-text': FileText, map: Map, star: Star, menu: Menu, 'external-link': ExternalLink,
};

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
  cardType = 'personal',
  services = [],
  customLinks = [],
  businessHours = [],
  gallery = [],
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

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${apiUrl}${url}`;
  };

  const isBusiness = cardType === 'business';
  const activeServices = services.filter((s) => s.name);
  const activeLinks = customLinks.filter((l) => l.title && l.url);
  const activeHours = businessHours.filter((h) => h.day);
  const activeGallery = gallery.filter((g) => g.url);

  const themeStyles: Record<string, { card: string; name: string; subtitle: string; bio: string; iconBg: string; badge: string; sectionTitle: string; sectionBg: string; sectionBorder: string; linkBtn: string }> = {
    minimal: {
      card: 'bg-white text-zinc-900 shadow-xl',
      name: 'text-zinc-900',
      subtitle: 'text-zinc-600',
      bio: 'text-zinc-700',
      iconBg: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700',
      badge: 'text-zinc-400',
      sectionTitle: 'text-zinc-800',
      sectionBg: 'bg-zinc-50',
      sectionBorder: 'border-zinc-200',
      linkBtn: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700',
    },
    bold: {
      card: 'bg-zinc-900 text-white border border-zinc-700',
      name: 'text-white',
      subtitle: 'text-zinc-400',
      bio: 'text-zinc-300',
      iconBg: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300',
      badge: 'text-zinc-600',
      sectionTitle: 'text-zinc-200',
      sectionBg: 'bg-zinc-800/50',
      sectionBorder: 'border-zinc-700',
      linkBtn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300',
    },
    glass: {
      card: 'bg-white/10 backdrop-blur-2xl text-white border border-white/20',
      name: 'text-white',
      subtitle: 'text-white/70',
      bio: 'text-white/80',
      iconBg: 'bg-white/10 hover:bg-white/20 text-white/80',
      badge: 'text-white/30',
      sectionTitle: 'text-white/90',
      sectionBg: 'bg-white/5',
      sectionBorder: 'border-white/10',
      linkBtn: 'bg-white/10 hover:bg-white/20 text-white/80',
    },
    neon: {
      card: 'bg-zinc-950 text-white border border-green-400/30 shadow-lg shadow-green-400/10',
      name: 'text-green-300',
      subtitle: 'text-cyan-400/80',
      bio: 'text-zinc-300',
      iconBg: 'bg-green-400/10 hover:bg-green-400/20 text-green-300',
      badge: 'text-green-400/30',
      sectionTitle: 'text-green-300',
      sectionBg: 'bg-green-400/5',
      sectionBorder: 'border-green-400/20',
      linkBtn: 'bg-green-400/10 hover:bg-green-400/20 text-green-300',
    },
    sunset: {
      card: 'bg-white/10 backdrop-blur-2xl text-white border border-white/20',
      name: 'text-white',
      subtitle: 'text-orange-100/80',
      bio: 'text-white/80',
      iconBg: 'bg-white/10 hover:bg-white/20 text-white/90',
      badge: 'text-white/30',
      sectionTitle: 'text-white/90',
      sectionBg: 'bg-white/5',
      sectionBorder: 'border-white/10',
      linkBtn: 'bg-white/10 hover:bg-white/20 text-white/90',
    },
    ocean: {
      card: 'bg-white/10 backdrop-blur-2xl text-white border border-white/20',
      name: 'text-white',
      subtitle: 'text-cyan-100/80',
      bio: 'text-white/80',
      iconBg: 'bg-white/10 hover:bg-white/20 text-white/90',
      badge: 'text-white/30',
      sectionTitle: 'text-white/90',
      sectionBg: 'bg-white/5',
      sectionBorder: 'border-white/10',
      linkBtn: 'bg-white/10 hover:bg-white/20 text-white/90',
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
        </div>

        {/* Business Sections */}
        {isBusiness && (
          <div className="mt-6 space-y-4">
            {/* Services */}
            {activeServices.length > 0 && (
              <div className={`rounded-xl p-4 ${t.sectionBg} border ${t.sectionBorder}`}>
                <h3 className={`text-sm font-semibold mb-3 ${t.sectionTitle}`}>Services</h3>
                <div className="space-y-2.5">
                  {activeServices.map((service) => {
                    const IconComp = serviceIconMap[service.icon || 'briefcase'] || Briefcase;
                    return (
                      <div key={service.id} className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${t.iconBg}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-xs font-medium ${t.name}`}>{service.name}</p>
                            {service.price && (
                              <span className={`text-xs flex-shrink-0 ${t.subtitle}`}>{service.price}</span>
                            )}
                          </div>
                          {service.description && (
                            <p className={`text-xs mt-0.5 ${t.bio}`}>{service.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Links */}
            {activeLinks.length > 0 && (
              <div className="space-y-2">
                {activeLinks.map((link) => {
                  const IconComp = linkIconMap[link.icon || 'link'] || Link;
                  return (
                    <a
                      key={link.id}
                      href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${t.linkBtn}`}
                    >
                      <IconComp className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium flex-1">{link.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </a>
                  );
                })}
              </div>
            )}

            {/* Gallery */}
            {activeGallery.length > 0 && (
              <div className={`rounded-xl p-4 ${t.sectionBg} border ${t.sectionBorder}`}>
                <h3 className={`text-sm font-semibold mb-3 ${t.sectionTitle}`}>Gallery</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {activeGallery.slice(0, 6).map((item) => (
                    <div key={item.id} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(item.url)}
                        alt={item.caption || ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Hours */}
            {activeHours.length > 0 && (
              <div className={`rounded-xl p-4 ${t.sectionBg} border ${t.sectionBorder}`}>
                <h3 className={`text-sm font-semibold mb-3 flex items-center gap-1.5 ${t.sectionTitle}`}>
                  <Clock className="w-3.5 h-3.5" />
                  Hours
                </h3>
                <div className="space-y-1">
                  {activeHours.map((hour) => (
                    <div key={hour.day} className={`flex justify-between text-xs ${t.bio}`}>
                      <span className="font-medium">{hour.day.slice(0, 3)}</span>
                      <span className={hour.closed ? 'opacity-50' : ''}>
                        {hour.closed ? 'Closed' : `${hour.open} - ${hour.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Powered by Cardova */}
        {!isPro && (
          <p className={`mt-6 text-xs text-center ${t.badge}`}>
            Powered by Cardova
          </p>
        )}
      </div>
    </div>
  );
}
