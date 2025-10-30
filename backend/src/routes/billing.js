import express from 'express';
import {
  getPlans,
  createOrder,
  verifyPayment,
  getBillingHistory,
  getBillingStats,
} from '../controllers/billingController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate, updatePlanSchema } from '../utils/validator.js';
import { checkApiCallLimit } from '../middlewares/planCheck.js';

const router = express.Router();

// Get available plans
router.get('/plans', getPlans);

// Create payment order (protected)
router.post('/create-order', authenticate, checkApiCallLimit, validate(updatePlanSchema), createOrder);

// Verify payment (protected)
router.post('/verify-payment', authenticate, verifyPayment);

// Get billing history (protected)
router.get('/history', authenticate, checkApiCallLimit, getBillingHistory);

// Get billing statistics (protected)
router.get('/stats', authenticate, checkApiCallLimit, getBillingStats);

export default router;
