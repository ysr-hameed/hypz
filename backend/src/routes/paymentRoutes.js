import express from 'express';
import { authenticate, blockApiKeyAccess } from '../middleware/auth.js';
import {
  createStripePayment,
  getPaymentHistory
} from '../controllers/paymentController.js';
import { handleStripeWebhook } from '../controllers/stripeWebhookController.js';

const router = express.Router();

// Webhook routes (no auth - verified by signature)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Authenticated routes - Block API key access (payments must be done via dashboard)
router.use(authenticate);
router.use(blockApiKeyAccess);

// Stripe routes
router.post('/stripe/checkout', createStripePayment);

// Get payment history
router.get('/history', getPaymentHistory);

export default router;
