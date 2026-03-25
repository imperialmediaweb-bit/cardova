import { Router } from 'express';
import { TeamController } from './team.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
router.use(asyncHandler(authMiddleware));

router.get('/', asyncHandler(TeamController.getTeam));
router.post('/', asyncHandler(TeamController.createTeam));
router.put('/', asyncHandler(TeamController.updateTeam));
router.delete('/', asyncHandler(TeamController.deleteTeam));
router.post('/invite', asyncHandler(TeamController.inviteMember));
router.delete('/members/:memberId', asyncHandler(TeamController.removeMember));

export { router as teamRouter };
