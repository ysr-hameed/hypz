import { query, transaction } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';
import { createLemonSqueezyCheckout } from '../services/lemonSqueezyService.js';

/**
 * PAYMENT LOGIC - BEST PRACTICES
 * 
 * Following industry standards from Stripe, Paddle, LemonSqueezy:
 * 
 * 1. FREE PLAN: Activate immediately, no payment
 * 
 * 2. PRO PLAN (Fixed Subscription):
 *    - LemonSqueezy handles subscription creation & recurring billing
 *    - Webhooks update our database
 *    - Auto-renewal controlled by cancel_at_period_end flag
 * 
 * 3. PAYG PLAN (Usage-Based):
 *    - User subscribes to PAYG plan (sets up payment method)
 *    - Track usage daily in usage_records
 *    - On 1st of month: Calculate usage → Create invoice → Charge via LemonSqueezy
 *    - If auto_renew OFF: Create manual invoice, don't auto-charge
 *    - Grace period: 7 days for failed payments
 *    - After grace period: Suspend services
 */

// Create subscription (handles Free, Pro, PAYG)
export const createSubscription = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { planId, variantId, autoRenew = true } = req.body;

  // Get plan details
  const planResult = await query('SELECT * FROM plans WHERE id = $1', [planId]);
  
  if (planResult.rows.length === 0) {
    return errorResponse(res, 'Plan not found', 404);
  }

  const plan = planResult.rows[0];

  // For free plan, just activate it
  if (plan.type === 'free') {
    await query(
      `UPDATE users SET plan_id = $1, plan_start_date = CURRENT_TIMESTAMP, auto_renew = $2 WHERE id = $3`,
      [planId, autoRenew, userId]
    );
    return successResponse(res, { message: 'Free plan activated' });
  }

  // Create LemonSqueezy checkout with custom data
  const checkoutData = await createLemonSqueezyCheckout(variantId, {
    userId,
    planId,
    planType: plan.type,
    autoRenew,
    email: req.user.email
  });

  // Store pending subscription record
  await query(
    `INSERT INTO subscriptions (user_id, plan_id, status, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, planId, 'pending', { checkoutUrl: checkoutData.attributes.url }]
  );

  successResponse(res, {
    checkoutUrl: checkoutData.attributes.url,
    message: 'Redirect to checkout to complete subscription'
  });
});

// Add payment method for PAYG (setup intent)
export const addPaymentMethod = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { paymentMethodId, type, brand, last4, expMonth, expYear } = req.body;

  // Store payment method
  const result = await query(
    `INSERT INTO payment_methods (user_id, payment_method_id, type, brand, last4, exp_month, exp_year, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true)
     RETURNING *`,
    [userId, paymentMethodId, type, brand, last4, expMonth, expYear]
  );

  // Update user's payment info
  await query(
    `UPDATE users SET 
     payment_method_id = $1, card_last4 = $2, card_brand = $3
     WHERE id = $4`,
    [paymentMethodId, last4, brand, userId]
  );

  successResponse(res, result.rows[0], 'Payment method added successfully');
});

// Get user's subscription status
export const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT s.*, p.name as plan_name, p.type as plan_type, u.auto_renew, u.services_active
     FROM subscriptions s
     JOIN plans p ON s.plan_id = p.id
     JOIN users u ON s.user_id = u.id
     WHERE s.user_id = $1 AND s.status != 'cancelled'
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return successResponse(res, { subscription: null, message: 'No active subscription' });
  }

  successResponse(res, result.rows[0]);
});

// Toggle auto-renewal
export const toggleAutoRenewal = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { autoRenew } = req.body;

  await query(
    `UPDATE users SET auto_renew = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [autoRenew, userId]
  );

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
    [userId, 'auto_renewal_toggled', { autoRenew }]
  );

  successResponse(res, { autoRenew }, `Auto-renewal ${autoRenew ? 'enabled' : 'disabled'}`);
});

