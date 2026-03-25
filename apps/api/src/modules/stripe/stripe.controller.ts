import { Request, Response } from 'express';
import { z } from 'zod';
import { StripeService } from './stripe.service';

const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'lifetime']),
});

export class StripeController {
  static async createCheckout(req: Request, res: Response) {
    const { plan } = checkoutSchema.parse(req.body);
    const result = await StripeService.createCheckout(req.user!.userId, plan);
    res.json({ success: true, data: result });
  }

  static async createPortal(req: Request, res: Response) {
    const result = await StripeService.createPortal(req.user!.userId);
    res.json({ success: true, data: result });
  }

  static async webhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing stripe-signature header' });
    }

    await StripeService.handleWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  }
}
