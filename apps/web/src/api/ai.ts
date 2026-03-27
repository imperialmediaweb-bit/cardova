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

  generateServices: (data: {
    businessName: string;
    industry: string;
    description?: string;
    provider?: AIProvider;
  }) =>
    client.post<{
      success: boolean;
      data: { services: Array<{ name: string; description: string; price: string }>; provider: AIProvider };
    }>('/ai/generate-services', data),

  generateBusinessContent: (data: {
    businessName: string;
    industry: string;
    location?: string;
    provider?: AIProvider;
  }) =>
    client.post<{
      success: boolean;
      data: {
        content: {
          bio: string;
          services: Array<{ name: string; description: string; price: string }>;
          businessHours: Array<{ day: string; open: string; close: string; closed: boolean }>;
          customLinks: Array<{ title: string; url: string; icon: string }>;
        };
        provider: AIProvider;
      };
    }>('/ai/generate-business-content', data),

  importLinkedIn: (data: { linkedinUrl: string; provider?: AIProvider }) =>
    client.post<{ success: boolean; data: { content: any; provider: AIProvider } }>('/ai/import-linkedin', data),
};
