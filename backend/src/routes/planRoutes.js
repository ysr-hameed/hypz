import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getPlans, getPlan, getUserPlan, updateUserPlan } from '../controllers/planController.js';

const router = express.Router();

// Public routes
router.get('/', getPlans);

// Protected routes (must come before /:planId to avoid conflict)
router.get('/user/current', authenticate, getUserPlan);
router.put('/user/update', authenticate, updateUserPlan);

// Public route for specific plan (must come after /user/* routes)
router.get('/:planId', getPlan);

export default router;
