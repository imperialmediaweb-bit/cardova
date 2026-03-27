import Stripe from 'stripe';
import { env } from './env';

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  : null;

if (!stripe) {
  console.warn('⚠️  STRIPE_SECRET_KEY not set — Stripe disabled');
}
