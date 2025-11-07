import { query, transaction } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';
import { createLemonSqueezyCheckout, verifyLemonSqueezyWebhook } from '../services/lemonSqueezyService.js';
import logger from '../utils/logger.js';

// Create Lemon Squeezy checkout
export const createLemonSqueezyPayment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { variantId, planId } = req.body;

  // Get user details
  const userResult = await query(
    'SELECT email, first_name, last_name FROM users WHERE id = $1',
    [userId]
  );

  const user = userResult.rows[0];

  // Create checkout
  const checkout = await createLemonSqueezyCheckout(variantId, {
    userId,
    planId,
    userEmail: user.email,
    userName: `${user.first_name} ${user.last_name}`
  });

  // Store payment record
  await query(
    `INSERT INTO payments (
      user_id, plan_id, amount, currency, status, payment_method,
      payment_gateway, transaction_id, metadata, invoice_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      userId,
      planId,
      0, // Amount will be updated via webhook
      'USD',
      'pending',
      'lemonsqueezy',
      'lemonsqueezy',
      checkout.id,
      { checkoutId: checkout.id },
      checkout.attributes.url
    ]
  );

  successResponse(res, {
    checkoutUrl: checkout.attributes.url,
    checkoutId: checkout.id
  });
});

// Lemon Squeezy webhook (handled by webhookController.js now)
export const lemonSqueezyWebhook = asyncHandler(async (req, res) => {
  const rawSignature = req.headers['x-signature'] || req.headers['x-lemonsqueezy-signature'] || req.headers['x-ls-signature'];
  const payload = JSON.stringify(req.body || {});

  // Validate presence
  if (!rawSignature) {
    logger.warn({ headers: Object.keys(req.headers) }, 'Missing signature header on LemonSqueezy webhook');
    return errorResponse(res, 'Missing signature', 400);
  }

  // Verify webhook signature using timing-safe comparison in service
  const isValid = verifyLemonSqueezyWebhook(payload, String(rawSignature));
  if (!isValid) {
    logger.warn('Invalid LemonSqueezy webhook signature');
    return errorResponse(res, 'Invalid signature', 400);
  }

  // Safely extract event data with null checks
  const event = req.body?.meta?.event_name || req.body?.type || req.body?.event;
  const data = req.body?.data || req.body?.attributes;

  if (!event || !data) {
    logger.error({ body: req.body }, 'Invalid webhook payload: missing event or data');
    return errorResponse(res, 'Invalid webhook payload', 400);
  }

  // Only process idempotent events and skip if already processed
  if (event === 'order_created' || event === 'subscription_created') {
    const orderId = data.attributes?.order_id || data.order_id || data.id;
    const totalCents = data.attributes?.total ?? data.total ?? null;
    const amount = totalCents !== null ? Number(totalCents) / 100 : null;
    const customData = data.attributes?.custom_data || data.custom_data || {};

    if (!orderId) {
      logger.error({ data }, 'Webhook missing order id');
      return errorResponse(res, 'Webhook missing order id', 400);
    }

    // Idempotency: check if payment record already marked completed
    const existing = await query('SELECT id, status FROM payments WHERE transaction_id = $1', [orderId]);
    if (existing.rows.length > 0 && existing.rows[0].status === 'completed') {
      logger.info({ orderId }, 'Webhook already processed for order');
      return successResponse(res, null, 'Already processed', 200);
    }

    await transaction(async (client) => {
      // Update payment record if present, otherwise insert a record
      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE payments 
           SET status = $1, amount = $2, metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb, updated_at = CURRENT_TIMESTAMP
           WHERE transaction_id = $4`,
          [
            'completed',
            amount,
            JSON.stringify({ webhookEvent: event, subscriptionId: data.id, customData }),
            orderId
          ]
        );
      } else {
        await client.query(
          `INSERT INTO payments (
            user_id, plan_id, amount, currency, status, payment_method,
            payment_gateway, transaction_id, metadata, invoice_url, created_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CURRENT_TIMESTAMP)` ,
          [
            customData.userId || null,
            customData.planId || null,
            amount,
            'USD',
            'completed',
            'lemonsqueezy',
            'lemonsqueezy',
            orderId,
            JSON.stringify({ webhookEvent: event, subscriptionId: data.id, customData }),
            null
          ]
        );
      }

      // Update user plan if userId and planId provided in custom data
      if (customData && customData.userId && customData.planId) {
        await client.query(
          `UPDATE users 
           SET plan_id = $1, plan_start_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [customData.planId, customData.userId]
        );
      }
    });
  }

  return successResponse(res, null, 'Webhook processed', 200);
});

// Get payment history
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT p.*, pl.name as plan_name
     FROM payments p
     LEFT JOIN plans pl ON p.plan_id = pl.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const countResult = await query(
    'SELECT COUNT(*) FROM payments WHERE user_id = $1',
    [userId]
  );

  successResponse(res, {
    payments: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    }
  });
});

export default {
  createLemonSqueezyPayment,
  lemonSqueezyWebhook,
  getPaymentHistory
};
