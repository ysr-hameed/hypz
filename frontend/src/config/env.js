// Simple environment configuration - only API URL determination
// All other config should be fetched from backend /api/v1/config/public

const isDevelopment = import.meta.env.MODE === 'development';

export const ENV = {
  // API URL based on environment
  API_URL: isDevelopment 
    ? 'http://localhost:5000/api/v1'
    : (import.meta.env.VITE_API_URL || window.location.origin + '/api/v1')
};

export default ENV;

