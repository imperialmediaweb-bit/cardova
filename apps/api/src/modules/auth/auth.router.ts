import { Router } from 'express';
import { AuthController } from './auth.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.post('/register', asyncHandler(AuthController.register));
router.post('/verify-email', asyncHandler(AuthController.verifyEmail));
router.post('/login', asyncHandler(AuthController.login));
router.post('/refresh', asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));
router.post('/resend-verification', asyncHandler(AuthController.resendVerification));
router.post('/forgot-password', asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', asyncHandler(AuthController.resetPassword));
router.get('/me', asyncHandler(authMiddleware), asyncHandler(AuthController.me));

export { router as authRouter };
