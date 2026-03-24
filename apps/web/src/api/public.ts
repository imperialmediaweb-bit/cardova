import { client } from './client';

export interface PublicCardData {
  username: string;
  displayName: string;
  title: string;
  company: string;
  location: string;
  bio: string;
  avatarUrl: string | null;
  theme: 'minimal' | 'bold' | 'glass';
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    website?: string;
    email?: string;
    phone?: string;
  };
  isPro: boolean;
}

export const publicApi = {
  getCard: (username: string) =>
    client.get<{ success: boolean; data: PublicCardData }>(`/public/${username}`),
};
