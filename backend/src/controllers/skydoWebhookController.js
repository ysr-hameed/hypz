import { query, transaction } from "../config/database.js";
import { successResponse, errorResponse } from "../utils/helpers.js";
import { verifySkydoWebhook } from "../services/skydoService.js";
import logger from "../utils/logger.js";

/**
 * Skydo Webhook Handler
 *
 * Best Practices Implementation:
 * 1. Verify webhook signature for security
 * 2. Idempotent processing (handle duplicate webhooks using event ID)
 * 3. Atomic database transactions
 * 4. Proper error handling and logging
 * 5. Quick response (200 OK)
 *
 * Skydo Webhook Events:
 * - checkout.completed: Checkout session completed
 * - subscription.created: New subscription created
 * - subscription.updated: Subscription changed
 * - subscription.cancelled: Subscription cancelled
 * - subscription.expired: Subscription expired
 * - subscription.paused: Subscription paused
 * - subscription.resumed: Subscription resumed
 * - payment.succeeded: Payment succeeded
 * - payment.failed: Payment failed
 * - invoice.created: Invoice created
 * - invoice.paid: Invoice paid
 * - invoice.payment_failed: Invoice payment failed
 */

// Main Skydo webhook handler
export const handleSkydoWebhook = async (req, res) => {
    try {
        // Get signature from header (Skydo uses X-Skydo-Signature)
        const signature = req.headers["x-skydo-signature"];

        if (!signature) {
            logger.warn("No Skydo signature header found on webhook");
            return res.status(400).json({ error: "No signature provided" });
        }

        // req.body is raw Buffer because route uses express.raw()
        const rawBody =
            req.body && typeof req.body === "string"
                ? req.body
                : req.body?.toString?.() || "";

        // Verify signature against the raw payload
        const isValid = verifySkydoWebhook(rawBody, signature);

        if (!isValid) {
            logger.warn("Invalid Skydo webhook signature");
            return res.status(400).json({ error: "Invalid signature" });
        }

        // Parse the raw JSON payload
        let event;
        try {
            event = JSON.parse(rawBody);
        } catch (err) {
            logger.error({ err }, "Failed to parse Skydo webhook JSON");
            return res.status(400).json({ error: "Invalid JSON payload" });
        }

        const eventId =
            event.id || `${event.type}_${event.data?.id || Date.now()}`;
        const eventType = event.type;

        logger.info(
            {
                eventType,
                eventId,
                metadata: event.data?.metadata,
            },
            "Received Skydo webhook"
        );

        // Check if event already processed (idempotency)
        const existingEvent = await query(
            "SELECT id FROM webhook_events WHERE event_id = $1",
            [eventId]
        );

        if (existingEvent.rows.length > 0) {
            logger.info({ eventId }, "Webhook event already processed");
            return res
                .status(200)
                .json({ received: true, message: "Event already processed" });
        }

        // Store event to prevent duplicate processing
        await query(
            "INSERT INTO webhook_events (event_id, event_type, processed_at, raw_data) VALUES ($1, $2, CURRENT_TIMESTAMP, $3)",
            [eventId, eventType, JSON.stringify(event)]
        );

        // Process webhook event asynchronously
        setImmediate(() => processSkydoWebhookEvent(event));

        // Respond immediately to Skydo (best practice)
        return res.status(200).json({ received: true });
    } catch (error) {
        logger.error({ err: error }, "Skydo webhook processing error");
        // Return 500 for unexpected errors so Skydo retries
        return res.status(500).json({ error: "Webhook processing error" });
    }
};

// Process different Skydo webhook events
const processSkydoWebhookEvent = async (event) => {
    try {
        const eventType = event.type;
        const data = event.data;

        switch (eventType) {
            case "checkout.completed":
                await handleCheckoutCompleted(data);
                break;

            case "subscription.created":
                await handleSubscriptionCreated(data);
                break;

            case "subscription.updated":
                await handleSubscriptionUpdated(data);
                break;

            case "subscription.cancelled":
                await handleSubscriptionCancelled(data);
                break;

            case "subscription.expired":
                await handleSubscriptionExpired(data);
                break;

            case "subscription.paused":
                await handleSubscriptionPaused(data);
                break;

            case "subscription.resumed":
                await handleSubscriptionResumed(data);
                break;

            case "payment.succeeded":
                await handlePaymentSucceeded(data);
                break;

            case "payment.failed":
                await handlePaymentFailed(data);
                break;

            case "invoice.paid":
                await handleInvoicePaid(data);
                break;

            case "invoice.payment_failed":
                await handleInvoicePaymentFailed(data);
                break;

            default:
                logger.info({ eventType }, "Unhandled Skydo webhook event");
        }
    } catch (error) {
        logger.error(
            { err: error, eventType: event.type },
            "Error processing webhook event"
        );
    }
};

