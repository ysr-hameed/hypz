/**
 * LemonSqueezy Plan Configuration
 * 
 * Store all your LemonSqueezy variant IDs here
 * Get these IDs from: https://app.lemonsqueezy.com/products
 */

export const LEMONSQUEEZY_VARIANTS = {
  // Pro Plan - Fixed monthly subscription
  PRO_MONTHLY: '1080591',        // $5/month - Your current variant
  PRO_ANNUAL: null,              // TODO: Create annual variant (optional)
  
  // Pay-as-you-go Plan - Usage-based billing
  PAYG_BASE: null,               // TODO: Create $0 base subscription
};

/**
 * Pricing configuration for usage-based billing
 */
export const USAGE_PRICING = {
  // Pay-as-you-go rates
  PAYG: {
    STORAGE_PER_GB: 0.10,        // $0.10 per GB of storage per month
    BANDWIDTH_PER_GB: 0.05,      // $0.05 per GB of bandwidth per month
    API_CALLS_PER_1K: 0.01,      // $0.01 per 1000 API calls (optional)
    BASE_FEE: 0,                 // $0 base subscription
    MINIMUM_CHARGE: 1.00,        // Minimum $1 charge if any usage
  },
  
  // Free plan limits (no charge, enforced in app)
  FREE: {
    STORAGE_GB: 1,               // 1GB storage
    BANDWIDTH_GB: 10,            // 10GB bandwidth per month
    API_CALLS: 1000,             // 1000 API calls per month
  },
  
  // Pro plan included usage (fixed $5/month)
  PRO: {
    STORAGE_GB: 50,              // 50GB storage
    BANDWIDTH_GB: 500,           // 500GB bandwidth per month
    API_CALLS: 100000,           // 100k API calls per month
  },
};

/**
 * Plan metadata for frontend display
 */
export const PLAN_INFO = {
  FREE: {
    id: 1,
    name: 'Free',
    type: 'free',
    price: 0,
    interval: null,
    features: [
      '1GB Storage',
      '10GB Bandwidth/month',
      'Basic support',
      'Community access',
    ],
  },
  
  PRO: {
    id: 2,
    name: 'Pro',
    type: 'subscription',
    price: 5,
    interval: 'monthly',
    variantId: LEMONSQUEEZY_VARIANTS.PRO_MONTHLY,
    features: [
      '50GB Storage',
      '500GB Bandwidth/month',
      'Priority support',
      'Custom domain',
      'API access',
      'Team collaboration',
    ],
  },
  
  PAYG: {
    id: 3,
    name: 'Pay-as-you-go',
    type: 'usage',
    price: 0,
    interval: 'monthly',
    variantId: LEMONSQUEEZY_VARIANTS.PAYG_BASE,
    features: [
      'Pay only for what you use',
      '$0.10 per GB storage',
      '$0.05 per GB bandwidth',
      'No minimum commitment',
      'Scale automatically',
      'Detailed usage analytics',
    ],
    pricing: USAGE_PRICING.PAYG,
  },
};

/**
 * Helper function to get variant ID by plan type
 */
export const getVariantId = (planType) => {
  switch (planType) {
    case 'pro':
    case 'PRO':
      return LEMONSQUEEZY_VARIANTS.PRO_MONTHLY;
    case 'payg':
    case 'PAYG':
      return LEMONSQUEEZY_VARIANTS.PAYG_BASE;
    default:
      return null;
  }
};

/**
 * Calculate PAYG charges based on usage
 */
export const calculatePAYGCharge = (storageBytes, bandwidthBytes, apiCalls = 0) => {
  const storageGB = storageBytes / (1024 * 1024 * 1024);
  const bandwidthGB = bandwidthBytes / (1024 * 1024 * 1024);
  
  const storageCharge = storageGB * USAGE_PRICING.PAYG.STORAGE_PER_GB;
  const bandwidthCharge = bandwidthGB * USAGE_PRICING.PAYG.BANDWIDTH_PER_GB;
  const apiCharge = (apiCalls / 1000) * USAGE_PRICING.PAYG.API_CALLS_PER_1K;
  
  let totalCharge = storageCharge + bandwidthCharge + apiCharge + USAGE_PRICING.PAYG.BASE_FEE;
  
  // Apply minimum charge if there's any usage
  if (totalCharge > 0 && totalCharge < USAGE_PRICING.PAYG.MINIMUM_CHARGE) {
    totalCharge = USAGE_PRICING.PAYG.MINIMUM_CHARGE;
  }
  
  return {
    storageGB: storageGB.toFixed(2),
    bandwidthGB: bandwidthGB.toFixed(2),
    apiCalls,
    storageCharge: storageCharge.toFixed(2),
    bandwidthCharge: bandwidthCharge.toFixed(2),
    apiCharge: apiCharge.toFixed(2),
    totalCharge: totalCharge.toFixed(2),
  };
};

export default {
  LEMONSQUEEZY_VARIANTS,
  USAGE_PRICING,
  PLAN_INFO,
  getVariantId,
  calculatePAYGCharge,
};
