import crypto from 'crypto';
import { query, transaction } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { sendWebhookNotificationEmail } from '../utils/email.js';
import config from '../config/config.js';

/**
 * LemonSqueezy Webhook Handler
 * 
 * Best Practices Implementation:
 * 1. Verify webhook signature for security
 * 2. Idempotent processing (handle duplicate webhooks)
 * 3. Atomic database transactions
 * 4. Proper error handling and logging
 * 5. Quick response (200 OK) then async processing
 */

// Verify LemonSqueezy webhook signature
const verifyWebhookSignature = (payload, signature) => {
  if (!config.LEMONSQUEEZY_WEBHOOK_SECRET) {
    console.warn('⚠️  LemonSqueezy webhook secret not configured');
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', config.LEMONSQUEEZY_WEBHOOK_SECRET);
    const digest = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
};

// Main webhook handler
export const handleLemonSqueezyWebhook = async (req, res) => {
  try {
    // Get signature from header
    const signature = req.headers['x-signature'];
    
    if (!signature) {
      console.error('❌ No signature header found');
      return errorResponse(res, 'No signature provided', 400);
    }

    // Verify signature
    const rawBody = JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error('❌ Invalid webhook signature');
      return errorResponse(res, 'Invalid signature', 401);
    }

    // Extract event data
    const { meta, data } = req.body;
    const eventName = meta.event_name;
    const eventId = meta.custom_data?.event_id || `${eventName}_${Date.now()}`;

    console.log(`📥 LemonSqueezy Webhook: ${eventName}`);
    console.log(`🆔 Event ID: ${eventId}`);

    // Respond immediately to LemonSqueezy (best practice)
    res.status(200).json({ received: true });

    // Process webhook asynchronously
    await processWebhookEvent(eventName, data, meta);

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    // Still return 200 to avoid retries for unrecoverable errors
    return res.status(200).json({ received: true, error: error.message });
  }
};

// Process different webhook events
const processWebhookEvent = async (eventName, data, meta) => {
  try {
    const attributes = data.attributes;
    const customData = meta.custom_data || {};

    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(data, attributes, customData);
        break;

      case 'subscription_created':
        await handleSubscriptionCreated(data, attributes, customData);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(data, attributes, customData);
        break;

      case 'subscription_payment_success':
        await handleSubscriptionPaymentSuccess(data, attributes, customData);
        break;

      case 'subscription_payment_failed':
        await handleSubscriptionPaymentFailed(data, attributes, customData);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data, attributes, customData);
        break;

      case 'subscription_resumed':
        await handleSubscriptionResumed(data, attributes, customData);
        break;

      case 'subscription_expired':
        await handleSubscriptionExpired(data, attributes, customData);
        break;

      default:
        console.log(`ℹ️  Unhandled event: ${eventName}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${eventName}:`, error);
    throw error;
  }
};

// Handle order created (one-time purchase or initial subscription setup)
const handleOrderCreated = async (data, attributes, customData) => {
  console.log('💰 Processing order_created');

  const userId = customData.userId;
  const planId = customData.planId;
  const orderId = data.id;

  if (!userId) {
    console.error('❌ No userId in custom_data');
    return;
  }

  await transaction(async (client) => {
    // Create payment record
    await client.query(
      `INSERT INTO payments (
        user_id, plan_id, amount, currency, status,
        payment_gateway, lemon_order_id, billing_reason, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT DO NOTHING`,
      [
        userId,
        planId,
        (attributes.total / 100).toFixed(2), // Convert from cents
        attributes.currency,
        'completed',
        'lemonsqueezy',
        orderId,
        'subscription_create',
        { order: attributes }
      ]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'order_created', { orderId, amount: attributes.total / 100 }]
    );
  });

  console.log('✅ Order created successfully');
};

