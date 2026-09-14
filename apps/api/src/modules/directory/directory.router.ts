import { Router } from 'express';
import { DirectoryController } from './directory.controller';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

router.get('/search', asyncHandler(DirectoryController.search));

export { router as directoryRouter };
