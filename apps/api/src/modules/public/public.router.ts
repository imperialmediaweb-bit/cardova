import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { PublicController } from './public.controller';
import { asyncHandler } from '../../middleware/asyncHandler';

const viewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // 100 views per IP per minute
  keyGenerator: (req) => req.ip || 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

const clickLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // generous: a visitor tapping around a card
  keyGenerator: (req) => req.ip || 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

const router = Router();

// Must be declared before '/:username' so "by-domain" is not treated as a username.
router.get('/by-domain/:host', viewLimiter, asyncHandler(PublicController.getCardByDomain));
router.get('/:username', viewLimiter, asyncHandler(PublicController.getCard));
router.post('/:username/click', clickLimiter, asyncHandler(PublicController.trackClick));

export { router as publicRouter };
