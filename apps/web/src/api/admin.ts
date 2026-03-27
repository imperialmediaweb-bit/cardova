import { client } from './client';

export interface AdminStats {
  totalUsers: number;
  proUsers: number;
  totalCards: number;
  totalViews: number;
  totalRevenue: number;
  newUsersLast30: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    isPro: boolean;
    createdAt: string;
  }>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isPro: boolean;
  emailVerified: boolean;
  aiCreditsUsed: number;
  createdAt: string;
  card: { username: string; cardType: string } | null;
}

export interface UsersResponse {
  users: AdminUser[];
  total: number;
  pages: number;
  page: number;
}

export const adminApi = {
  getStats: () =>
    client.get<{ success: boolean; data: AdminStats }>('/admin/stats'),

  listUsers: (page: number = 1, search?: string) =>
    client.get<{ success: boolean; data: UsersResponse }>('/admin/users', {
      params: { page, search },
    }),

  getUser: (userId: string) =>
    client.get<{ success: boolean; data: any }>(`/admin/users/${userId}`),

  updateUser: (userId: string, data: { role?: string; isPro?: boolean }) =>
    client.put<{ success: boolean; data: any }>(`/admin/users/${userId}`, data),

  deleteUser: (userId: string) =>
    client.delete<{ success: boolean; data: { message: string } }>(`/admin/users/${userId}`),
};
