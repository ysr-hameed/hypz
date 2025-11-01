import { query, transaction } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';
import { createRazorpayOrder, verifyRazorpaySignature, verifyRazorpayWebhook } from '../services/razorpayService.js';
import { createLemonSqueezyCheckout, verifyLemonSqueezyWebhook } from '../services/lemonSqueezyService.js';

// Create payment order (Razorpay for India)
export const createRazorpayPayment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { amount, planId, currency = 'INR' } = req.body;

  // Get plan details
  const planResult = await query('SELECT * FROM plans WHERE id = $1', [planId]);
  
  if (planResult.rows.length === 0) {
    return errorResponse(res, 'Plan not found', 404);
  }

  const plan = planResult.rows[0];

  // Create Razorpay order
  const receipt = `rcpt_${Date.now()}_${userId.substring(0, 8)}`;
  const order = await createRazorpayOrder(amount, currency, receipt, {
    userId,
    planId,
    planName: plan.name
  });

  // Store payment record
  const paymentResult = await query(
    `INSERT INTO payments (
      user_id, plan_id, amount, currency, status, payment_method,
      payment_gateway, transaction_id, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      userId,
      planId,
      amount,
      currency,
      'pending',
      'razorpay',
      'razorpay',
      order.id,
      { orderId: order.id, receipt }
    ]
  );

  successResponse(res, {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    payment: paymentResult.rows[0]
  });
});

// Verify Razorpay payment
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { orderId, paymentId, signature, planId } = req.body;

  // Verify signature
  const isValid = verifyRazorpaySignature(orderId, paymentId, signature);

  if (!isValid) {
    return errorResponse(res, 'Invalid payment signature', 400);
  }

  await transaction(async (client) => {
    // Update payment status
    await client.query(
      `UPDATE payments 
       SET status = $1, transaction_id = $2, metadata = metadata || $3::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE transaction_id = $4 AND user_id = $5`,
      ['completed', paymentId, JSON.stringify({ paymentId, verified: true }), orderId, userId]
    );

    // Update user's plan
    await client.query(
      `UPDATE users 
       SET plan_id = $1, plan_start_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [planId, userId]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'payment_completed', { orderId, paymentId, planId, gateway: 'razorpay' }]
    );
  });

  successResponse(res, { verified: true }, 'Payment verified successfully');
});

// Create Lemon Squeezy checkout (for international)
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

// Razorpay webhook
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const payload = JSON.stringify(req.body);

  // Verify webhook signature
  const isValid = verifyRazorpayWebhook(payload, signature);

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const event = req.body.event;
  const paymentData = req.body.payload.payment.entity;

  if (event === 'payment.captured') {
    // Update payment status
    await query(
      `UPDATE payments 
       SET status = $1, metadata = metadata || $2::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE transaction_id = $3`,
      ['completed', JSON.stringify({ webhookEvent: event, webhookData: paymentData }), paymentData.order_id]
    );
  }

  res.status(200).json({ success: true });
});

// Lemon Squeezy webhook
export const lemonSqueezyWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-signature'];
  const payload = JSON.stringify(req.body);

  // Verify webhook signature
  const isValid = verifyLemonSqueezyWebhook(payload, signature);

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const event = req.body.meta.event_name;
  const data = req.body.data;

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
  createRazorpayPayment,
  verifyRazorpayPayment,
  createLemonSqueezyPayment,
  razorpayWebhook,
  lemonSqueezyWebhook,
  getPaymentHistory
};
