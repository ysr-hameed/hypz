// HYPZ Storage Platform - Simplified Plan Configuration
// Only Free and Pay-As-You-Go plans (Global USD pricing)

export const PLANS_DATA = {
  plans: {
    free: {
      id: "free_global",
      name: "Free",
      type: "fixed",
      popular: false,
      storageGB: 1,
      bandwidthGB: 3,
      apiCalls: 50000,
      apiUpload: "unlimited",
      apiDownloadLimit: 50000,
      analytics: "none",
      customDomain: false,
      teamMembers: 1,
      autoUpgrade: false,
      renewal: "manual",
      priceUSD: 0,
      afterLimit: "stop_or_upgrade",
      // Structured features for display
      features: {
        storage: {
          amount: 1,
          unit: "GB",
          description: "1 GB of secure cloud storage"
        },
        bandwidth: {
          amount: 3,
          unit: "GB/month",
          description: "3 GB bandwidth per month (3x storage)"
        },
        apiCalls: {
          amount: 50000,
          unit: "calls/month",
          description: "50K API requests monthly"
        },
        apiUpload: {
          amount: "Unlimited",
          description: "Unlimited upload API calls"
        },
        fileUploads: {
          amount: "Unlimited",
          description: "Unlimited file uploads"
        },
        fileSize: {
          amount: 100,
          unit: "MB",
          description: "Maximum 100 MB per file"
        },
        cdnAccess: {
          included: true,
          description: "Global CDN for fast delivery"
        },
        ssl: {
          included: true,
          description: "Free SSL certificates"
        },
        customDomain: {
          included: false,
          description: "Custom domain support"
        },
        teamMembers: {
          amount: 1,
          description: "1 team member (you)"
        },
        apiKeys: {
          amount: 2,
          description: "Up to 2 API keys"
        },
        buckets: {
          amount: 3,
          description: "Up to 3 storage buckets"
        },
        analytics: {
          level: "none",
          description: "No analytics"
        },
        support: {
          level: "community",
          description: "Community support via forum"
        },
        sla: {
          uptime: "99%",
          description: "99% uptime guarantee"
        },
        backups: {
          included: false,
          description: "Automatic backups"
        },
        versioning: {
          included: false,
          description: "File versioning"
        }
      },
      limits: {
        afterLimit: "stop_or_upgrade",
        autoUpgrade: false,
        renewal: "manual"
      }
    },
    payg: {
      id: "payg_global",
      name: "Pay-As-You-Go",
      type: "scalable",
      popular: true,
      storageRateUSD: 0.05,
      bandwidthRateUSD: 0.03,
      freeStorageGB: 1,
      freeBandwidthGB: 3,
      apiFree: 50000,
      apiRateUSD: 0.008,
      apiUploadUnlimited: true,
      analytics: "advanced",
      customDomain: true,
      teamMembers: 3,
      renewal: "manual_or_auto",
      autoUpgrade: true,
      priceUSD: "usage_based",
      afterLimit: "auto_bill",
      // Structured pricing for different currencies
      pricing: {
        storage: {
          usd: 0.05,
          inr: 4.17,
          eur: 0.045,
          gbp: 0.04
        },
        bandwidth: {
          usd: 0.03,
          inr: 2.50,
          eur: 0.027,
          gbp: 0.024
        },
        apiCalls: {
          usd: 0.008,
          inr: 0.67,
          eur: 0.007,
          gbp: 0.006,
          per: 1000,
          description: "Per 1,000 calls after free tier"
        }
      },
      // Base includes (free allowance)
      baseIncludes: {
        storage: {
          amount: 1,
          unit: "GB"
        },
        bandwidth: {
          amount: 3,
          unit: "GB"
        },
        apiCalls: {
          amount: 50000,
          unit: "calls"
        },
        apiUpload: {
          amount: "Unlimited",
          description: "Upload API calls are unlimited and free"
        }
      },
      // Features for display
      features: {
        storage: {
          amount: "Unlimited",
          unit: "GB",
          description: "Unlimited scalable storage - pay as you grow"
        },
        bandwidth: {
          amount: "Unlimited",
          unit: "GB/month",
          description: "Unlimited bandwidth - scale automatically"
        },
        apiCalls: {
          amount: "Unlimited",
          unit: "calls/month",
          description: "Unlimited API requests - no hard limits"
        },
        fileUploads: {
          amount: "Unlimited",
          description: "Unlimited file uploads"
        },
        fileSize: {
          amount: 5,
          unit: "GB",
          description: "Maximum 5 GB per file"
        },
        cdnAccess: {
          included: true,
          description: "Global CDN with 50+ edge locations"
        },
        ssl: {
          included: true,
          description: "Free SSL certificates for all domains"
        },
        customDomain: {
          included: true,
          amount: "Unlimited",
          description: "Connect unlimited custom domains"
        },
        teamMembers: {
          amount: 10,
          description: "Up to 10 team members"
        },
        apiKeys: {
          amount: "Unlimited",
          description: "Create unlimited API keys"
        },
        buckets: {
          amount: "Unlimited",
          description: "Create unlimited storage buckets"
        },
        analytics: {
          level: "advanced",
          description: "Advanced analytics with custom reports"
        },
        support: {
          level: "priority",
          description: "Priority email support (24hr response)"
        },
        sla: {
          uptime: "99.9%",
          description: "99.9% uptime SLA with credits"
        },
        backups: {
          included: true,
          retention: "30 days",
          description: "Automatic daily backups (30-day retention)"
        },
        versioning: {
          included: true,
          amount: "10 versions",
          description: "Keep last 10 versions of each file"
        },
        webhooks: {
          included: true,
          description: "Real-time webhooks for events"
        },
        imageOptimization: {
          included: true,
          description: "Automatic image optimization & resizing"
        },
        videoTranscoding: {
          included: true,
          description: "Video transcoding to multiple formats"
        },
        accessControl: {
          included: true,
          description: "Advanced access control & permissions"
        },
        encryption: {
          included: true,
          description: "Encryption at rest and in transit"
        },
        cors: {
          included: true,
          description: "Custom CORS configuration"
        },
        rateLimiting: {
          included: true,
          description: "Configurable rate limiting"
        },
        ipWhitelisting: {
          included: true,
          description: "IP-based access restrictions"
        }
      },
      limits: {
        afterLimit: "auto_bill",
        autoUpgrade: true,
        renewal: "auto_or_manual"
      }
    }
  }
};

