import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createSubscription,
  addPaymentMethod,
  getSubscriptionStatus,
  toggleAutoRenewal,
  getCurrentUsageAndCost,
  payPendingInvoice,
  getPendingInvoices
} from '../controllers/subscriptionController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create/update subscription
router.post('/subscribe', createSubscription);

// Add payment method (for PAYG)
router.post('/payment-method', addPaymentMethod);

// Get subscription status
router.get('/status', getSubscriptionStatus);

// Toggle auto-renewal
router.put('/auto-renew', toggleAutoRenewal);

// Get current usage and estimated cost (PAYG)
router.get('/usage-cost', getCurrentUsageAndCost);

// Get pending invoices
router.get('/pending-invoices', getPendingInvoices);

// Pay pending invoice manually
router.post('/pay-invoice', payPendingInvoice);

export default router;
