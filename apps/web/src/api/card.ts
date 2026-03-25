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
  createdAt: string;
  updatedAt: string;
}

export const cardApi = {
  getCard: () => client.get<{ success: boolean; data: CardData }>('/card'),

  updateCard: (data: Partial<CardData>) =>
    client.put<{ success: boolean; data: CardData }>('/card', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return client.post<{ success: boolean; data: { avatarUrl: string } }>(
      '/card/upload-avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  uploadGalleryImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return client.post<{ success: boolean; data: { url: string } }>(
      '/card/upload-gallery',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  getQRCode: () =>
    client.get('/card/qr', { responseType: 'blob' }),

  getVCF: () =>
    client.get('/card/vcf', { responseType: 'blob' }),
};