// Handle checkout completed
const handleCheckoutCompleted = async (data) => {
    try {
        const metadata = data.metadata || {};
        const userId = metadata.user_id;
        const planId = metadata.plan_id;

        logger.info(
            {
                checkoutId: data.id,
                userId,
                planId,
                status: data.status,
            },
            "Processing checkout.completed webhook"
        );

        if (!userId) {
            logger.warn(
                { checkoutId: data.id, metadata },
                "No userId in checkout metadata"
            );
            return;
        }

        await transaction(async (client) => {
            // Create/update payment record
            await client.query(
                `INSERT INTO payments (
          user_id, plan_id, amount, currency, status, payment_method,
          payment_gateway, transaction_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (transaction_id)
        DO UPDATE SET 
          status = 'completed',
          amount = $3,
          metadata = $9,
          updated_at = CURRENT_TIMESTAMP`,
                [
                    userId,
                    planId,
                    data.amount || 0,
                    data.currency || "usd",
                    "completed",
                    "skydo",
                    "skydo",
                    data.id,
                    JSON.stringify(data),
                ]
            );

            // Log activity
            await client.query(
                "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
                [
                    userId,
                    "checkout_completed",
                    JSON.stringify({
                        checkoutId: data.id,
                        amount: data.amount,
                        planId,
                    }),
                ]
            );
        });

        logger.info(
            { userId, checkoutId: data.id, planId },
            "Checkout completed and processed successfully"
        );
    } catch (error) {
        logger.error(
            { err: error, checkoutId: data.id },
            "Error handling checkout completed"
        );
    }
};

// Handle subscription created
const handleSubscriptionCreated = async (data) => {
    try {
        const metadata = data.metadata || {};
        const userId = metadata.user_id;
        const planId = metadata.plan_id;

        logger.info(
            {
                subscriptionId: data.id,
                userId,
                planId,
                status: data.status,
            },
            "Processing subscription.created webhook"
        );

        if (!userId || !planId) {
            logger.warn(
                {
                    subscriptionId: data.id,
                    metadata,
                },
                "Missing userId or planId in subscription metadata"
            );
            return;
        }

        await transaction(async (client) => {
            // Update user plan and set active status
            await client.query(
                `UPDATE users 
         SET plan_id = $1, 
             plan_start_date = $2,
             subscription_status = $3,
             services_active = true,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
                [
                    planId,
                    data.created_at || new Date().toISOString(),
                    "active",
                    userId,
                ]
            );

            // Create/update subscription record
            await client.query(
                `INSERT INTO subscriptions (
          user_id, plan_id, skydo_subscription_id, status, 
          current_period_start, current_period_end, metadata
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (skydo_subscription_id) 
         DO UPDATE SET 
           status = $4, 
           current_period_start = $5, 
           current_period_end = $6, 
           metadata = $7,
           updated_at = CURRENT_TIMESTAMP`,
                [
                    userId,
                    planId,
                    data.id,
                    "active",
                    data.current_period_start || data.created_at,
                    data.current_period_end || data.renews_at,
                    JSON.stringify(data),
                ]
            );

            // Update payment record
            const paymentUpdate = await client.query(
                `UPDATE payments 
         SET status = 'completed', 
             transaction_id = $1,
             amount = $2,
             metadata = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4 AND plan_id = $5 AND status = 'pending'
         RETURNING id`,
                [
                    data.id,
                    data.amount || 0,
                    JSON.stringify(data),
                    userId,
                    planId,
                ]
            );

            // If no payment was updated, create a new completed payment record
            if (paymentUpdate.rows.length === 0) {
                logger.info(
                    { userId, planId, subscriptionId: data.id },
                    "No pending payment found, creating new payment record"
                );
                await client.query(
                    `INSERT INTO payments (
            user_id, plan_id, amount, currency, status, payment_method,
            payment_gateway, transaction_id, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        userId,
                        planId,
                        data.amount || 0,
                        data.currency || "usd",
                        "completed",
                        "skydo",
                        "skydo",
                        data.id,
                        JSON.stringify(data),
                    ]
                );
            }

            // Log activity
            await client.query(
                "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
                [
                    userId,
                    "subscription_created",
                    JSON.stringify({ subscriptionId: data.id, planId }),
                ]
            );
        });

        logger.info(
            { userId, subscriptionId: data.id, planId },
            "Subscription created and user plan activated successfully"
        );
    } catch (error) {
        logger.error(
            { err: error, subscriptionId: data.id },
            "Error handling subscription created"
        );
    }
};

