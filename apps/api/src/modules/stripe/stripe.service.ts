import Stripe from 'stripe';
import { stripe } from '../../config/stripe';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';

export class StripeService {
  static async createCheckout(userId: string, plan: 'monthly' | 'lifetime') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const isSubscription = plan === 'monthly';
    const priceId = isSubscription ? env.STRIPE_MONTHLY_PRICE_ID : env.STRIPE_LIFETIME_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.CLIENT_URL}/dashboard?upgraded=true`,
      cancel_url: `${env.CLIENT_URL}/dashboard`,
      metadata: { userId: user.id, plan },
    });

    return { url: session.url };
  }

  static async handleWebhook(payload: Buffer, signature: string) {
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      throw new AppError('Invalid webhook signature', 400);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: { isPro: true },
        });

        await prisma.payment.create({
          data: {
            userId,
            stripeSessionId: session.id,
            amount: session.amount_total || 0,
            type: session.metadata?.plan === 'monthly' ? 'MONTHLY' : 'LIFETIME',
          },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isPro: false },
          });
        }
        break;
      }
    }
  }
}
