import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProducts,
  getProductStats,
  updateProduct
} from '../controllers/productController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProductValidator, updateProductValidator } from '../validators/productValidators.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getProductStats);
router
  .route('/')
  .get(getProducts)
  .post(createProductValidator, validate, createProduct);
router
  .route('/:id')
  .put(updateProductValidator, validate, updateProduct)
  .delete(authorize('admin'), deleteProduct);

export default router;
