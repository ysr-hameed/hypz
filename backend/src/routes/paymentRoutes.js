import express from 'express';
import { authenticate, blockApiKeyAccess } from '../middleware/auth.js';
import {
  createLemonSqueezyPayment,
  getPaymentHistory
} from '../controllers/paymentController.js';
import { handleLemonSqueezyWebhook } from '../controllers/lemonSqueezyWebhookController.js';

const router = express.Router();

// Webhook routes (no auth - verified by signature)
// Use raw body parser for webhook so we can verify signature against the exact payload
router.post('/webhook/lemonsqueezy', express.raw({ type: 'application/json' }), handleLemonSqueezyWebhook);

// Authenticated routes - Block API key access (payments must be done via dashboard)
router.use(authenticate);
router.use(blockApiKeyAccess);

// LemonSqueezy routes
router.post('/checkout', createLemonSqueezyPayment);

// Get payment history
router.get('/history', getPaymentHistory);

export default router;
