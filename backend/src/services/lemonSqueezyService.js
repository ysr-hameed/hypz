import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';

// Initialize LemonSqueezy client
const configureLemonSqueezy = () => {
  if (!config.LEMONSQUEEZY_API_KEY) {
    logger.warn('LemonSqueezy API key not configured');
    return null;
  }

  lemonSqueezySetup({
    apiKey: config.LEMONSQUEEZY_API_KEY,
    onError: (error) => {
      logger.error({ err: error }, 'LemonSqueezy API Error');
      throw new Error(`LemonSqueezy Error: ${error.message || error}`);
    }
  });

  return true;
};

/**
 * Create a checkout session for a subscription
 * @param {string} variantId - LemonSqueezy variant ID
 * @param {object} customData - Custom data to attach to checkout
 * @returns {Promise<object>} Checkout data with URL
 */
export const createLemonSqueezyCheckout = async (variantId, customData = {}) => {
  try {
    if (!configureLemonSqueezy()) {
      throw new Error('LemonSqueezy is not configured. Please set LEMONSQUEEZY_API_KEY in your environment.');
    }

    const { createCheckout } = await import('@lemonsqueezy/lemonsqueezy.js');

    if (!config.LEMONSQUEEZY_STORE_ID) {
      throw new Error('LEMONSQUEEZY_STORE_ID is not configured');
    }

    if (!variantId) {
      throw new Error('Variant ID is required');
    }

    // Ensure IDs are integers
    const storeId = parseInt(config.LEMONSQUEEZY_STORE_ID, 10);
    const numericVariantId = parseInt(variantId, 10);

    if (isNaN(storeId) || isNaN(numericVariantId)) {
      throw new Error('Store ID and Variant ID must be valid numbers');
    }

    logger.info({ 
      storeId, 
      variantId: numericVariantId, 
      customData 
    }, 'Creating LemonSqueezy checkout');

    const checkoutData = {
      productOptions: {
        redirectUrl: `${config.FRONTEND_URL}/billing?session=success`,
      },
      checkoutData: {
        email: customData.email || undefined,
        custom: customData,
      },
    };

    const { data, error } = await createCheckout(
      storeId,
      numericVariantId,
      checkoutData
    );

    if (error) {
      logger.error({ error, variantId: numericVariantId, storeId }, 'Failed to create LemonSqueezy checkout');
      throw new Error(error.message || 'Failed to create checkout');
    }

    if (!data || !data.data) {
      logger.error({ data }, 'Invalid response from LemonSqueezy');
      throw new Error('Invalid response from LemonSqueezy');
    }

    const checkoutUrl = data.data.attributes?.url;
    const checkoutId = data.data.id;
    
    logger.info({ checkoutId, checkoutUrl }, 'Checkout created successfully');
    
    // Return the checkout data with proper structure
    return {
      id: checkoutId,
      url: checkoutUrl,
      attributes: data.data.attributes,
      ...data.data
    };
  } catch (error) {
    logger.error({ err: error, variantId }, 'Error creating LemonSqueezy checkout');
    throw error;
  }
};

/**
 * Get subscription details from LemonSqueezy
 * @param {string} subscriptionId - LemonSqueezy subscription ID
 * @returns {Promise<object>} Subscription data
 */
export const getLemonSqueezySubscription = async (subscriptionId) => {
  try {
    if (!configureLemonSqueezy()) {
      throw new Error('LemonSqueezy is not configured');
    }

    const { getSubscription } = await import('@lemonsqueezy/lemonsqueezy.js');

    const { data, error } = await getSubscription(subscriptionId);

    if (error) {
      throw new Error(error.message || 'Failed to get subscription');
    }

    return data;
  } catch (error) {
    logger.error({ err: error, subscriptionId }, 'Error getting LemonSqueezy subscription');
    throw error;
  }
};

/**
 * Cancel a subscription
 * @param {string} subscriptionId - LemonSqueezy subscription ID
 * @returns {Promise<object>} Updated subscription data
 */
export const cancelLemonSqueezySubscription = async (subscriptionId) => {
  try {
    if (!configureLemonSqueezy()) {
      throw new Error('LemonSqueezy is not configured');
    }

    const { cancelSubscription } = await import('@lemonsqueezy/lemonsqueezy.js');

    const { data, error } = await cancelSubscription(subscriptionId);

    if (error) {
      throw new Error(error.message || 'Failed to cancel subscription');
    }

    logger.info({ subscriptionId }, 'Subscription cancelled successfully');
    
    return data;
  } catch (error) {
    logger.error({ err: error, subscriptionId }, 'Error cancelling LemonSqueezy subscription');
    throw error;
  }
};

/**
 * Create an invoice for usage-based billing
 * @param {string} subscriptionId - LemonSqueezy subscription ID
 * @param {number} amount - Amount in cents
 * @param {string} description - Invoice description
 * @returns {Promise<object>} Invoice data
 */
export const createLemonSqueezyInvoice = async (subscriptionId, amount, description) => {
  try {
    if (!configureLemonSqueezy()) {
      throw new Error('LemonSqueezy is not configured');
    }

    // Note: LemonSqueezy doesn't have a direct invoice creation API
    // You'll need to use subscription usage records or custom charges
    // This is a placeholder for the actual implementation
    
    logger.info({ subscriptionId, amount, description }, 'Creating usage-based invoice');

    // For now, we'll log this and handle it through webhooks
    // You may need to implement this using LemonSqueezy's subscription update API
    throw new Error('Invoice creation not yet implemented for LemonSqueezy');
  } catch (error) {
    logger.error({ err: error, subscriptionId }, 'Error creating LemonSqueezy invoice');
    throw error;
  }
};

/**
 * Verify webhook signature
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Webhook signature from headers
 * @returns {boolean} Whether signature is valid
 */
export const verifyLemonSqueezyWebhook = (payload, signature) => {
  try {
    const crypto = require('crypto');
    
    if (!config.LEMONSQUEEZY_WEBHOOK_SECRET) {
      logger.warn('LemonSqueezy webhook secret not configured');
      return false;
    }

    const hmac = crypto.createHmac('sha256', config.LEMONSQUEEZY_WEBHOOK_SECRET);
    const digest = hmac.update(payload).digest('hex');

    return signature === digest;
  } catch (error) {
    logger.error({ err: error }, 'Error verifying LemonSqueezy webhook');
    return false;
  }
};

export default {
  createLemonSqueezyCheckout,
  getLemonSqueezySubscription,
  cancelLemonSqueezySubscription,
  createLemonSqueezyInvoice,
  verifyLemonSqueezyWebhook,
};