// Handle subscription updated
const handleSubscriptionUpdated = async (data) => {
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
         WHERE skydo_subscription_id = $5
         RETURNING user_id, plan_id`,
                [
                    data.status,
                    data.current_period_start || data.created_at,
                    data.current_period_end || data.renews_at,
                    JSON.stringify(data),
                    data.id,
                ]
            );

            if (result.rows.length > 0) {
                const userId = result.rows[0].user_id;
                const planId = result.rows[0].plan_id;

                // Determine if subscription is in a usable state
                const activeStatuses = ["active", "trialing", "past_due"];
                const isActive = activeStatuses.includes(data.status);

                // Update user subscription status
                await client.query(
                    `UPDATE users 
           SET subscription_status = $1,
               plan_id = $2,
               services_active = $3,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
                    [data.status, planId, isActive, userId]
                );

                // Log activity
                await client.query(
                    "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
                    [
                        userId,
                        "subscription_updated",
                        JSON.stringify({
                            subscriptionId: data.id,
                            status: data.status,
                        }),
                    ]
                );

                logger.info(
                    { userId, subscriptionId: data.id, status: data.status },
                    "Subscription updated successfully"
                );
            }
        });
    } catch (error) {
        logger.error(
            { err: error, subscriptionId: data.id },
            "Error handling subscription updated"
        );
    }
};

// Handle subscription cancelled
const handleSubscriptionCancelled = async (data) => {
    try {
        await transaction(async (client) => {
            const result = await client.query(
                `UPDATE subscriptions 
         SET status = 'cancelled',
             cancel_at_period_end = true,
             metadata = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE skydo_subscription_id = $2
         RETURNING user_id`,
                [JSON.stringify(data), data.id]
            );

            if (result.rows.length > 0) {
                const userId = result.rows[0].user_id;

                await client.query(
                    "UPDATE users SET subscription_status = $1 WHERE id = $2",
                    ["cancelled", userId]
                );

                await client.query(
                    "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
                    [
                        userId,
                        "subscription_cancelled",
                        JSON.stringify({ subscriptionId: data.id }),
                    ]
                );
            }
        });

        logger.info(
            { subscriptionId: data.id },
            "Subscription cancelled successfully"
        );
    } catch (error) {
        logger.error(
            { err: error, subscriptionId: data.id },
            "Error handling subscription cancelled"
        );
    }
};

// Handle subscription expired
const handleSubscriptionExpired = async (data) => {
    try {
        await transaction(async (client) => {
            const result = await client.query(
                `UPDATE subscriptions 
         SET status = 'expired',
             metadata = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE skydo_subscription_id = $2
         RETURNING user_id`,
                [JSON.stringify(data), data.id]
            );

            if (result.rows.length > 0) {
                const userId = result.rows[0].user_id;

                // Get free plan
                const freePlan = await client.query(
                    "SELECT id FROM plans WHERE type = $1 LIMIT 1",
                    ["free"]
                );

                if (freePlan.rows.length > 0) {
                    await client.query(
                        "UPDATE users SET plan_id = $1, subscription_status = $2, services_active = false WHERE id = $3",
                        [freePlan.rows[0].id, "expired", userId]
                    );
                }

                await client.query(
                    "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
                    [
                        userId,
                        "subscription_expired",
                        JSON.stringify({ subscriptionId: data.id }),
                    ]
                );
            }
        });

        logger.info(
            { subscriptionId: data.id },
            "Subscription expired successfully"
        );
    } catch (error) {
        logger.error(
            { err: error, subscriptionId: data.id },
            "Error handling subscription expired"
        );
    }
};

// Handle subscription paused
const handleSubscriptionPaused = async (data) => {
    try {
        await transaction(async (client) => {
            const result = await client.query(
                `UPDATE subscriptions 
         SET status = 'paused',
             metadata = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE skydo_subscription_id = $2
         RETURNING user_id`,
                [JSON.stringify(data), data.id]
            );

            if (result.rows.length > 0) {
                const userId = result.rows[0].user_id;

                await client.query(
                    "UPDATE users SET subscription_status = $1, services_active = false WHERE id = $2",
                    ["paused", userId]
                );

                await client.query(
                    "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
                    [
                        userId,
                        "subscription_paused",
                        JSON.stringify({ subscriptionId: data.id }),
                    ]
                );
            }
        });

        logger.info(
            { subscriptionId: data.id },
            "Subscription paused successfully"
        );
    } catch (error) {
        logger.error(
            { err: error, subscriptionId: data.id },
            "Error handling subscription paused"
        );
    }
};

