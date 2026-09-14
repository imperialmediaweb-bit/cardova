import { client } from './client';

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
  icon?: string;
}

export interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface BusinessHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
}

export interface CardData {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  title: string;
  company: string;
  location: string;
  bio: string;
  avatarUrl: string | null;
  theme: 'minimal' | 'bold' | 'glass' | 'neon' | 'sunset' | 'ocean';
  isPublished: boolean;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    website?: string;
    email?: string;
    phone?: string;
  };
  cardType: 'personal' | 'business';
  services: ServiceItem[];
  customLinks: CustomLink[];
  businessHours: BusinessHour[];
  gallery: GalleryItem[];
  customDomain: string | null;
  domainVerified: boolean;
  webhookUrl: string | null;
  webhookEvents: string[];
  leadFormEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export const cardApi = {
  listCards: () => client.get<{ success: boolean; data: CardData[] }>('/card'),

  createCard: (displayName?: string) =>
    client.post<{ success: boolean; data: CardData }>('/card', { displayName }),

  getCard: (cardId: string) =>
    client.get<{ success: boolean; data: CardData }>(`/card/${cardId}`),

  updateCard: (cardId: string, data: Partial<CardData>) =>
    client.put<{ success: boolean; data: CardData }>(`/card/${cardId}`, data),

  deleteCard: (cardId: string) =>
    client.delete<{ success: boolean }>(`/card/${cardId}`),

  verifyDomain: (cardId: string) =>
    client.post<{
      success: boolean;
      data: {
        customDomain: string | null;
        domainVerified: boolean;
        verified: boolean;
        method: 'cname' | 'a' | null;
        detail: string;
        target: string;
        message: string;
      };
    }>(`/card/${cardId}/verify-domain`),

  uploadAvatar: (cardId: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return client.post<{ success: boolean; data: { avatarUrl: string } }>(
      `/card/${cardId}/upload-avatar`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  uploadGalleryImage: (cardId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return client.post<{ success: boolean; data: { url: string } }>(
      `/card/${cardId}/upload-gallery`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  getQRCode: (cardId: string) =>
    client.get(`/card/${cardId}/qr`, { responseType: 'blob' }),

  getVCF: (cardId: string) =>
    client.get(`/card/${cardId}/vcf`, { responseType: 'blob' }),
};
