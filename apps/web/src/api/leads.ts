import { client } from './client';

export interface Lead {
  id: string;
  cardId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const leadsApi = {
  getLeads: (page?: number) =>
    client.get<{ success: boolean; data: { leads: Lead[]; total: number; unread: number; pages: number; page: number } }>('/leads', { params: { page } }),
  getStats: () =>
    client.get<{ success: boolean; data: { total: number; unread: number; last30: number } }>('/leads/stats'),
  markRead: (leadId: string) =>
    client.put<{ success: boolean }>(`/leads/${leadId}/read`),
  markAllRead: () =>
    client.put<{ success: boolean }>('/leads/mark-all-read'),
  deleteLead: (leadId: string) =>
    client.delete<{ success: boolean }>(`/leads/${leadId}`),
  submitLead: (username: string, data: { name: string; email: string; phone?: string; message?: string }) =>
    client.post<{ success: boolean }>(`/leads/public/${username}`, data),
};
