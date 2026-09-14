import { client } from './client';

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    client.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    client.post('/auth/login', data),

  logout: () => client.post('/auth/logout'),

  refresh: () => client.post('/auth/refresh'),

  getMe: () => client.get('/auth/me'),

  verifyEmail: (token: string) =>
    client.post(`/auth/verify-email?token=${token}`),

  forgotPassword: (email: string) =>
    client.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    client.post('/auth/reset-password', { token, password }),

  resendVerification: (email: string) =>
    client.post('/auth/resend-verification', { email }),
};