// Competitor comparison data (as array) - Top 3 competitors
export const COMPETITOR_PRICING = [
  {
    name: "AWS S3",
    logo: "🟧",
    storage: 0.023,
    bandwidth: 0.09,
    apiCalls: 0.0004,
    notes: "Complex pricing"
  },
  {
    name: "Google Cloud",
    logo: "🔵",
    storage: 0.020,
    bandwidth: 0.12,
    apiCalls: 0.0004,
    notes: "Enterprise tier"
  },
  {
    name: "Azure Storage",
    logo: "�",
    storage: 0.018,
    bandwidth: 0.087,
    apiCalls: 0.00036,
    notes: "Microsoft cloud"
  }
];

// Currency data with Razorpay and Lemon Squeezy support
export const PAYMENT_PROVIDERS = {
  razorpay: {
    name: "Razorpay",
    currencies: ["INR"],
    logo: "https://razorpay.com/favicon.png",
    methods: ["card", "upi", "netbanking", "wallet"]
  },
  lemon_squeezy: {
    name: "Lemon Squeezy",
    currencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "SGD", "NZD"],
    logo: "🍋",
    methods: ["card", "paypal", "google_pay", "apple_pay"]
  }
};

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", provider: "lemon_squeezy", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", provider: "lemon_squeezy", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", provider: "lemon_squeezy", flag: "🇬🇧" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", provider: "lemon_squeezy", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", provider: "lemon_squeezy", flag: "🇦🇺" },
];

// Utility functions
export const getPlan = (planId) => {
  return PLANS_DATA.plans[planId] || null;
};

// Alias for compatibility
export const getPlanById = getPlan;

export const formatPrice = (price, currency = 'USD') => {
  const curr = CURRENCIES.find(c => c.code === currency);
  const symbol = curr ? curr.symbol : '$';
  
  // Handle objects (from calculatePaygCost)
  if (typeof price === 'object' && price !== null) {
    if (price.total !== undefined) {
      price = price.total;
    } else if (price.formatted) {
      return price.formatted;
    }
  }
  
  // Handle special cases
  if (price === 0) return 'Free';
  if (price === 'usage_based') return 'Pay as you go';
  
  // Ensure price is a number
  const numPrice = typeof price === 'number' ? price : parseFloat(price);
  
  if (isNaN(numPrice)) return 'N/A';
  
  return `${symbol}${numPrice.toFixed(2)}`;
};

export const calculatePaygCost = (storage, bandwidth, apiCalls, currency = 'USD') => {
  const plan = PLANS_DATA.plans.payg;
  const pricing = plan.pricing;
  const includes = plan.baseIncludes;
  
  // Calculate overage
  const storageOverage = Math.max(0, storage - includes.storage.amount);
  const bandwidthOverage = Math.max(0, bandwidth - includes.bandwidth.amount);
  const apiOverage = Math.max(0, apiCalls - includes.apiCalls.amount);
  
  // Calculate costs
  const storageCost = storageOverage * pricing.storage[currency.toLowerCase()];
  const bandwidthCost = bandwidthOverage * pricing.bandwidth[currency.toLowerCase()];
  const apiCost = (apiOverage / 1000000) * pricing.apiCalls[currency.toLowerCase()];
  
  const total = storageCost + bandwidthCost + apiCost;
  
  return {
    storage: storageCost,
    bandwidth: bandwidthCost,
    api: apiCost,
    total: total,
    formatted: formatPrice(total, currency)
  };
};

export const getPaymentProvider = (currency) => {
  const curr = CURRENCIES.find(c => c.code === currency);
  return curr ? curr.provider : 'lemon_squeezy';
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
