import { query, transaction } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { verifyLemonSqueezyWebhook } from '../services/lemonSqueezyService.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

/**
 * LemonSqueezy Webhook Handler
 * 
 * Best Practices Implementation:
 * 1. Verify webhook signature for security
 * 2. Idempotent processing (handle duplicate webhooks using event ID)
 * 3. Atomic database transactions
 * 4. Proper error handling and logging
 * 5. Quick response (200 OK)
 * 
 * LemonSqueezy Webhook Events:
 * - order_created: New order created
 * - order_refunded: Order refunded
 * - subscription_created: New subscription
 * - subscription_updated: Subscription changed
 * - subscription_cancelled: Subscription cancelled
 * - subscription_resumed: Subscription resumed
 * - subscription_expired: Subscription expired
 * - subscription_paused: Subscription paused
 * - subscription_unpaused: Subscription unpaused
 * - subscription_payment_success: Payment succeeded
 * - subscription_payment_failed: Payment failed
 * - subscription_payment_recovered: Failed payment recovered
 * - license_key_created: License key created
 */

// Main LemonSqueezy webhook handler
export const handleLemonSqueezyWebhook = async (req, res) => {
  try {
    // Get signature from header
    const signature = req.headers['x-signature'];
    
    if (!signature) {
      logger.warn('No LemonSqueezy signature header found on webhook');
      return res.status(400).json({ error: 'No signature provided' });
    }

    // req.body is raw Buffer because route uses express.raw()
    const rawBody = req.body && typeof req.body === 'string' ? req.body : req.body?.toString?.() || '';

    // Verify signature against the raw payload
    const isValid = verifyLemonSqueezyWebhook(rawBody, signature);

    if (!isValid) {
      logger.warn('Invalid LemonSqueezy webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Parse the raw JSON payload
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch (err) {
      logger.error({ err }, 'Failed to parse LemonSqueezy webhook JSON');
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    const eventId = event.meta?.event_name + '_' + event.data?.id;

    logger.info({ 
      event: event.meta?.event_name, 
      eventId,
      customData: event.meta?.custom_data 
    }, 'Received LemonSqueezy webhook');

    // Check if event already processed (idempotency)
    const existingEvent = await query(
      'SELECT id FROM webhook_events WHERE event_id = $1',
      [eventId]
    );

    if (existingEvent.rows.length > 0) {
      logger.info({ eventId }, 'Webhook event already processed');
      return res.status(200).json({ received: true, message: 'Event already processed' });
    }

    // Store event to prevent duplicate processing
    await query(
      'INSERT INTO webhook_events (event_id, event_type, processed_at, raw_data) VALUES ($1, $2, CURRENT_TIMESTAMP, $3)',
      [eventId, event.meta?.event_name, JSON.stringify(event)]
    );

    // Process webhook event asynchronously
    setImmediate(() => processLemonSqueezyWebhookEvent(event));

    // Respond immediately to LemonSqueezy (best practice)
    return res.status(200).json({ received: true });

  } catch (error) {
    logger.error({ err: error }, 'LemonSqueezy webhook processing error');
    // Return 500 for unexpected errors so LemonSqueezy retries
    return res.status(500).json({ error: 'Webhook processing error' });
  }
};

// Process different LemonSqueezy webhook events
const processLemonSqueezyWebhookEvent = async (event) => {
  try {
    const eventName = event.meta?.event_name;
    const data = event.data;

    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(data, event.meta);
        break;

      case 'subscription_created':
        await handleSubscriptionCreated(data, event.meta);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(data, event.meta);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data, event.meta);
        break;

      case 'subscription_expired':
        await handleSubscriptionExpired(data, event.meta);
        break;

      case 'subscription_payment_success':
        await handleSubscriptionPaymentSuccess(data, event.meta);
        break;

      case 'subscription_payment_failed':
        await handleSubscriptionPaymentFailed(data, event.meta);
        break;

      case 'subscription_payment_recovered':
        await handleSubscriptionPaymentRecovered(data, event.meta);
        break;

      default:
        logger.info({ eventName }, 'Unhandled LemonSqueezy webhook event');
    }
  } catch (error) {
    logger.error({ err: error, event: event.meta?.event_name }, 'Error processing webhook event');
  }
};

// Handle order created (one-time payment)
const handleOrderCreated = async (order, meta) => {
  try {
    const customData = meta.custom_data || {};
    const userId = customData.userId || customData.user_id;

    if (!userId) {
      logger.warn({ orderId: order.id }, 'No userId in order custom data');
      return;
    }

    await transaction(async (client) => {
      // Update payment record
      await client.query(
        `UPDATE payments 
         SET status = $1, 
             amount = $2,
             transaction_id = $3,
             metadata = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5 AND transaction_id = $6`,
        ['completed', order.attributes.total, order.id, JSON.stringify(order), userId, order.id]
      );

      // Log activity
      await client.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'payment_completed', JSON.stringify({ orderId: order.id, amount: order.attributes.total })]
      );
    });

    logger.info({ userId, orderId: order.id }, 'Order created successfully');
  } catch (error) {
    logger.error({ err: error, orderId: order.id }, 'Error handling order created');
  }
};

