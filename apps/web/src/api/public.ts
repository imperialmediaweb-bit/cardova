import { client } from './client';
import type { ServiceItem, CustomLink, BusinessHour, GalleryItem } from './card';

export interface PublicCardData {
  username: string;
  displayName: string;
  title: string;
  company: string;
  location: string;
  bio: string;
  avatarUrl: string | null;
  theme: 'minimal' | 'bold' | 'glass' | 'neon' | 'sunset' | 'ocean';
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    website?: string;
    email?: string;
    phone?: string;
  };
  leadFormEnabled: boolean;
  isPro: boolean;
  cardType: 'personal' | 'business';
  services: ServiceItem[];
  customLinks: CustomLink[];
  businessHours: BusinessHour[];
  gallery: GalleryItem[];
  /** Verified custom domain the card is also served on, if any. */
  customDomain: string | null;
}

export type ClickType =
  | 'twitter' | 'linkedin' | 'github' | 'instagram' | 'website' | 'email' | 'phone'
  | 'custom_link' | 'contact' | 'vcard' | 'share';

export const publicApi = {
  /** `src` marks how the visitor arrived (e.g. "qr") so analytics can separate QR scans. */
  getCard: (username: string, src?: string | null) =>
    client.get<{ success: boolean; data: PublicCardData }>(`/public/${username}`, {
      params: src ? { src } : undefined,
    }),

  getCardByDomain: (host: string) =>
    client.get<{ success: boolean; data: PublicCardData }>(`/public/by-domain/${encodeURIComponent(host)}`),

  /** Fire-and-forget click tracking; never blocks the visitor's navigation. */
  trackClick: (username: string, type: ClickType, target = '') => {
    client.post(`/public/${username}/click`, { type, target }).catch(() => {});
  },
};
