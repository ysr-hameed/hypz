// API Configuration for Frontend

const deriveApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, '');
    return `${origin}/api/v1`;
  }

  return 'http://localhost:5000/api/v1';
};

const config = {
  // Backend API URL
  API_URL: deriveApiUrl(),
  
  // API Endpoints
  endpoints: {
    // Auth
    register: '/auth/register',
    login: '/auth/login',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    getCurrentUser: '/auth/me',
    logout: '/auth/logout',

    // Buckets
    buckets: '/buckets',
    bucket: (id) => `/buckets/${id}`,
    bucketStats: (id) => `/buckets/${id}/stats`,

    // Files - Mounted at /api/v1/files
    uploadFile: (bucketId) => `/files/${bucketId}/upload`,
    getFiles: (bucketId) => `/files/${bucketId}/files`,
    getFile: (fileId) => `/files/file/${fileId}`,
    downloadFile: (fileId) => `/files/file/${fileId}/download`,
    deleteFile: (fileId) => `/files/file/${fileId}`,
    updateFile: (fileId) => `/files/file/${fileId}`,

    // API Keys
    apiKeys: '/api-keys',
    apiKey: (id) => `/api-keys/${id}`,
    regenerateApiKey: (id) => `/api-keys/${id}/regenerate`,

    // Usage
    currentUsage: '/usage/current',
    usageHistory: '/usage/history',
    usageAnalytics: '/usage/analytics',

    // User Profile
    userProfile: '/user/profile',
    changePassword: '/user/change-password',
    notificationPreferences: '/user/notifications',
    deleteAccount: '/user/account'
  },

  // Request timeout (ms)
  timeout: 30000,

  // Max file upload size (bytes)
  maxFileSize: 104857600, // 100MB
};

export default config;
