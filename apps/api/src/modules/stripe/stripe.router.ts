import { Router } from 'express';
import express from 'express';
import { StripeController } from './stripe.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(StripeController.webhook));
router.post('/checkout', asyncHandler(authMiddleware), asyncHandler(StripeController.createCheckout));
router.post('/portal', asyncHandler(authMiddleware), asyncHandler(StripeController.createPortal));

export { router as stripeRouter };