// Handle subscription created
const handleSubscriptionCreated = async (subscription, meta) => {
  try {
    const customData = meta.custom_data || {};
    const userId = customData.userId || customData.user_id;
    const planId = customData.planId || customData.plan_id;

    if (!userId || !planId) {
      logger.warn({ subscriptionId: subscription.id }, 'Missing userId or planId in subscription custom data');
      return;
    }

    await transaction(async (client) => {
      // Update user plan
      await client.query(
        `UPDATE users 
         SET plan_id = $1, 
             plan_start_date = $2,
             subscription_status = $3
         WHERE id = $4`,
        [planId, subscription.attributes.created_at, subscription.attributes.status, userId]
      );

      // Create/update subscription record
      await client.query(
        `INSERT INTO subscriptions (user_id, plan_id, ls_subscription_id, status, current_period_start, current_period_end, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (ls_subscription_id) 
         DO UPDATE SET status = $4, current_period_start = $5, current_period_end = $6, metadata = $7`,
        [
          userId,
          planId,
          subscription.id,
          subscription.attributes.status,
          subscription.attributes.created_at,
          subscription.attributes.renews_at,
          JSON.stringify(subscription)
        ]
      );

      // Update payment record
      await client.query(
        `UPDATE payments 
         SET status = 'completed', 
             transaction_id = $1,
             metadata = $2
         WHERE user_id = $3 AND plan_id = $4 AND status = 'pending'`,
        [subscription.id, JSON.stringify(subscription), userId, planId]
      );

      // Log activity
      await client.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'subscription_created', JSON.stringify({ subscriptionId: subscription.id, planId })]
      );
    });

    logger.info({ userId, subscriptionId: subscription.id }, 'Subscription created successfully');
  } catch (error) {
    logger.error({ err: error, subscriptionId: subscription.id }, 'Error handling subscription created');
  }
};

// Handle subscription updated
const handleSubscriptionUpdated = async (subscription, meta) => {
  try {
    await transaction(async (client) => {
      // Update subscription record
      const result = await client.query(
        `UPDATE subscriptions 
         SET status = $1,
             current_period_start = $2,
             current_period_end = $3,
             metadata = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE ls_subscription_id = $5
         RETURNING user_id`,
        [
          subscription.attributes.status,
          subscription.attributes.created_at,
          subscription.attributes.renews_at,
          JSON.stringify(subscription),
          subscription.id
        ]
      );

      if (result.rows.length > 0) {
        const userId = result.rows[0].user_id;

        // Update user subscription status
        await client.query(
          'UPDATE users SET subscription_status = $1 WHERE id = $2',
          [subscription.attributes.status, userId]
        );

        // Log activity
        await client.query(
          'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
          [userId, 'subscription_updated', JSON.stringify({ subscriptionId: subscription.id })]
        );
      }
    });

    logger.info({ subscriptionId: subscription.id }, 'Subscription updated successfully');
  } catch (error) {
    logger.error({ err: error, subscriptionId: subscription.id }, 'Error handling subscription updated');
  }
};

