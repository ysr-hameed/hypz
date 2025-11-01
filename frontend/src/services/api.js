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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
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
export const authAPI = {
  register: (data) => api.post(apiConfig.endpoints.register, data),
  login: (data) => api.post(apiConfig.endpoints.login, data),
  verifyEmail: (token) => api.post(apiConfig.endpoints.verifyEmail, { token }),
  resendVerification: (email) => api.post(apiConfig.endpoints.resendVerification, { email }),
  forgotPassword: (email) => api.post(apiConfig.endpoints.forgotPassword, { email }),
  resetPassword: (token, password) => api.post(apiConfig.endpoints.resetPassword, { token, password }),
  getCurrentUser: () => api.get(apiConfig.endpoints.getCurrentUser),
  logout: (refreshToken) => api.post(apiConfig.endpoints.logout, { refreshToken })
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
  upload: (bucketId, formData, onProgress) => {
    return api.post(apiConfig.endpoints.uploadFile(bucketId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    });
  },
  getAll: (bucketId, params) => api.get(apiConfig.endpoints.getFiles(bucketId), { params }),
  getById: (fileId) => api.get(apiConfig.endpoints.getFile(fileId)),
  download: (fileId) => {
    return api.get(apiConfig.endpoints.downloadFile(fileId), {
      responseType: 'blob'
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
  createLemonSqueezyCheckout: (data) => api.post('/payments/lemonsqueezy/create', data),
  getPaymentHistory: (params) => api.get('/payments/history', { params })
};

export default api;
