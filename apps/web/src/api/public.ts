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
}

export const publicApi = {
  getCard: (username: string) =>
    client.get<{ success: boolean; data: PublicCardData }>(`/public/${username}`),
};
