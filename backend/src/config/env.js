import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Backblaze B2
  b2: {
    keyId: process.env.B2_KEY_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
    bucketName: process.env.B2_BUCKET_NAME,
    bucketId: process.env.B2_BUCKET_ID,
    region: process.env.B2_REGION || 'us-west-002',
    endpoint: process.env.B2_ENDPOINT,
  },

  // File Storage
  storage: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB
    freePlan: parseInt(process.env.FREE_PLAN_STORAGE) || 1024 * 1024 * 1024, // 1GB
    proPlan: parseInt(process.env.PRO_PLAN_STORAGE) || 100 * 1024 * 1024 * 1024, // 100GB
    enterprisePlan: parseInt(process.env.ENTERPRISE_PLAN_STORAGE) || 1024 * 1024 * 1024 * 1024, // 1TB
  },

  // Razorpay
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // File Cleanup
  cleanup: {
    retentionDays: parseInt(process.env.FILE_RETENTION_DAYS) || 90,
    tempFileCleanupHours: parseInt(process.env.TEMP_FILE_CLEANUP_HOURS) || 24,
  },

  // Plans
  plans: {
    free: {
      name: 'Free',
      price: 0,
      storage: 1024 * 1024 * 1024, // 1GB
      bandwidth: 5 * 1024 * 1024 * 1024, // 5GB
      maxFileSize: 50 * 1024 * 1024, // 50MB
      apiCalls: 1000,
    },
    pro: {
      name: 'Pro',
      price: 499, // INR
      storage: 100 * 1024 * 1024 * 1024, // 100GB
      bandwidth: 500 * 1024 * 1024 * 1024, // 500GB
      maxFileSize: 500 * 1024 * 1024, // 500MB
      apiCalls: 50000,
    },
    enterprise: {
      name: 'Enterprise',
      price: 2999, // INR
      storage: 1024 * 1024 * 1024 * 1024, // 1TB
      bandwidth: 5 * 1024 * 1024 * 1024 * 1024, // 5TB
      maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
      apiCalls: 500000,
    },
  },
};
