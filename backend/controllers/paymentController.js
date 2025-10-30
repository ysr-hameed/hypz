import Razorpay from 'razorpay';
import pool from '../config/database.js';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get all plans
export const getPlans = async (request, reply) => {
  try {
    const result = await pool.query(
      'SELECT * FROM plans WHERE is_active = true ORDER BY price ASC'
    );

    reply.send({
      success: true,
      plans: result.rows
    });
  } catch (error) {
    console.error('Get plans error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch plans'
    });
  }
};

// Create Razorpay order
export const createOrder = async (request, reply) => {
  const { planId, customAmount } = request.body;
  const userId = request.user.userId;

  try {
    let amount;
    let planDetails;

    if (planId) {
      const result = await pool.query(
        'SELECT * FROM plans WHERE id = $1 AND is_active = true',
        [planId]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({
          success: false,
          message: 'Plan not found'
        });
      }

      planDetails = result.rows[0];
      amount = planDetails.price * 100; // Convert to paise
    } else if (customAmount) {
      amount = customAmount * 100; // For pay-as-you-go
      planDetails = await pool.query('SELECT * FROM plans WHERE name = $1', ['Pay As You Go']);
      planDetails = planDetails.rows[0];
    } else {
      return reply.status(400).send({
        success: false,
        message: 'Plan ID or custom amount is required'
      });
    }

    if (amount === 0) {
      // Free plan - just update user
      await pool.query('UPDATE users SET plan_id = $1 WHERE id = $2', [planId, userId]);

      return reply.send({
        success: true,
        message: 'Plan activated successfully',
        isFree: true
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId,
        planId: planDetails.id,
      },
    });

    // Store transaction
    await pool.query(
      `INSERT INTO transactions (user_id, razorpay_order_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, order.id, amount / 100, 'INR', 'pending']
    );

    reply.send({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// Verify payment
export const verifyPayment = async (request, reply) => {
  const { orderId, paymentId, signature, planId } = request.body;
  const userId = request.user.userId;

  try {
    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update transaction
    await pool.query(
      `UPDATE transactions 
       SET razorpay_payment_id = $1, status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE razorpay_order_id = $3`,
      [paymentId, 'completed', orderId]
    );

    // Get transaction details
    const transactionResult = await pool.query(
      'SELECT * FROM transactions WHERE razorpay_order_id = $1',
      [orderId]
    );

    const transaction = transactionResult.rows[0];

    // Create subscription
    const subscriptionResult = await pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, razorpay_payment_id, status, end_date)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')
       RETURNING id`,
      [userId, planId, paymentId, 'active']
    );

    // Update user's plan
    await pool.query(
      'UPDATE users SET plan_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [planId, userId]
    );

    // Update transaction with subscription ID
    await pool.query(
      'UPDATE transactions SET subscription_id = $1 WHERE id = $2',
      [subscriptionResult.rows[0].id, transaction.id]
    );

    reply.send({
      success: true,
      message: 'Payment verified successfully',
      subscriptionId: subscriptionResult.rows[0].id
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    reply.status(500).send({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

// Get user subscription
export const getSubscription = async (request, reply) => {
  const userId = request.user.userId;

  try {
    const result = await pool.query(
      `SELECT s.*, p.name as plan_name, p.price, p.features
       FROM subscriptions s
       LEFT JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return reply.send({
        success: true,
        subscription: null
      });
    }

    reply.send({
      success: true,
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch subscription'
    });
  }
};

// Get payment history
export const getPaymentHistory = async (request, reply) => {
  const userId = request.user.userId;

  try {
    const result = await pool.query(
      `SELECT t.*, p.name as plan_name
       FROM transactions t
       LEFT JOIN subscriptions s ON t.subscription_id = s.id
       LEFT JOIN plans p ON s.plan_id = p.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    reply.send({
      success: true,
      transactions: result.rows
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
};
