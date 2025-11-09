import axios from 'axios';
import apiConfig from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: apiConfig.API_URL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const trusted = localStorage.getItem('trustedDeviceToken');
    if (trusted) {
      config.headers['x-trusted-device'] = trusted;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    // Preserve standard API response shape { success, message, data }
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }

      // Return error message from server
      return Promise.reject(data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.'
      });
    } else {
      // Something else happened
      return Promise.reject({
        success: false,
        message: error.message || 'An unexpected error occurred'
      });
    }
  }
);

// API Service functions
export const configAPI = {
  getPublicConfig: () => api.get('/config/public')
};

export const authAPI = {
  register: (data) => api.post(apiConfig.endpoints.register, data),
  login: (data) => api.post(apiConfig.endpoints.login, data),
  verifyEmail: (token) => api.post(apiConfig.endpoints.verifyEmail, { token }),
  resendVerification: (email) => api.post(apiConfig.endpoints.resendVerification, { email }),
  forgotPassword: (email) => api.post(apiConfig.endpoints.forgotPassword, { email }),
  resetPassword: (token, password) => api.post(apiConfig.endpoints.resetPassword, { token, password }),
  getCurrentUser: () => api.get(apiConfig.endpoints.getCurrentUser),
  logout: (refreshToken) => api.post(apiConfig.endpoints.logout, { refreshToken }),
  googleOAuth: (code) => api.post('/oauth/google', { code }),
  githubOAuth: (code) => api.post('/oauth/github', { code }),
  getOAuthUrls: () => api.get('/oauth/urls')
};

export const bucketAPI = {
  create: (data) => api.post(apiConfig.endpoints.buckets, data),
  getAll: (params) => api.get(apiConfig.endpoints.buckets, { params }),
  getById: (id) => api.get(apiConfig.endpoints.bucket(id)),
  update: (id, data) => api.put(apiConfig.endpoints.bucket(id), data),
  delete: (id) => api.delete(apiConfig.endpoints.bucket(id)),
  getStats: (id) => api.get(apiConfig.endpoints.bucketStats(id))
};

