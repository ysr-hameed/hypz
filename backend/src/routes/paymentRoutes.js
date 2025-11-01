import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createRazorpayPayment,
  verifyRazorpayPayment,
  createLemonSqueezyPayment,
  razorpayWebhook,
  lemonSqueezyWebhook,
  getPaymentHistory
} from '../controllers/paymentController.js';

const router = express.Router();

// Webhook routes (no auth required)
router.post('/webhook/razorpay', razorpayWebhook);
router.post('/webhook/lemonsqueezy', lemonSqueezyWebhook);

// Protected routes
router.use(authenticate);

// Razorpay routes
router.post('/razorpay/create', createRazorpayPayment);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Lemon Squeezy routes
router.post('/lemonsqueezy/create', createLemonSqueezyPayment);

// Payment history
router.get('/history', getPaymentHistory);

export default router;
