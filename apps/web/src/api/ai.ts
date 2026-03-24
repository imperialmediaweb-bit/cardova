import { client } from './client';

export const aiApi = {
  generateBio: (data: { jobTitle: string; company: string; keywords: string[] }) =>
    client.post<{ success: boolean; data: { bio: string } }>('/ai/generate-bio', data),
};
