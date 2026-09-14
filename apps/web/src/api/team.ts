import { client } from './client';

export const teamApi = {
  getTeam: () => client.get<{ success: boolean; data: any }>('/team'),
  createTeam: (name: string) => client.post<{ success: boolean; data: any }>('/team', { name }),
  updateTeam: (data: { name?: string }) => client.put<{ success: boolean; data: any }>('/team', data),
  deleteTeam: () => client.delete<{ success: boolean }>('/team'),
  inviteMember: (email: string) => client.post<{ success: boolean }>('/team/invite', { email }),
  removeMember: (memberId: string) => client.delete<{ success: boolean }>(`/team/members/${memberId}`),
};
