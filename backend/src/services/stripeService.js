import Stripe from 'stripe';
import config from '../config/config.js';
import logger from '../utils/logger.js';

// Initialize Stripe
let stripe;

const initializeStripe = () => {
  if (!config.STRIPE_SECRET_KEY) {
    logger.warn('Stripe secret key not configured');
    return null;
  }

  if (!stripe) {
    stripe = new Stripe(config.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
    logger.info('Stripe initialized successfully');
  }

  return stripe;
};

// Create Stripe checkout session
export const createStripeCheckoutSession = async (priceId, customData = {}) => {
  try {
    const stripeClient = initializeStripe();
    if (!stripeClient) {
      throw new Error('Stripe not configured');
    }

    const { userId, planId, userEmail, successUrl, cancelUrl } = customData;

    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: String(userId),
      metadata: {
        userId: String(userId),
        planId: String(planId),
      },
      success_url: successUrl || `${config.FRONTEND_URL}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${config.FRONTEND_URL}/plans?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: {
          userId: String(userId),
          planId: String(planId),
        },
      },
    });

    return session;
  } catch (error) {
    logger.error({ err: error }, 'Error creating Stripe checkout session');
    throw error;
  }
};

// Get Stripe subscription
export const getStripeSubscription = async (subscriptionId) => {
  try {
    const stripeClient = initializeStripe();
    if (!stripeClient) {
      throw new Error('Stripe not configured');
    }

    const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    logger.error({ err: error }, 'Error getting Stripe subscription');
    throw error;
  }
};

// Cancel Stripe subscription
export const cancelStripeSubscription = async (subscriptionId) => {
  try {
    const stripeClient = initializeStripe();
    if (!stripeClient) {
      throw new Error('Stripe not configured');
    }

    const subscription = await stripeClient.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    logger.error({ err: error }, 'Error canceling Stripe subscription');
    throw error;
  }
};

// Update Stripe subscription
export const updateStripeSubscription = async (subscriptionId, data) => {
  try {
    const stripeClient = initializeStripe();
    if (!stripeClient) {
      throw new Error('Stripe not configured');
    }

    const subscription = await stripeClient.subscriptions.update(subscriptionId, data);
    return subscription;
  } catch (error) {
    logger.error({ err: error }, 'Error updating Stripe subscription');
    throw error;
  }
};

// Verify Stripe webhook signature
export const verifyStripeWebhook = (payload, signature) => {
  try {
    const stripeClient = initializeStripe();
    if (!stripeClient) {
      throw new Error('Stripe not configured');
    }

    if (!config.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Stripe webhook secret not configured');
    }

    const event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      config.STRIPE_WEBHOOK_SECRET
    );

    return event;
  } catch (error) {
    logger.error({ err: error }, 'Error verifying Stripe webhook');
    throw error;
  }
};

// Create customer portal session (for managing subscriptions)
export const createStripeCustomerPortalSession = async (customerId, returnUrl) => {
  try {
    const stripeClient = initializeStripe();
    if (!stripeClient) {
      throw new Error('Stripe not configured');
    }

    const session = await stripeClient.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${config.FRONTEND_URL}/dashboard/billing`,
    });

    return session;
  } catch (error) {
    logger.error({ err: error }, 'Error creating Stripe customer portal session');
    throw error;
  }
};

export default {
  createStripeCheckoutSession,
  getStripeSubscription,
  cancelStripeSubscription,
  updateStripeSubscription,
  verifyStripeWebhook,
  createStripeCustomerPortalSession,
};
