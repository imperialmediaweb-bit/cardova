import { Router } from 'express';
import { AdminController } from './admin.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';
import { adminMiddleware } from '../../middleware/admin';

const router = Router();

router.use(asyncHandler(authMiddleware));
router.use(asyncHandler(adminMiddleware));

router.get('/stats', asyncHandler(AdminController.getDashboardStats));
router.get('/users', asyncHandler(AdminController.listUsers));
router.get('/users/:userId', asyncHandler(AdminController.getUser));
router.put('/users/:userId', asyncHandler(AdminController.updateUser));
router.delete('/users/:userId', asyncHandler(AdminController.deleteUser));

export { router as adminRouter };
