import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import config from '../config/config.js';
import crypto from 'crypto';

// Initialize Lemon Squeezy
const initializeLemonSqueezy = () => {
  if (!config.LEMONSQUEEZY_API_KEY) {
    console.warn('⚠️  Lemon Squeezy API key not configured');
    return false;
  }

  lemonSqueezySetup({
    apiKey: config.LEMONSQUEEZY_API_KEY,
    onError: (error) => console.error('Lemon Squeezy Error:', error)
  });

  console.log('✅ Lemon Squeezy initialized successfully');
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
    console.error('Error creating Lemon Squeezy checkout:', error);
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
    console.error('Error getting Lemon Squeezy subscription:', error);
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
    console.error('Error canceling Lemon Squeezy subscription:', error);
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
    console.error('Error updating Lemon Squeezy subscription:', error);
    throw error;
  }
};

// Verify webhook signature
export const verifyLemonSqueezyWebhook = (payload, signature) => {
  try {
    const hmac = crypto.createHmac('sha256', config.LEMONSQUEEZY_WEBHOOK_SECRET);
    const digest = hmac.update(payload).digest('hex');
    return digest === signature;
  } catch (error) {
    console.error('Error verifying Lemon Squeezy webhook:', error);
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
    console.error('Error getting Lemon Squeezy products:', error);
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
