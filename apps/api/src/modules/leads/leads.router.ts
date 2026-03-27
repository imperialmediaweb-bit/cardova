import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { LeadsController } from './leads.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const leadSubmitLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
});

const router = Router();

// Public endpoint - submit lead
router.post('/public/:username', leadSubmitLimit, asyncHandler(LeadsController.submitLead));

// Authenticated endpoints
router.use(asyncHandler(authMiddleware));
router.get('/', asyncHandler(LeadsController.getLeads));
router.get('/stats', asyncHandler(LeadsController.getStats));
router.put('/:leadId/read', asyncHandler(LeadsController.markRead));
router.put('/mark-all-read', asyncHandler(LeadsController.markAllRead));
router.delete('/:leadId', asyncHandler(LeadsController.deleteLead));

export { router as leadsRouter };
