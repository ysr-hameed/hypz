import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import config from '../config/config.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Initialize Lemon Squeezy
const initializeLemonSqueezy = () => {
  if (!config.LEMONSQUEEZY_API_KEY) {
    logger.warn('Lemon Squeezy API key not configured');
    return false;
  }

  lemonSqueezySetup({
    apiKey: config.LEMONSQUEEZY_API_KEY,
    onError: (error) => logger.error({ err: error }, 'Lemon Squeezy Error')
  });

  logger.info('Lemon Squeezy initialized successfully');
  return true;
};

// Create checkout
export const createLemonSqueezyCheckout = async (variantId, customData = {}) => {
  try {
    initializeLemonSqueezy();

    const { createCheckout } = await import('@lemonsqueezy/lemonsqueezy.js');

    const checkout = await createCheckout(config.LEMONSQUEEZY_STORE_ID, variantId, {
      checkoutData: {
        custom: customData
      }
    });

    return checkout.data;
  } catch (error) {
    logger.error({ err: error }, 'Error creating Lemon Squeezy checkout');
    throw error;
  }
};

// Get subscription
export const getLemonSqueezySubscription = async (subscriptionId) => {
  try {
    initializeLemonSqueezy();

    const { getSubscription } = await import('@lemonsqueezy/lemonsqueezy.js');

    const subscription = await getSubscription(subscriptionId);
    return subscription.data;
  } catch (error) {
    logger.error({ err: error }, 'Error getting Lemon Squeezy subscription');
    throw error;
  }
};

// Cancel subscription
export const cancelLemonSqueezySubscription = async (subscriptionId) => {
  try {
    initializeLemonSqueezy();

    const { cancelSubscription } = await import('@lemonsqueezy/lemonsqueezy.js');

    const result = await cancelSubscription(subscriptionId);
    return result.data;
  } catch (error) {
    logger.error({ err: error }, 'Error canceling Lemon Squeezy subscription');
    throw error;
  }
};

// Update subscription
export const updateLemonSqueezySubscription = async (subscriptionId, data) => {
  try {
    initializeLemonSqueezy();

    const { updateSubscription } = await import('@lemonsqueezy/lemonsqueezy.js');

    const result = await updateSubscription(subscriptionId, data);
    return result.data;
  } catch (error) {
    logger.error({ err: error }, 'Error updating Lemon Squeezy subscription');
    throw error;
  }
};

// Verify webhook signature
export const verifyLemonSqueezyWebhook = (payload, signature) => {
  try {
    const hmac = crypto.createHmac('sha256', config.LEMONSQUEEZY_WEBHOOK_SECRET);
    const digest = hmac.update(payload).digest('hex');
    // Use timingSafeEqual to prevent timing attacks
    const sigBuffer = Buffer.from(signature || '', 'utf8');
    const digestBuffer = Buffer.from(digest, 'utf8');
    if (sigBuffer.length !== digestBuffer.length) return false;
    return crypto.timingSafeEqual(digestBuffer, sigBuffer);
  } catch (error) {
    logger.error({ err: error }, 'Error verifying Lemon Squeezy webhook');
    return false;
  }
};

// Get all products
export const getLemonSqueezyProducts = async () => {
  try {
    initializeLemonSqueezy();

    const { listProducts } = await import('@lemonsqueezy/lemonsqueezy.js');

    const products = await listProducts({
      filter: { storeId: config.LEMONSQUEEZY_STORE_ID }
    });

    return products.data;
  } catch (error) {
    logger.error({ err: error }, 'Error getting Lemon Squeezy products');
    throw error;
  }
};

export default {
  createLemonSqueezyCheckout,
  getLemonSqueezySubscription,
  cancelLemonSqueezySubscription,
  updateLemonSqueezySubscription,
  verifyLemonSqueezyWebhook,
  getLemonSqueezyProducts
};
