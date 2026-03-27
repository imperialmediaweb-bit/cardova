import { client } from './client';

export const settingsApi = {
  updateProfile: (data: { name?: string; email?: string }) =>
    client.put<{ success: boolean; data: any }>('/settings/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    client.put<{ success: boolean; data: { message: string } }>('/settings/password', data),

  deleteAccount: (password: string) =>
    client.delete<{ success: boolean; data: { message: string } }>('/settings/account', {
      data: { password },
    }),

  getSessions: () =>
    client.get<{ success: boolean; data: Array<{ id: string; createdAt: string; expiresAt: string }> }>('/settings/sessions'),

  revokeAllSessions: () =>
    client.delete<{ success: boolean; data: { message: string } }>('/settings/sessions'),
};
