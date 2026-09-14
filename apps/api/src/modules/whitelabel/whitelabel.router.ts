import { Router } from 'express';
import { WhiteLabelController } from './whitelabel.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
router.use(asyncHandler(authMiddleware));

router.get('/', asyncHandler(WhiteLabelController.getAll));
router.post('/', asyncHandler(WhiteLabelController.create));
router.put('/:id', asyncHandler(WhiteLabelController.update));
router.delete('/:id', asyncHandler(WhiteLabelController.delete));

export { router as whiteLabelRouter };
