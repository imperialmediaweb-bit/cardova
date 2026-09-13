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
  getLeads: (page?: number, cardId?: string) =>
    client.get<{ success: boolean; data: { leads: Lead[]; total: number; unread: number; pages: number; page: number } }>('/leads', { params: { page, cardId } }),
  getStats: (cardId?: string) =>
    client.get<{ success: boolean; data: { total: number; unread: number; last30: number } }>('/leads/stats', { params: { cardId } }),
  markRead: (leadId: string, cardId?: string) =>
    client.put<{ success: boolean }>(`/leads/${leadId}/read`, undefined, { params: { cardId } }),
  markAllRead: (cardId?: string) =>
    client.put<{ success: boolean }>('/leads/mark-all-read', undefined, { params: { cardId } }),
  deleteLead: (leadId: string, cardId?: string) =>
    client.delete<{ success: boolean }>(`/leads/${leadId}`, { params: { cardId } }),
  submitLead: (username: string, data: { name: string; email: string; phone?: string; message?: string }) =>
    client.post<{ success: boolean }>(`/leads/public/${username}`, data),
};
