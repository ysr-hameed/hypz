import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchPlanOnce();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const fetchPlanOnce = async () => {
    // Fetch plan data only once on app load
    const cachedPlan = sessionStorage.getItem('planData');
    if (cachedPlan) {
      setPlanData(JSON.parse(cachedPlan));
      return;
    }

    try {
      const response = await api.get('/payment/plans');
      sessionStorage.setItem('planData', JSON.stringify(response.data.plans));
      setPlanData(response.data.plans);
    } catch (error) {
      console.error('Failed to fetch plan data');
    }
  };

  const register = async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.requiresTwoFactor) {
        return { requiresTwoFactor: true, tempToken: response.data.tempToken };
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const verify2FA = async (code, tempToken) => {
    try {
      // Temporarily set token for 2FA verification
      const originalToken = localStorage.getItem('token');
      localStorage.setItem('token', tempToken);

      const response = await api.post('/auth/verify-2fa', { code });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors during logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    planData,
    register,
    login,
    verify2FA,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
