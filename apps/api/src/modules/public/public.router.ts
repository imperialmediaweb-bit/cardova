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

const router = Router();

router.get('/:username', viewLimiter, asyncHandler(PublicController.getCard));

export { router as publicRouter };