// Handle subscription resumed
const handleSubscriptionResumed = async (data) => {
    try {
        await transaction(async (client) => {
            const result = await client.query(
                `UPDATE subscriptions 
         SET status = 'active',
             metadata = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE skydo_subscription_id = $2
         RETURNING user_id, plan_id`,
                [JSON.stringify(data), data.id]
            );

            if (result.rows.length > 0) {
                const userId = result.rows[0].user_id;
                const planId = result.rows[0].plan_id;

                await client.query(
                    "UPDATE users SET plan_id = $1, subscription_status = $2, services_active = true WHERE id = $3",
                    [planId, "active", userId]
                );

                await client.query(
                    "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
                    [
                        userId,
                        "subscription_resumed",
                        JSON.stringify({ subscriptionId: data.id }),
                    ]
                );
            }
        });

        logger.info(
            { subscriptionId: data.id },
            "Subscription resumed successfully"
        );
    } catch (error) {
        logger.error(
            { err: error, subscriptionId: data.id },
            "Error handling subscription resumed"
        );
    }
};

// Handle payment succeeded
const handlePaymentSucceeded = async (data) => {
    try {
        const metadata = data.metadata || {};
        const userId = metadata.user_id;

        if (!userId) {
            logger.warn(
                { paymentId: data.id },
                "No userId in payment metadata"
            );
            return;
        }

        await transaction(async (client) => {
            // Record payment
            await client.query(
                `INSERT INTO payments (
          user_id, plan_id, amount, currency, status, payment_method,
          payment_gateway, transaction_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (transaction_id) 
        DO UPDATE SET 
          status = 'completed',
          amount = $3,
          metadata = $9,
          updated_at = CURRENT_TIMESTAMP`,
                [
                    userId,
                    metadata.plan_id || null,
                    data.amount || 0,
                    data.currency || "usd",
                    "completed",
                    "skydo",
                    "skydo",
                    data.id,
                    JSON.stringify(data),
                ]
            );

            // Ensure user services are active
            await client.query(
                `UPDATE users 
         SET services_active = true,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
                [userId]
            );

            // Log activity
            await client.query(
                "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
                [
                    userId,
                    "payment_succeeded",
                    JSON.stringify({ paymentId: data.id, amount: data.amount }),
                ]
            );
        });

        logger.info(
            { userId, paymentId: data.id },
            "Payment succeeded and processed"
        );
    } catch (error) {
        logger.error(
            { err: error, paymentId: data.id },
            "Error handling payment succeeded"
        );
    }
};

// Handle payment failed
const handlePaymentFailed = async (data) => {
    try {
        const metadata = data.metadata || {};
        const userId = metadata.user_id;

        if (!userId) {
            logger.warn(
                { paymentId: data.id },
                "No userId in payment metadata"
            );
            return;
        }

        await query(
            "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
            [
                userId,
                "payment_failed",
                JSON.stringify({
                    paymentId: data.id,
                    reason: data.failure_reason,
                }),
            ]
        );

        logger.warn({ userId, paymentId: data.id }, "Payment failed");
    } catch (error) {
        logger.error(
            { err: error, paymentId: data.id },
            "Error handling payment failed"
        );
    }
};

// Handle invoice paid
const handleInvoicePaid = async (data) => {
    try {
        const metadata = data.metadata || {};
        const userId = metadata.user_id;

        if (!userId) {
            logger.warn(
                { invoiceId: data.id },
                "No userId in invoice metadata"
            );
            return;
        }

        await transaction(async (client) => {
            // Update usage billing if applicable
            if (data.billing_id) {
                await client.query(
                    `UPDATE usage_billing 
           SET payment_status = 'paid',
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
                    [data.billing_id]
                );
            }

            // Reactivate services
            await client.query(
                `UPDATE users SET services_active = true WHERE id = $1`,
                [userId]
            );

            // Log activity
            await client.query(
                "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
                [
                    userId,
                    "invoice_paid",
                    JSON.stringify({ invoiceId: data.id, amount: data.amount }),
                ]
            );
        });

        logger.info(
            { userId, invoiceId: data.id },
            "Invoice paid successfully"
        );
    } catch (error) {
        logger.error(
            { err: error, invoiceId: data.id },
            "Error handling invoice paid"
        );
    }
};

// Handle invoice payment failed
const handleInvoicePaymentFailed = async (data) => {
    try {
        const metadata = data.metadata || {};
        const userId = metadata.user_id;

        if (!userId) {
            logger.warn(
                { invoiceId: data.id },
                "No userId in invoice metadata"
            );
            return;
        }

        await query(
            "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
            [
                userId,
                "invoice_payment_failed",
                JSON.stringify({
                    invoiceId: data.id,
                    reason: data.failure_reason,
                }),
            ]
        );

        logger.warn({ userId, invoiceId: data.id }, "Invoice payment failed");
    } catch (error) {
        logger.error(
            { err: error, invoiceId: data.id },
            "Error handling invoice payment failed"
        );
    }
};

export default {
    handleSkydoWebhook,
};
