import { query, transaction } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';
import { createLemonSqueezyCheckout, verifyLemonSqueezyWebhook } from '../services/lemonSqueezyService.js';

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
  const signature = req.headers['x-signature'];
  const payload = JSON.stringify(req.body);

  // Verify webhook signature
  const isValid = verifyLemonSqueezyWebhook(payload, signature);

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  // Safely extract event data with null checks
  const event = req.body?.meta?.event_name;
  const data = req.body?.data;
  
  if (!event || !data) {
    console.error('Invalid webhook payload: missing event or data');
    return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
  }

  if (event === 'order_created' || event === 'subscription_created') {
    const customData = data.attributes.custom_data;
    
    await transaction(async (client) => {
      // Update payment
      await client.query(
        `UPDATE payments 
         SET status = $1, amount = $2, metadata = metadata || $3::jsonb, updated_at = CURRENT_TIMESTAMP
         WHERE transaction_id = $4`,
        [
          'completed',
          data.attributes.total / 100,
          JSON.stringify({ webhookEvent: event, subscriptionId: data.id }),
          data.attributes.order_id
        ]
      );

      // Update user plan if userId is in custom data
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

  res.status(200).json({ success: true });
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
