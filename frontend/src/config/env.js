// Environment configuration
export const ENV = {
  MODE: import.meta.env.MODE, // 'development' or 'production'
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  BASE_URL: import.meta.env.BASE_URL || '/',
  
  // API endpoints
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Feature flags
  BYPASS_AUTH_IN_DEV: import.meta.env.VITE_BYPASS_AUTH_IN_DEV !== 'false', // default true in dev
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA !== 'false', // default true in dev
  
  // Payment providers
  RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY || '',
  LEMON_SQUEEZY_KEY: import.meta.env.VITE_LEMON_SQUEEZY_KEY || '',
  
  // OAuth
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  MICROSOFT_CLIENT_ID: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
};

// Helper functions
export const isDevelopment = () => ENV.IS_DEV;
export const isProduction = () => ENV.IS_PROD;
export const shouldBypassAuth = () => ENV.IS_DEV && ENV.BYPASS_AUTH_IN_DEV;

// Log environment info (only in development)
if (ENV.IS_DEV) {
  console.log('🚀 Environment Configuration:', {
    mode: ENV.MODE,
    isDev: ENV.IS_DEV,
    bypassAuth: ENV.BYPASS_AUTH_IN_DEV,
    enableMockData: ENV.ENABLE_MOCK_DATA,
  });
}

export default ENV;
