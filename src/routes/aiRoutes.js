import express from 'express';
import multer from 'multer';
import { getInsights, scanProduct } from '../controllers/aiController.js';
import { aiRateLimit } from '../middleware/aiRateLimit.js';
import { protect } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (/^image\/(jpeg|png|webp|heic|heif)$/.test(file.mimetype)) return callback(null, true);
    const error = new Error('Only JPEG, PNG, WebP or HEIC images are allowed');
    error.statusCode = 400;
    return callback(error);
  }
});

const router = express.Router();

router.use(protect, aiRateLimit);

router.post('/scan', upload.single('image'), scanProduct);
router.get('/insights', getInsights);

export default router;
