import { query, transaction } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { verifyStripeWebhook } from '../services/stripeService.js';
import logger from '../utils/logger.js';

/**
 * Stripe Webhook Handler
 * 
 * Best Practices Implementation:
 * 1. Verify webhook signature for security
 * 2. Idempotent processing (handle duplicate webhooks using Stripe event ID)
 * 3. Atomic database transactions
 * 4. Proper error handling and logging
 * 5. Quick response (200 OK)
 */

// Main Stripe webhook handler
export const handleStripeWebhook = async (req, res) => {
  try {
    // Get signature from header
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      logger.warn('No Stripe signature header found on webhook');
      return errorResponse(res, 'No signature provided', 400);
    }

    // Verify signature and construct event
    let event;
    try {
      event = verifyStripeWebhook(req.body, signature);
    } catch (err) {
      logger.warn({ err }, 'Invalid Stripe webhook signature');
      return errorResponse(res, `Webhook signature verification failed: ${err.message}`, 400);
    }

    logger.info({ event: event.type, eventId: event.id }, 'Received Stripe webhook');

    // Check if event already processed (idempotency)
    const existingEvent = await query(
      'SELECT id FROM webhook_events WHERE event_id = $1',
      [event.id]
    );

    if (existingEvent.rows.length > 0) {
      logger.info({ eventId: event.id }, 'Webhook event already processed');
      return successResponse(res, { received: true }, 'Event already processed', 200);
    }

    // Store event to prevent duplicate processing
    await query(
      'INSERT INTO webhook_events (event_id, event_type, processed_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
      [event.id, event.type]
    );

    // Process webhook event asynchronously
    setImmediate(() => processStripeWebhookEvent(event));

    // Respond immediately to Stripe (best practice)
    return successResponse(res, { received: true }, 'Webhook received', 200);

  } catch (error) {
    logger.error({ err: error }, 'Stripe webhook processing error');
    // Return 500 for unexpected errors so Stripe retries
    return errorResponse(res, 'Webhook processing error', 500);
  }
};

// Process different Stripe webhook events
const processStripeWebhookEvent = async (event) => {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        logger.info({ eventType: event.type }, 'Unhandled Stripe webhook event');
    }
  } catch (error) {
    logger.error({ err: error, eventType: event.type }, `Error processing ${event.type}`);
  }
};

// Handle checkout session completed
const handleCheckoutSessionCompleted = async (session) => {
  logger.info({ sessionId: session.id }, 'Processing checkout.session.completed');

  const userId = session.metadata?.userId || session.client_reference_id;
  const planId = session.metadata?.planId;

  if (!userId) {
    logger.warn('No userId in checkout session metadata');
    return;
  }

  await transaction(async (client) => {
    // Update payment record
    await client.query(
      `UPDATE payments 
       SET status = $1, 
           metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE transaction_id = $3 AND user_id = $4`,
      [
        'completed',
        JSON.stringify({
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        }),
        session.id,
        userId
      ]
    );

    // Update user's plan if planId provided
    if (planId) {
      await client.query(
        `UPDATE users 
         SET plan_id = $1, 
             stripe_customer_id = $2,
             plan_start_date = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [planId, session.customer, userId]
      );
    }

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'checkout_completed', { sessionId: session.id, amount: session.amount_total / 100 }]
    );
  });

  logger.info({ sessionId: session.id }, 'Checkout session processed successfully');
};

// Handle subscription created
const handleSubscriptionCreated = async (subscription) => {
  logger.info({ subscriptionId: subscription.id }, 'Processing customer.subscription.created');

  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;

  if (!userId) {
    logger.warn('No userId in subscription metadata');
    return;
  }

  await transaction(async (client) => {
    // Create or update subscription record
    await client.query(
      `INSERT INTO subscriptions (
        user_id, plan_id, stripe_subscription_id, stripe_customer_id,
        status, current_period_start, current_period_end, metadata
      ) VALUES ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($7), $8)
      ON CONFLICT (stripe_subscription_id) DO UPDATE SET
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        planId,
        subscription.id,
        subscription.customer,
        subscription.status,
        subscription.current_period_start,
        subscription.current_period_end,
        { subscription }
      ]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'subscription_created', { subscriptionId: subscription.id }]
    );
  });

  logger.info({ subscriptionId: subscription.id }, 'Subscription created successfully');
};

