import { client } from './client';

export const aiApi = {
  generateBio: (data: {
    jobTitle: string;
    company: string;
    keywords: string[];
    tone?: 'professional' | 'friendly' | 'creative';
  }) =>
    client.post<{
      success: boolean;
      data: { bio: string; creditsUsed: number; creditsTotal: number | null };
    }>('/ai/generate-bio', data),

  improveBio: (data: { bio: string }) =>
    client.post<{ success: boolean; data: { bio: string } }>('/ai/improve-bio', data),
};
