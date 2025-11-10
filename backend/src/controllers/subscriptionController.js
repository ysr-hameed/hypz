import { query, transaction } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';
import { createLemonSqueezyCheckout } from '../services/lemonSqueezyService.js';
import logger from '../utils/logger.js';

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
  let { planId, variantId, autoRenew = true } = req.body;

  logger.info({ userId, planId, variantId, body: req.body }, 'Create subscription request received');

  // Get plan details
  const planResult = await query('SELECT * FROM plans WHERE id = $1', [planId]);
  
  if (planResult.rows.length === 0) {
    logger.warn({ planId }, 'Plan not found');
    return errorResponse(res, 'Plan not found', 404);
  }

  const plan = planResult.rows[0];
  logger.info({ plan }, 'Plan details retrieved');

  // For free plan, just activate it
  if (plan.type === 'free') {
    await query(
      `UPDATE users SET plan_id = $1, plan_start_date = CURRENT_TIMESTAMP, auto_renew = $2 WHERE id = $3`,
      [planId, autoRenew, userId]
    );
    return successResponse(res, { message: 'Free plan activated' });
  }

  // If no variantId provided, try to get it from the plan's lemonsqueezy_variant_id
  if (!variantId && plan.lemonsqueezy_variant_id) {
    variantId = plan.lemonsqueezy_variant_id;
    logger.info({ variantId, source: 'database' }, 'Using variant ID from plan');
  }

  // If still no variant ID, plan is not purchasable
  if (!variantId) {
    logger.error({ planId, plan }, 'No lemonsqueezy_variant_id found for plan');
    return errorResponse(res, 
      'This plan is not available for purchase yet. Please contact support or try another plan.', 
      400
    );
  }

  // Convert variant ID to integer (LemonSqueezy requires numeric IDs)
  const numericVariantId = parseInt(variantId, 10);
  
  if (isNaN(numericVariantId)) {
    logger.error({ variantId, planId }, 'Invalid variant ID - not a number');
    return errorResponse(res, 'Invalid plan configuration. Please contact support.', 500);
  }

  // Create LemonSqueezy checkout with custom data
  try {
    logger.info({ variantId: numericVariantId, planId, userId }, 'Creating LemonSqueezy checkout');
    
    // LemonSqueezy requires all custom data fields to be strings
    const checkoutData = await createLemonSqueezyCheckout(numericVariantId, {
      userId: String(userId),
      planId: String(planId),
      planType: String(plan.type),
      autoRenew: String(autoRenew),
      email: String(req.user.email)
    });

    logger.info({ checkoutUrl: checkoutData.url }, 'Checkout created successfully');

    // Store pending subscription record
    await query(
      `INSERT INTO subscriptions (user_id, plan_id, status, metadata)
       VALUES ($1, $2, $3, $4)`,
      [userId, planId, 'pending', { checkoutUrl: checkoutData.url }]
    );

    // Also create a pending payment record so webhooks can reconcile it
    try {
      await query(
        `INSERT INTO payments (
          user_id, plan_id, amount, currency, status, payment_method,
          payment_gateway, transaction_id, metadata, invoice_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          userId,
          planId,
          0, // amount will be updated by webhook
          'usd',
          'pending',
          'lemonsqueezy',
          'lemonsqueezy',
          checkoutData.id,
          JSON.stringify({ checkoutId: checkoutData.id, variantId }),
          checkoutData.attributes?.url || checkoutData.url
        ]
      );
    } catch (err) {
      // Don't fail the subscription creation if payment record insert fails; log and continue
      logger.error({ err, userId, planId, checkoutId: checkoutData.id }, 'Failed to create pending payment record');
    }

    successResponse(res, {
      checkoutUrl: checkoutData.url,
      message: 'Redirect to checkout to complete subscription'
    });
  } catch (error) {
    logger.error({ err: error, planId, variantId }, 'Failed to create checkout');
    return errorResponse(res, 
      `Failed to create checkout: ${error.message}. Please verify LemonSqueezy variant ID is valid.`, 
      400
    );
  }
});

// Add payment method for PAYG (setup intent)
export const addPaymentMethod = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { paymentMethodId, type, brand, last4, expMonth, expYear } = req.body;

  // Store payment method - NOTE: Table uses lemon_payment_method_id not payment_method_id
  const result = await query(
    `INSERT INTO payment_methods (user_id, lemon_payment_method_id, type, brand, last4, exp_month, exp_year, is_default)
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
  
  // Get current month's usage with detailed breakdown
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const usageResult = await query(
    `SELECT 
      SUM(storage_bytes) as total_storage,
      SUM(bandwidth_bytes) as total_bandwidth,
      SUM(upload_bytes) as total_upload,
      SUM(download_bytes) as total_download,
      SUM(api_calls) as total_api_calls,
      SUM(upload_calls) as total_upload_calls,
      SUM(download_calls) as total_download_calls,
      SUM(delete_calls) as total_delete_calls,
      SUM(list_calls) as total_list_calls
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

  // If no plan found, return zero usage/cost
  if (!plan) {
    return successResponse(res, {
      usage: {
        storageGB: '0.00',
        bandwidthGB: '0.00',
        uploadGB: '0.00',
        downloadGB: '0.00',
        apiCalls: 0,
        uploadCalls: 0,
        downloadCalls: 0,
        deleteCalls: 0,
        listCalls: 0
      },
      costs: {
        storage: '0.00',
        bandwidth: '0.00',
        metaOps: '0.00',
        accessOps: '0.00',
        total: '0.00'
      },
      plan: {
        name: 'No Plan',
        type: 'free',
        storageLimit: 0,
        bandwidthLimit: 0
      },
      billingPeriod: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
      }
    });
  }

  // Calculate usage in GB
  const storageGB = Number(usage.total_storage || 0) / (1024 ** 3);
  const bandwidthGB = Number(usage.total_bandwidth || 0) / (1024 ** 3);
  const uploadGB = Number(usage.total_upload || 0) / (1024 ** 3);
  const downloadGB = Number(usage.total_download || 0) / (1024 ** 3);
  
  // Calculate costs based on plan type
  let storageCost = 0;
  let bandwidthCost = 0;
  let metaOpsCost = 0; // For upload, delete, list operations
  let accessOpsCost = 0; // For download operations
  
  if (plan.type === 'payg') {
    // PAYG pricing
    storageCost = storageGB * (plan.payg_storage_rate || 0.015);
    bandwidthCost = bandwidthGB * (plan.payg_bandwidth_rate || 0.05);
    
    // Meta operations (upload, delete, list) - typically per 10k requests
    const metaOps = Number(usage.total_upload_calls || 0) + 
                    Number(usage.total_delete_calls || 0) + 
                    Number(usage.total_list_calls || 0);
    metaOpsCost = (metaOps / 10000) * (plan.payg_meta_ops_rate || 0.005);
    
    // Access operations (download) - typically per 1k requests
    const accessOps = Number(usage.total_download_calls || 0);
    accessOpsCost = (accessOps / 1000) * (plan.payg_access_ops_rate || 0.004);
  }
  
  const totalCost = storageCost + bandwidthCost + metaOpsCost + accessOpsCost;

  successResponse(res, {
    usage: {
      storageGB: storageGB.toFixed(2),
      bandwidthGB: bandwidthGB.toFixed(2),
      uploadGB: uploadGB.toFixed(2),
      downloadGB: downloadGB.toFixed(2),
      apiCalls: Number(usage.total_api_calls || 0),
      uploadCalls: Number(usage.total_upload_calls || 0),
      downloadCalls: Number(usage.total_download_calls || 0),
      deleteCalls: Number(usage.total_delete_calls || 0),
      listCalls: Number(usage.total_list_calls || 0)
    },
    costs: {
      storage: storageCost.toFixed(4),
      bandwidth: bandwidthCost.toFixed(4),
      metaOps: metaOpsCost.toFixed(4),
      accessOps: accessOpsCost.toFixed(4),
      total: totalCost.toFixed(2)
    },
    plan: {
      name: plan.name,
      type: plan.type,
      storageLimit: plan.storage_gb,
      bandwidthLimit: plan.bandwidth_gb,
      apiCallsLimit: plan.api_calls,
      freeBandwidthMultiplier: plan.free_bandwidth_multiplier
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
      api_calls,
      total_cost,
      payment_status,
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
