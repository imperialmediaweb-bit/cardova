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

router.get('/', asyncHandler(CardController.getCard));
router.put('/', asyncHandler(CardController.updateCard));
router.post('/upload-avatar', upload.single('avatar'), asyncHandler(CardController.uploadAvatar));
router.get('/qr', asyncHandler(CardController.getQR));
router.get('/vcf', asyncHandler(CardController.getVCF));

export { router as cardRouter };
