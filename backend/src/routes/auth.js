import express from 'express';
import { register, login, getProfile, regenerateApiKey } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/limiter.js';
import { validate, registerSchema, loginSchema } from '../utils/validator.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.post('/regenerate-api-key', authenticate, regenerateApiKey);

export default router;