// Handle subscription updated
const handleSubscriptionUpdated = async (subscription) => {
  logger.info({ subscriptionId: subscription.id }, 'Processing customer.subscription.updated');

  await transaction(async (client) => {
    // Update subscription status
    await client.query(
      `UPDATE subscriptions 
       SET status = $1,
           current_period_start = to_timestamp($2),
           current_period_end = to_timestamp($3),
           metadata = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $5`,
      [
        subscription.status,
        subscription.current_period_start,
        subscription.current_period_end,
        { subscription },
        subscription.id
      ]
    );

    // If subscription canceled, update user plan to free
    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      const userResult = await client.query(
        'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
        [subscription.id]
      );

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].user_id;
        
        // Get free plan ID
        const freePlanResult = await client.query(
          "SELECT id FROM plans WHERE type = 'free' LIMIT 1"
        );

        if (freePlanResult.rows.length > 0) {
          await client.query(
            'UPDATE users SET plan_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [freePlanResult.rows[0].id, userId]
          );
        }
      }
    }
  });

  logger.info({ subscriptionId: subscription.id }, 'Subscription updated successfully');
};

// Handle subscription deleted
const handleSubscriptionDeleted = async (subscription) => {
  logger.info({ subscriptionId: subscription.id }, 'Processing customer.subscription.deleted');

  await transaction(async (client) => {
    // Update subscription status
    await client.query(
      `UPDATE subscriptions 
       SET status = 'canceled',
           canceled_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1`,
      [subscription.id]
    );

    // Downgrade user to free plan
    const userResult = await client.query(
      'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscription.id]
    );

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].user_id;
      
      const freePlanResult = await client.query(
        "SELECT id FROM plans WHERE type = 'free' LIMIT 1"
      );

      if (freePlanResult.rows.length > 0) {
        await client.query(
          'UPDATE users SET plan_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [freePlanResult.rows[0].id, userId]
        );
      }

      // Log activity
      await client.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'subscription_canceled', { subscriptionId: subscription.id }]
      );
    }
  });

  logger.info({ subscriptionId: subscription.id }, 'Subscription deleted successfully');
};

// Handle invoice payment succeeded
const handleInvoicePaymentSucceeded = async (invoice) => {
  logger.info({ invoiceId: invoice.id }, 'Processing invoice.payment_succeeded');

  const subscriptionId = invoice.subscription;
  
  if (!subscriptionId) {
    return;
  }

  // Get user from subscription
  const subResult = await query(
    'SELECT user_id, plan_id FROM subscriptions WHERE stripe_subscription_id = $1',
    [subscriptionId]
  );

  if (subResult.rows.length === 0) {
    logger.warn({ subscriptionId }, 'Subscription not found for invoice');
    return;
  }

  const { user_id: userId, plan_id: planId } = subResult.rows[0];

  await transaction(async (client) => {
    // Record payment
    await client.query(
      `INSERT INTO payments (
        user_id, plan_id, amount, currency, status,
        payment_gateway, transaction_id, billing_reason, metadata, invoice_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT DO NOTHING`,
      [
        userId,
        planId,
        (invoice.amount_paid / 100).toFixed(2),
        invoice.currency,
        'completed',
        'stripe',
        invoice.id,
        invoice.billing_reason || 'subscription_cycle',
        { invoice },
        invoice.hosted_invoice_url
      ]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'payment_succeeded', { invoiceId: invoice.id, amount: invoice.amount_paid / 100 }]
    );
  });

  logger.info({ invoiceId: invoice.id }, 'Invoice payment recorded successfully');
};

// Handle invoice payment failed
const handleInvoicePaymentFailed = async (invoice) => {
  logger.info({ invoiceId: invoice.id }, 'Processing invoice.payment_failed');

  const subscriptionId = invoice.subscription;
  
  if (!subscriptionId) {
    return;
  }

  const subResult = await query(
    'SELECT user_id, plan_id FROM subscriptions WHERE stripe_subscription_id = $1',
    [subscriptionId]
  );

  if (subResult.rows.length === 0) {
    return;
  }

  const { user_id: userId, plan_id: planId } = subResult.rows[0];

  await transaction(async (client) => {
    // Record failed payment
    await client.query(
      `INSERT INTO payments (
        user_id, plan_id, amount, currency, status,
        payment_gateway, transaction_id, billing_reason, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        planId,
        (invoice.amount_due / 100).toFixed(2),
        invoice.currency,
        'failed',
        'stripe',
        invoice.id,
        'subscription_cycle',
        { invoice }
      ]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'payment_failed', { invoiceId: invoice.id, amount: invoice.amount_due / 100 }]
    );
  });

  logger.warn({ invoiceId: invoice.id }, 'Invoice payment failed recorded');
};

export default handleStripeWebhook;
