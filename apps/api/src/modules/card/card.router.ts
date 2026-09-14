import { Router } from 'express';
import multer from 'multer';
import { CardController } from './card.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authMiddleware } from '../../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = Router();

router.use(asyncHandler(authMiddleware));

// Collection routes
router.get('/', asyncHandler(CardController.listCards));
router.post('/', asyncHandler(CardController.createCard));

// Per-card routes
router.get('/:cardId', asyncHandler(CardController.getCard));
router.put('/:cardId', asyncHandler(CardController.updateCard));
router.delete('/:cardId', asyncHandler(CardController.deleteCard));
router.post('/:cardId/upload-avatar', upload.single('avatar'), asyncHandler(CardController.uploadAvatar));
router.post('/:cardId/upload-gallery', upload.single('image'), asyncHandler(CardController.uploadGalleryImage));
router.get('/:cardId/qr', asyncHandler(CardController.getQR));
router.get('/:cardId/vcf', asyncHandler(CardController.getVCF));
router.post('/:cardId/verify-domain', asyncHandler(CardController.verifyDomain));

export { router as cardRouter };
