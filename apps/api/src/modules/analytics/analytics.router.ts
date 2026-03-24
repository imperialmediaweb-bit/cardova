import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';
import { proMiddleware } from '../../middleware/pro';

const router = Router();

router.use(asyncHandler(authMiddleware));
router.use(proMiddleware);
router.get('/views', asyncHandler(AnalyticsController.getViews));

export { router as analyticsRouter };
