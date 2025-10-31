// HYPZ Storage Platform - Plan Configuration
// This file contains all plan pricing and feature data

export const PLANS_DATA = {
  plans: {
    india: {
      free: {
        id: "free_india",
        name: "Free",
        type: "fixed",
        storageGB: 1,
        bandwidthGB: 5,
        apiCalls: 50000,
        apiUpload: "unlimited",
        apiDownloadLimit: 50000,
        analytics: "none",
        customDomain: false,
        teamMembers: 1,
        autoUpgrade: false,
        renewal: "manual",
        priceINR: 0,
        afterLimit: "stop_or_upgrade"
      },
      payg: {
        id: "payg_india",
        name: "Pay-As-You-Go",
        type: "scalable",
        storageRateINR: 5,
        bandwidthRateINR: 10,
        freeStorageGB: 1,
        freeBandwidthGB: 2,
        apiFree: 50000,
        apiRateINR: 1,
        analytics: "advanced",
        customDomain: true,
        teamMembers: 3,
        renewal: "manual_or_auto",
        autoUpgrade: true,
        priceINR: "usage_based",
        afterLimit: "auto_bill"
      },
      starter: {
        id: "starter_india",
        name: "Starter",
        type: "fixed",
        storageGB: 50,
        bandwidthGB: 150,
        apiCalls: 500000,
        apiUpload: "unlimited",
        analytics: "advanced",
        customDomain: true,
        teamMembers: 5,
        autoUpgrade: true,
        renewal: "auto",
        priceINR: 299,
        afterLimit: "throttle_and_alert"
      },
      pro: {
        id: "pro_india",
        name: "Pro",
        type: "fixed",
        storageGB: 200,
        bandwidthGB: 600,
        apiCalls: 2500000,
        apiUpload: "unlimited",
        analytics: "advanced",
        customDomain: true,
        teamMembers: 10,
        autoUpgrade: true,
        renewal: "auto",
        priceINR: 999,
        afterLimit: "throttle_and_alert"
      },
      business: {
        id: "business_india",
        name: "Business",
        type: "fixed",
        storageGB: 1000,
        bandwidthGB: 3000,
        apiCalls: 10000000,
        apiUpload: "unlimited",
        analytics: "advanced",
        customDomain: true,
        teamMembers: 25,
        autoUpgrade: true,
        renewal: "auto",
        priceINR: 2999,
        afterLimit: "contact_support"
      }
    },
    global: {
      free: {
        id: "free_global",
        name: "Free",
        type: "fixed",
        storageGB: 1,
        bandwidthGB: 5,
        apiCalls: 50000,
        apiUpload: "unlimited",
        apiDownloadLimit: 50000,
        analytics: "none",
        customDomain: false,
        teamMembers: 1,
        autoUpgrade: false,
        renewal: "manual",
        priceUSD: 0,
        afterLimit: "stop_or_upgrade"
      },
      payg: {
        id: "payg_global",
        name: "Pay-As-You-Go",
        type: "scalable",
        storageRateUSD: 0.10,
        bandwidthRateUSD: 0.20,
        freeStorageGB: 1,
        freeBandwidthGB: 2,
        apiFree: 50000,
        apiRateUSD: 0.012,
        analytics: "advanced",
        customDomain: true,
        teamMembers: 3,
        renewal: "manual_or_auto",
        autoUpgrade: true,
        priceUSD: "usage_based",
        afterLimit: "auto_bill"
      },
      starter: {
        id: "starter_global",
        name: "Starter",
        type: "fixed",
        storageGB: 50,
        bandwidthGB: 150,
        apiCalls: 500000,
        apiUpload: "unlimited",
        analytics: "advanced",
        customDomain: true,
        teamMembers: 5,
        autoUpgrade: true,
        renewal: "auto",
        priceUSD: 5,
        afterLimit: "throttle_and_alert"
      },
      pro: {
        id: "pro_global",
        name: "Pro",
        type: "fixed",
        storageGB: 200,
        bandwidthGB: 600,
        apiCalls: 2500000,
        apiUpload: "unlimited",
        analytics: "advanced",
        customDomain: true,
        teamMembers: 10,
        autoUpgrade: true,
        renewal: "auto",
        priceUSD: 15,
        afterLimit: "throttle_and_alert"
      },
      business: {
        id: "business_global",
        name: "Business",
        type: "fixed",
        storageGB: 1000,
        bandwidthGB: 3000,
        apiCalls: 10000000,
        apiUpload: "unlimited",
        analytics: "advanced",
        customDomain: true,
        teamMembers: 25,
        autoUpgrade: true,
        renewal: "auto",
        priceUSD: 40,
        afterLimit: "contact_support"
      }
    }
  }
};

