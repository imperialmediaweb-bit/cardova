import { client } from './client';

export type AIProvider = 'openai' | 'claude' | 'gemini';

export const aiApi = {
  getProviders: () =>
    client.get<{ success: boolean; data: { providers: AIProvider[] } }>('/ai/providers'),

  generateBio: (data: {
    jobTitle: string;
    company: string;
    keywords: string[];
    tone?: 'professional' | 'friendly' | 'creative';
    provider?: AIProvider;
  }) =>
    client.post<{
      success: boolean;
      data: { bio: string; creditsUsed: number; creditsTotal: number | null; provider: AIProvider };
    }>('/ai/generate-bio', data),

  improveBio: (data: { bio: string; provider?: AIProvider }) =>
    client.post<{ success: boolean; data: { bio: string; provider: AIProvider } }>('/ai/improve-bio', data),
};
