import express from 'express';
import { createStaff, login, register } from '../controllers/authController.js';
import { loginValidator, registerValidator } from '../validators/authValidators.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/staff', protect, authorize('admin'), registerValidator, validate, createStaff);

export default router;
