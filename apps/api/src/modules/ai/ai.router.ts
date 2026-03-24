import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AIController } from './ai.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.userId || req.ip || 'unknown',
  message: { success: false, message: 'Too many requests. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.use(asyncHandler(authMiddleware));
router.post('/generate-bio', aiRateLimit, asyncHandler(AIController.generateBio));

export { router as aiRouter };