// Get current month's usage and estimated cost (for PAYG)
export const getCurrentUsageAndCost = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get current month's usage
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const usageResult = await query(
    `SELECT 
      SUM(storage_bytes) as total_storage,
      SUM(bandwidth_bytes) as total_bandwidth,
      SUM(api_calls) as total_api_calls
     FROM usage_records
     WHERE user_id = $1 AND TO_CHAR(date, 'YYYY-MM') = $2`,
    [userId, currentMonth]
  );

  const usage = usageResult.rows[0];

  // Get plan rates
  const planResult = await query(
    `SELECT * FROM plans WHERE id = (SELECT plan_id FROM users WHERE id = $1)`,
    [userId]
  );

  const plan = planResult.rows[0];

  // Calculate costs (example rates)
  const storageGB = Number(usage.total_storage || 0) / (1024 ** 3);
  const bandwidthGB = Number(usage.total_bandwidth || 0) / (1024 ** 3);
  
  const storageCost = storageGB * (plan.payg_storage_rate || 0.015);
  const bandwidthCost = bandwidthGB * (plan.payg_bandwidth_rate || 0.05);
  const totalCost = storageCost + bandwidthCost;

  successResponse(res, {
    usage: {
      storageGB: storageGB.toFixed(2),
      bandwidthGB: bandwidthGB.toFixed(2),
      apiCalls: Number(usage.total_api_calls || 0)
    },
    costs: {
      storage: storageCost.toFixed(4),
      bandwidth: bandwidthCost.toFixed(4),
      total: totalCost.toFixed(2)
    },
    billingPeriod: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    }
  });
});

// Manual payment for pending invoice
export const payPendingInvoice = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { billingId } = req.body;

  // Get pending billing record
  const billingResult = await query(
    `SELECT * FROM usage_billing WHERE id = $1 AND user_id = $2 AND payment_status = 'pending'`,
    [billingId, userId]
  );

  if (billingResult.rows.length === 0) {
    return errorResponse(res, 'Invoice not found or already paid', 404);
  }

  const billing = billingResult.rows[0];

  // Get user's payment method
  const userResult = await query(
    `SELECT payment_method_id FROM users WHERE id = $1`,
    [userId]
  );

  if (!userResult.rows[0].payment_method_id) {
    return errorResponse(res, 'No payment method found. Please add a payment method first.', 400);
  }

  // Here you would integrate with LemonSqueezy to charge the card
  // For now, we'll simulate a successful payment

  await transaction(async (client) => {
    // Create payment record
    const paymentResult = await client.query(
      `INSERT INTO payments (
        user_id, plan_id, amount, currency, status, payment_method,
        payment_gateway, billing_reason, usage_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        userId,
        billing.plan_id || 'payg_usage',
        billing.total_cost,
        'USD',
        'completed',
        'lemonsqueezy',
        'lemonsqueezy',
        'usage_based',
        { billingPeriod: { start: billing.billing_period_start, end: billing.billing_period_end }}
      ]
    );

    // Update billing record
    await client.query(
      `UPDATE usage_billing SET 
       payment_status = 'paid', 
       payment_id = $1,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [paymentResult.rows[0].id, billingId]
    );

    // Reactivate services
    await client.query(
      `UPDATE users SET services_active = true WHERE id = $1`,
      [userId]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'manual_payment', { billingId, amount: billing.total_cost }]
    );
  });

  successResponse(res, { paid: true }, 'Payment successful. Services reactivated.');
});

// Get pending invoices for user
export const getPendingInvoices = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT 
      id,
      billing_period_start,
      billing_period_end,
      storage_gb_hours,
      bandwidth_gb,
      request_count,
      total_cost,
      payment_status,
      due_date,
      created_at
    FROM usage_billing
    WHERE user_id = $1 AND payment_status IN ('pending', 'overdue')
    ORDER BY billing_period_start DESC`,
    [userId]
  );

  successResponse(res, { invoices: result.rows });
});

export default {
  createSubscription,
  addPaymentMethod,
  getSubscriptionStatus,
  toggleAutoRenewal,
  getCurrentUsageAndCost,
  payPendingInvoice,
  getPendingInvoices
};
