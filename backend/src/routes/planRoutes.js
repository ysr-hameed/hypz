import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getPlans, getPlan, getUserPlan, updateUserPlan } from '../controllers/planController.js';

const router = express.Router();

// Public routes
router.get('/', getPlans);
router.get('/:planId', getPlan);

// Protected routes
router.use(authenticate);
router.get('/user/current', getUserPlan);
router.put('/user/update', updateUserPlan);

export default router;
