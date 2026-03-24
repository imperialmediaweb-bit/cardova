import { client } from './client';

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
  theme: 'minimal' | 'bold' | 'glass';
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

  getQRCode: () =>
    client.get('/card/qr', { responseType: 'blob' }),

  getVCF: () =>
    client.get('/card/vcf', { responseType: 'blob' }),
};
