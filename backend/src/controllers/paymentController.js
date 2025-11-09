import { query, transaction } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';
import { createStripeCheckoutSession } from '../services/stripeService.js';
import logger from '../utils/logger.js';

// Create Stripe checkout session
export const createStripePayment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { priceId, planId } = req.body;

  // Get user details
  const userResult = await query(
    'SELECT email, first_name, last_name FROM users WHERE id = $1',
    [userId]
  );

  const user = userResult.rows[0];

  // Create checkout session
  const session = await createStripeCheckoutSession(priceId, {
    userId,
    planId,
    userEmail: user.email,
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
      'usd',
      'pending',
      'stripe',
      'stripe',
      session.id,
      { sessionId: session.id, subscriptionId: session.subscription },
      session.url
    ]
  );

  successResponse(res, {
    sessionId: session.id,
    url: session.url
  });
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
  createStripePayment,
  getPaymentHistory
};
