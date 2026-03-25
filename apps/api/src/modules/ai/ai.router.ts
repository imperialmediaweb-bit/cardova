import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AIController } from './ai.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';
import { proMiddleware } from '../../middleware/pro';

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
router.get('/providers', asyncHandler(AIController.getProviders));
router.post('/generate-bio', aiRateLimit, asyncHandler(AIController.generateBio));
router.post('/improve-bio', aiRateLimit, proMiddleware, asyncHandler(AIController.improveBio));
router.post('/generate-services', aiRateLimit, asyncHandler(AIController.generateServices));
router.post('/generate-business-content', aiRateLimit, asyncHandler(AIController.generateBusinessContent));

export { router as aiRouter };