// Handle subscription cancelled
const handleSubscriptionCancelled = async (subscription, meta) => {
  try {
    await transaction(async (client) => {
      const result = await client.query(
        `UPDATE subscriptions 
         SET status = 'cancelled',
             cancel_at_period_end = true,
             metadata = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE ls_subscription_id = $2
         RETURNING user_id`,
        [JSON.stringify(subscription), subscription.id]
      );

      if (result.rows.length > 0) {
        const userId = result.rows[0].user_id;

        await client.query(
          'UPDATE users SET subscription_status = $1 WHERE id = $2',
          ['cancelled', userId]
        );

        await client.query(
          'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
          [userId, 'subscription_cancelled', JSON.stringify({ subscriptionId: subscription.id })]
        );
      }
    });

    logger.info({ subscriptionId: subscription.id }, 'Subscription cancelled successfully');
  } catch (error) {
    logger.error({ err: error, subscriptionId: subscription.id }, 'Error handling subscription cancelled');
  }
};

// Handle subscription expired
const handleSubscriptionExpired = async (subscription, meta) => {
  try {
    await transaction(async (client) => {
      const result = await client.query(
        `UPDATE subscriptions 
         SET status = 'expired',
             metadata = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE ls_subscription_id = $2
         RETURNING user_id`,
        [JSON.stringify(subscription), subscription.id]
      );

      if (result.rows.length > 0) {
        const userId = result.rows[0].user_id;

        // Get free plan
        const freePlan = await client.query(
          'SELECT id FROM plans WHERE type = $1 LIMIT 1',
          ['free']
        );

        if (freePlan.rows.length > 0) {
          await client.query(
            'UPDATE users SET plan_id = $1, subscription_status = $2 WHERE id = $3',
            [freePlan.rows[0].id, 'expired', userId]
          );
        }

        await client.query(
          'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
          [userId, 'subscription_expired', JSON.stringify({ subscriptionId: subscription.id })]
        );
      }
    });

    logger.info({ subscriptionId: subscription.id }, 'Subscription expired successfully');
  } catch (error) {
    logger.error({ err: error, subscriptionId: subscription.id }, 'Error handling subscription expired');
  }
};

// Handle subscription payment success
const handleSubscriptionPaymentSuccess = async (subscription, meta) => {
  try {
    const result = await query(
      'SELECT user_id FROM subscriptions WHERE ls_subscription_id = $1',
      [subscription.id]
    );

    if (result.rows.length > 0) {
      const userId = result.rows[0].user_id;

      await transaction(async (client) => {
        // Record payment
        await client.query(
          `INSERT INTO payments (user_id, amount, currency, status, payment_method, payment_gateway, transaction_id, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            userId,
            subscription.attributes.total,
            subscription.attributes.currency,
            'completed',
            'lemonsqueezy',
            'lemonsqueezy',
            subscription.id,
            JSON.stringify(subscription)
          ]
        );

        // Log activity
        await client.query(
          'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
          [userId, 'payment_success', JSON.stringify({ subscriptionId: subscription.id })]
        );
      });

      logger.info({ userId, subscriptionId: subscription.id }, 'Subscription payment succeeded');
    }
  } catch (error) {
    logger.error({ err: error, subscriptionId: subscription.id }, 'Error handling subscription payment success');
  }
};

// Handle subscription payment failed
const handleSubscriptionPaymentFailed = async (subscription, meta) => {
  try {
    const result = await query(
      'SELECT user_id FROM subscriptions WHERE ls_subscription_id = $1',
      [subscription.id]
    );

    if (result.rows.length > 0) {
      const userId = result.rows[0].user_id;

      await query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'payment_failed', JSON.stringify({ subscriptionId: subscription.id })]
      );

      logger.warn({ userId, subscriptionId: subscription.id }, 'Subscription payment failed');
    }
  } catch (error) {
    logger.error({ err: error, subscriptionId: subscription.id }, 'Error handling subscription payment failed');
  }
};

// Handle subscription payment recovered
const handleSubscriptionPaymentRecovered = async (subscription, meta) => {
  try {
    const result = await query(
      'SELECT user_id FROM subscriptions WHERE ls_subscription_id = $1',
      [subscription.id]
    );

    if (result.rows.length > 0) {
      const userId = result.rows[0].user_id;

      await query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'payment_recovered', JSON.stringify({ subscriptionId: subscription.id })]
      );

      logger.info({ userId, subscriptionId: subscription.id }, 'Subscription payment recovered');
    }
  } catch (error) {
    logger.error({ err: error, subscriptionId: subscription.id }, 'Error handling subscription payment recovered');
  }
};

export default {
  handleLemonSqueezyWebhook
};