// Utility functions
export const getPlanByRegion = (region = 'india') => {
  return PLANS_DATA.plans[region] || PLANS_DATA.plans.india;
};

export const getPlanById = (planId) => {
  for (const region in PLANS_DATA.plans) {
    for (const planKey in PLANS_DATA.plans[region]) {
      const plan = PLANS_DATA.plans[region][planKey];
      if (plan.id === planId) {
        return plan;
      }
    }
  }
  return null;
};

export const formatPrice = (price, currency = 'INR') => {
  if (price === 0) return 'Free';
  if (price === 'usage_based') return 'Pay as you go';
  return currency === 'INR' ? `₹${price}` : `$${price}`;
};

export const formatStorage = (gb) => {
  if (gb >= 1000) return `${gb / 1000}TB`;
  return `${gb}GB`;
};

export const formatBandwidth = (gb) => {
  if (gb >= 1000) return `${gb / 1000}TB`;
  return `${gb}GB`;
};

export const formatApiCalls = (calls) => {
  if (calls >= 1000000) return `${calls / 1000000}M`;
  if (calls >= 1000) return `${calls / 1000}K`;
  return calls;
};

export const getAfterLimitText = (afterLimit) => {
  const texts = {
    'stop_or_upgrade': 'Service stops or upgrade required',
    'auto_bill': 'Automatic billing for overages',
    'throttle_and_alert': 'Throttle and send alerts',
    'contact_support': 'Contact support for custom limits'
  };
  return texts[afterLimit] || afterLimit;
};

export const getRenewalText = (renewal) => {
  const texts = {
    'manual': 'Manual Renewal',
    'auto': 'Auto Renewal',
    'manual_or_auto': 'Manual or Auto Renewal'
  };
  return texts[renewal] || renewal;
};

// Mock user data for development
export const mockUserData = {
  userId: 'user_123456',
  email: 'user@example.com',
  name: 'Demo User',
  region: 'india',
  currentPlan: {
    planId: 'pro_global',
    startDate: '2025-10-01',
    renewalDate: '2025-11-01',
    renewalType: 'manual',
    autoUpgrade: false
  },
  usage: {
    storage: {
      used: 0.5, // GB
      limit: 1
    },
    bandwidth: {
      used: 2.3, // GB
      limit: 5
    },
    apiCalls: {
      used: 12500,
      limit: 50000
    },
    apiDownload: {
      used: 8000,
      limit: 50000
    }
  },
  buckets: [],
  apiKeys: [],
  teamMembers: [
    {
      id: 'user_123456',
      name: 'Demo User',
      email: 'user@example.com',
      role: 'owner',
      joinedAt: '2025-10-01'
    }
  ]
};

// Simulated API call to fetch user plan (replace with real API later)
export const fetchUserPlan = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const plan = getPlanById(mockUserData.currentPlan.planId);
      resolve({
        ...mockUserData,
        planDetails: plan
      });
    }, 500);
  });
};

// Calculate usage percentage
export const getUsagePercentage = (used, limit) => {
  if (limit === 'unlimited' || limit === 0) return 0;
  return Math.min((used / limit) * 100, 100);
};

// Check if user can access feature based on plan
export const canAccessFeature = (userPlan, feature) => {
  const featureChecks = {
    customDomain: () => userPlan?.customDomain === true,
    advancedAnalytics: () => userPlan?.analytics === 'advanced',
    autoUpgrade: () => userPlan?.autoUpgrade === true,
    teamMembers: (count) => count < userPlan?.teamMembers
  };
  
  return featureChecks[feature] ? featureChecks[feature]() : false;
};

export default PLANS_DATA;
