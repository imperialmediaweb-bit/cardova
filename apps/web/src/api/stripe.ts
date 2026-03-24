import { client } from './client';

export const stripeApi = {
  createCheckout: (plan: 'monthly' | 'lifetime') =>
    client.post<{ success: boolean; data: { url: string } }>('/stripe/checkout', { plan }),
};
