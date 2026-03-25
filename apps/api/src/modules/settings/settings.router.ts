import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.use(asyncHandler(authMiddleware));

router.put('/profile', asyncHandler(SettingsController.updateProfile));
router.put('/password', asyncHandler(SettingsController.changePassword));
router.delete('/account', asyncHandler(SettingsController.deleteAccount));
router.get('/sessions', asyncHandler(SettingsController.getSessions));
router.delete('/sessions', asyncHandler(SettingsController.revokeAllSessions));

export { router as settingsRouter };
