import { Router } from 'express';
import { PublicController } from './public.controller';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

router.get('/:username', asyncHandler(PublicController.getCard));

export { router as publicRouter };
