import { successResponse } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';
import config from '../config/config.js';

// Get public configuration for frontend
export const getPublicConfig = asyncHandler(async (req, res) => {
  const publicConfig = {
    environment: config.NODE_ENV,
    apiVersion: config.API_VERSION,
    payment: {
      razorpay: {
        keyId: config.RAZORPAY_KEY_ID || null
      },
      lemonSqueezy: {
        storeId: config.LEMONSQUEEZY_STORE_ID || null
      }
    },
    features: {
      oauth: {
        google: !!(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET),
        github: !!(config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET)
      }
    }
  };

  successResponse(res, publicConfig);
});
