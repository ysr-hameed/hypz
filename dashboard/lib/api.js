import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  regenerateApiKey: () => api.post('/auth/regenerate-api-key'),
};

export const filesAPI = {
  upload: (formData, onUploadProgress) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  getFiles: (params) => api.get('/files', { params }),
  getFile: (id) => api.get(`/files/${id}`),
  downloadFile: (id) => api.get(`/files/${id}/download`),
  deleteFile: (id) => api.delete(`/files/${id}`),
  getStats: () => api.get('/files/stats/summary'),
};

export const billingAPI = {
  getPlans: () => api.get('/billing/plans'),
  createOrder: (data) => api.post('/billing/create-order', data),
  verifyPayment: (data) => api.post('/billing/verify-payment', data),
  getHistory: (params) => api.get('/billing/history', { params }),
  getStats: () => api.get('/billing/stats'),
};

export const usageAPI = {
  getCurrent: () => api.get('/usage/current'),
  getHistory: (params) => api.get('/usage/history', { params }),
};

export default api;
