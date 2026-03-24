import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.use(asyncHandler(authMiddleware));
router.get('/views', asyncHandler(AnalyticsController.getViews));

export { router as analyticsRouter };