export const fileAPI = {
  upload: (bucketId, formData, onUploadProgress) => {
    return api.post(apiConfig.endpoints.uploadFile(bucketId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
  },
  // Presigned upload flow (direct to B2)
  initiatePresignedUpload: (bucketId, fileInfo) => {
    return api.post(`/buckets/${bucketId}/files/presigned`, fileInfo);
  },
  completePresignedUpload: (fileId, uploadInfo) => {
    return api.post(`/files/file/${fileId}/complete`, uploadInfo);
  },
  getAll: (bucketId, params) => api.get(apiConfig.endpoints.getFiles(bucketId), { params }),
  getById: (fileId) => api.get(apiConfig.endpoints.getFile(fileId)),
  download: (fileId) => {
    // For download, we need the full URL since it returns a file, not JSON
    const token = localStorage.getItem('token');
    return Promise.resolve({
      downloadUrl: `${apiConfig.API_URL}${apiConfig.endpoints.downloadFile(fileId)}?token=${token}`
    });
  },
  delete: (fileId) => api.delete(apiConfig.endpoints.deleteFile(fileId)),
  update: (fileId, data) => api.patch(apiConfig.endpoints.updateFile(fileId), data)
};

export const apiKeyAPI = {
  create: (data) => api.post(apiConfig.endpoints.apiKeys, data),
  getAll: () => api.get(apiConfig.endpoints.apiKeys),
  getById: (id) => api.get(apiConfig.endpoints.apiKey(id)),
  update: (id, data) => api.put(apiConfig.endpoints.apiKey(id), data),
  delete: (id) => api.delete(apiConfig.endpoints.apiKey(id)),
  regenerate: (id) => api.post(apiConfig.endpoints.regenerateApiKey(id))
};

export const usageAPI = {
  getCurrent: () => api.get(apiConfig.endpoints.currentUsage),
  getHistory: (days) => api.get(apiConfig.endpoints.usageHistory, { params: { days } }),
  getAnalytics: () => api.get(apiConfig.endpoints.usageAnalytics)
};

export const plansAPI = {
  getAll: () => api.get('/plans'),
  getOne: (id) => api.get(`/plans/${id}`),
  getUserPlan: () => api.get('/plans/user/current'),
  updateUserPlan: (planId) => api.put('/plans/user/update', { planId })
};

export const paymentAPI = {
  createRazorpayOrder: (data) => api.post('/payments/razorpay/create', data),
  verifyRazorpayPayment: (data) => api.post('/payments/razorpay/verify', data),
  createStripeCheckout: (data) => api.post('/payments/stripe/checkout', data),
  getPaymentHistory: (params) => api.get('/payments/history', { params })
};

export const twoFactorAPI = {
  sendOTP: (email) => api.post('/auth/otp/send', { email }),
  verifyOTP: (email, otp) => api.post('/auth/otp/verify', { email, otp }),
  send2FACode: (email) => api.post('/auth/2fa/send-code', { email }),
  verify2FALogin: (email, code, useBackupCode = false) => api.post('/auth/2fa/verify-login', { email, code, useBackupCode }),
  setup2FA: () => api.post('/auth/2fa/setup'),
  enable2FA: (token) => api.post('/auth/2fa/enable', { token }),
  disable2FA: (password) => api.post('/auth/2fa/disable', { password }),
  get2FAStatus: () => api.get('/auth/2fa/status')
  ,
  getTrustedDevices: () => api.get('/auth/2fa/trusted'),
  revokeTrustedDevice: (id) => api.delete(`/auth/2fa/trusted/${id}`)
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/change-password', data),
  getNotificationPreferences: () => api.get('/user/notifications'),
  updateNotificationPreferences: (data) => api.put('/user/notifications', data),
  deleteAccount: (data) => api.delete('/user/account', { data })
};

export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  // Admin endpoints
  createNotification: (data) => api.post('/notifications', data),
  sendBulkNotification: (data) => api.post('/notifications/bulk', data),
  getAllNotifications: (params) => api.get('/notifications/admin/all', { params }),
  getStats: () => api.get('/notifications/admin/stats'),
  deleteNotificationAdmin: (notificationId) => api.delete(`/notifications/admin/${notificationId}`)
};

export const adminAPI = {
  // Settings
  getSettings: () => api.get('/admin/settings'),
  getSetting: (key) => api.get(`/admin/settings/${key}`),
  updateSetting: (key, value) => api.put(`/admin/settings/${key}`, { value }),
  
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, isActive) => api.patch(`/admin/users/${userId}/status`, { isActive }),
  
  // Stats
  getSystemStats: () => api.get('/admin/stats'),
  
  // Logs
  getActivityLogs: (params) => api.get('/admin/logs', { params }),

  // Plans
  getAllPlans: () => api.get('/admin/plans'),
  createPlan: (data) => api.post('/admin/plans', data),
  updatePlan: (planId, data) => api.put(`/admin/plans/${planId}`, data),
  deletePlan: (planId) => api.delete(`/admin/plans/${planId}`),

  // Webhooks
  getAllWebhooks: (params) => api.get('/admin/webhooks', { params }),
  getWebhookDeliveries: (subscriptionId, params) => api.get(`/admin/webhooks/${subscriptionId}/deliveries`, { params }),
  disableWebhook: (subscriptionId) => api.patch(`/admin/webhooks/${subscriptionId}/disable`),

  // API Keys
  getAllApiKeys: (params) => api.get('/admin/api-keys', { params }),
  revokeApiKey: (keyId) => api.patch(`/admin/api-keys/${keyId}/revoke`),

  // Files
  getAllFiles: (params) => api.get('/admin/files', { params }),
  deleteFileAdmin: (fileId) => api.delete(`/admin/files/${fileId}`)
};

export default api;