// Handle subscription created
const handleSubscriptionCreated = async (data, attributes, customData) => {
  console.log('🎉 Processing subscription_created');

  const userId = customData.userId || attributes.user_email; // fallback to email
  const planId = customData.planId;
  const subscriptionId = data.id;
  const customerId = attributes.customer_id;

  if (!userId) {
    console.error('❌ No userId found');
    return;
  }

  await transaction(async (client) => {
    // Create or update subscription record
    const subResult = await client.query(
      `INSERT INTO subscriptions (
        user_id, plan_id, lemon_subscription_id, lemon_customer_id,
        status, billing_cycle, current_period_start, current_period_end,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (lemon_subscription_id) DO UPDATE SET
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id`,
      [
        userId,
        planId,
        subscriptionId,
        customerId,
        attributes.status,
        'monthly',
        attributes.renews_at ? new Date(attributes.renews_at).toISOString().split('T')[0] : null,
        attributes.ends_at ? new Date(attributes.ends_at).toISOString().split('T')[0] : null,
        { subscription: attributes }
      ]
    );

    // Update user record
    await client.query(
      `UPDATE users SET 
       plan_id = $1,
       subscription_id = $2,
       subscription_status = $3,
       lemon_customer_id = $4,
       plan_start_date = CURRENT_TIMESTAMP,
       services_active = true,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [planId, subscriptionId, attributes.status, customerId, userId]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'subscription_created', { subscriptionId, planId }]
    );
  });

  console.log('✅ Subscription created successfully');
};

// Handle subscription updated
const handleSubscriptionUpdated = async (data, attributes, customData) => {
  console.log('🔄 Processing subscription_updated');

  const subscriptionId = data.id;

  await transaction(async (client) => {
    // Update subscription record
    await client.query(
      `UPDATE subscriptions SET
       status = $1,
       current_period_start = $2,
       current_period_end = $3,
       cancel_at_period_end = $4,
       metadata = metadata || $5::jsonb,
       updated_at = CURRENT_TIMESTAMP
       WHERE lemon_subscription_id = $6`,
      [
        attributes.status,
        attributes.renews_at ? new Date(attributes.renews_at).toISOString().split('T')[0] : null,
        attributes.ends_at ? new Date(attributes.ends_at).toISOString().split('T')[0] : null,
        attributes.cancelled || false,
        JSON.stringify({ updated: attributes }),
        subscriptionId
      ]
    );

    // Update user status
    await client.query(
      `UPDATE users SET
       subscription_status = $1,
       updated_at = CURRENT_TIMESTAMP
       WHERE subscription_id = $2`,
      [attributes.status, subscriptionId]
    );
  });

  console.log('✅ Subscription updated successfully');
};

// Handle successful payment
const handleSubscriptionPaymentSuccess = async (data, attributes, customData) => {
  console.log('💳 Processing subscription_payment_success');

  const subscriptionId = attributes.subscription_id;
  const orderId = data.id;

  await transaction(async (client) => {
    // Get subscription to find user
    const subResult = await client.query(
      'SELECT user_id, plan_id FROM subscriptions WHERE lemon_subscription_id = $1',
      [subscriptionId]
    );

    if (subResult.rows.length === 0) {
      console.error('❌ Subscription not found');
      return;
    }

    const { user_id, plan_id } = subResult.rows[0];

    // Create payment record
    await client.query(
      `INSERT INTO payments (
        user_id, subscription_id, plan_id, amount, currency, status,
        payment_gateway, lemon_order_id, lemon_subscription_invoice_id,
        billing_reason, metadata
      ) VALUES ($1, (SELECT id FROM subscriptions WHERE lemon_subscription_id = $2), $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT DO NOTHING`,
      [
        user_id,
        subscriptionId,
        plan_id,
        (attributes.total / 100).toFixed(2),
        attributes.currency,
        'completed',
        'lemonsqueezy',
        orderId,
        attributes.invoice_id,
        'subscription_cycle',
        { payment: attributes }
      ]
    );

    // Ensure services are active
    await client.query(
      `UPDATE users SET services_active = true WHERE id = $1`,
      [user_id]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [user_id, 'payment_success', { subscriptionId, amount: attributes.total / 100 }]
    );
  });

  console.log('✅ Payment recorded successfully');
};

// Handle failed payment
const handleSubscriptionPaymentFailed = async (data, attributes, customData) => {
  console.log('❌ Processing subscription_payment_failed');

  const subscriptionId = attributes.subscription_id;

  await transaction(async (client) => {
    // Get subscription
    const subResult = await client.query(
      'SELECT user_id FROM subscriptions WHERE lemon_subscription_id = $1',
      [subscriptionId]
    );

    if (subResult.rows.length === 0) {
      console.error('❌ Subscription not found');
      return;
    }

    const { user_id } = subResult.rows[0];

    // Update subscription status
    await client.query(
      `UPDATE subscriptions SET status = 'past_due' WHERE lemon_subscription_id = $1`,
      [subscriptionId]
    );

    // Set grace period (7 days)
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

    await client.query(
      `UPDATE users SET 
       subscription_status = 'past_due',
       next_billing_date = $1
       WHERE id = $2`,
      [gracePeriodEnd.toISOString().split('T')[0], user_id]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [user_id, 'payment_failed', { subscriptionId, gracePeriodEnd }]
    );
  });

  console.log('⚠️  Payment failed, grace period set');
  
  // Send email notification
  const userResult = await query(
    'SELECT email, first_name FROM users WHERE id = $1',
    [user_id]
  );
  
  if (userResult.rows.length > 0) {
    const { email, first_name } = userResult.rows[0];
    await sendWebhookNotificationEmail(
      email,
      'Payment Failed',
      { subscriptionId, gracePeriodEnd: gracePeriodEnd.toLocaleDateString(), status: 'grace_period' },
      new Date().toISOString()
    ).catch(err => console.error('Failed to send webhook notification:', err));
  }
};

// Handle subscription cancelled
const handleSubscriptionCancelled = async (data, attributes, customData) => {
  console.log('🚫 Processing subscription_cancelled');

  const subscriptionId = data.id;

  await transaction(async (client) => {
    // Update subscription
    await client.query(
      `UPDATE subscriptions SET
       status = 'cancelled',
       cancelled_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
       WHERE lemon_subscription_id = $1`,
      [subscriptionId]
    );

    // Update user
    await client.query(
      `UPDATE users SET
       subscription_status = 'cancelled',
       services_active = false
       WHERE subscription_id = $1`,
      [subscriptionId]
    );

    // Log activity
    const subResult = await client.query(
      'SELECT user_id FROM subscriptions WHERE lemon_subscription_id = $1',
      [subscriptionId]
    );

    if (subResult.rows.length > 0) {
      await client.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [subResult.rows[0].user_id, 'subscription_cancelled', { subscriptionId }]
      );
    }
  });

  console.log('✅ Subscription cancelled');
};

// Handle subscription resumed
const handleSubscriptionResumed = async (data, attributes, customData) => {
  console.log('▶️  Processing subscription_resumed');

  const subscriptionId = data.id;

  await transaction(async (client) => {
    // Update subscription
    await client.query(
      `UPDATE subscriptions SET
       status = 'active',
       cancel_at_period_end = false,
       updated_at = CURRENT_TIMESTAMP
       WHERE lemon_subscription_id = $1`,
      [subscriptionId]
    );

    // Reactivate services
    await client.query(
      `UPDATE users SET
       subscription_status = 'active',
       services_active = true
       WHERE subscription_id = $1`,
      [subscriptionId]
    );
  });

  console.log('✅ Subscription resumed');
};

// Handle subscription expired
const handleSubscriptionExpired = async (data, attributes, customData) => {
  console.log('⏰ Processing subscription_expired');

  const subscriptionId = data.id;

  await transaction(async (client) => {
    // Update subscription
    await client.query(
      `UPDATE subscriptions SET
       status = 'expired',
       updated_at = CURRENT_TIMESTAMP
       WHERE lemon_subscription_id = $1`,
      [subscriptionId]
    );

    // Suspend services
    await client.query(
      `UPDATE users SET
       subscription_status = 'expired',
       services_active = false
       WHERE subscription_id = $1`,
      [subscriptionId]
    );
  });

  console.log('✅ Subscription expired');
};

export default handleLemonSqueezyWebhook;
