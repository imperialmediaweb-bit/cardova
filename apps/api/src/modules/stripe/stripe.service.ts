import Stripe from 'stripe';
import { stripe } from '../../config/stripe';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { sendProUpgradeEmail } from '../../utils/email';

export class StripeService {
  static async createCheckout(userId: string, plan: 'monthly' | 'lifetime') {
    if (!stripe) throw new AppError('Stripe is not configured', 503);
    if (!env.STRIPE_MONTHLY_PRICE_ID || !env.STRIPE_LIFETIME_PRICE_ID) {
      throw new AppError('Stripe price IDs not configured', 503);
    }

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

  static async createPortal(userId: string) {
    if (!stripe) throw new AppError('Stripe is not configured', 503);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    if (!user.stripeCustomerId) throw new AppError('No billing account found', 400);

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.CLIENT_URL}/billing`,
    });

    return { url: session.url };
  }

  static async handleWebhook(payload: Buffer, signature: string) {
    if (!stripe) throw new AppError('Stripe is not configured', 503);
    if (!env.STRIPE_WEBHOOK_SECRET) throw new AppError('Stripe webhook secret not configured', 503);

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

        const updatedUser = await prisma.user.update({
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

        // Send pro upgrade email (fire and forget)
        sendProUpgradeEmail(updatedUser.email, updatedUser.name).catch(() => {});
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const failedCustomerId = invoice.customer as string;

        const failedUser = await prisma.user.findFirst({
          where: { stripeCustomerId: failedCustomerId },
        });

        if (failedUser) {
          // Log the failure; in production, send a notification email
          console.error(`Payment failed for user ${failedUser.id} (${failedUser.email})`);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const updatedSub = event.data.object as Stripe.Subscription;
        const updatedCustomerId = updatedSub.customer as string;

        const subUser = await prisma.user.findFirst({
          where: { stripeCustomerId: updatedCustomerId },
        });

        if (subUser) {
          const isActive = updatedSub.status === 'active' || updatedSub.status === 'trialing';
          await prisma.user.update({
            where: { id: subUser.id },
            data: { isPro: isActive },
          });
        }
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
