import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { apiCache } from '../utils/apiCache';
import { logger } from '../utils/logger';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data from API with caching
  const fetchUser = useCallback(async (forceRefresh = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return null;
      }

      setLoading(true);
      setError(null);

      // Use cache wrapper with 5 minute TTL (300000ms)
      // If forceRefresh is true, clear cache first
      if (forceRefresh) {
        apiCache.clear('user-data');
      }

      const userResponse = await apiCache.wrapRequest(
        'user-data',
        () => authAPI.getCurrentUser(),
        300000 // 5 minutes cache
      );

      let profile = null;
      if (userResponse && typeof userResponse === 'object') {
        if (Object.prototype.hasOwnProperty.call(userResponse, 'data')) {
          profile = userResponse.data;
        } else {
          profile = userResponse;
        }
      }

      if (profile && typeof profile === 'object') {
        setUser(profile);
        return profile;
      }

      setUser(null);
      return null;
    } catch (err) {
      logger.error('Error fetching user:', err);
      setError(err.message || 'Failed to load user data');
      
      // If unauthorized, clear user data
      if (err.status === 401 || err.message?.includes('Unauthorized')) {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user data locally (for immediate UI updates)
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
    // Invalidate cache so next fetch gets fresh data
    apiCache.clear('user-data');
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    apiCache.clear('user-data');
  }, []);

  // Get user initials for avatar
  const getUserInitials = useCallback(() => {
    if (!user) return 'U';
    
    // Try firstName + lastName first (from API)
    if (user.firstName || user.lastName) {
      const first = (user.firstName || '').trim();
      const last = (user.lastName || '').trim();
      
      if (first && last) {
        return (first[0] + last[0]).toUpperCase();
      }
      if (first) {
        return first.substring(0, 2).toUpperCase();
      }
      if (last) {
        return last.substring(0, 2).toUpperCase();
      }
    }
    
    // Fallback to name field if it exists
    if (user.name) {
      const parts = user.name.split(' ').filter(p => p.length > 0);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    
    // Fallback to email
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  }, [user]);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!localStorage.getItem('token');

  // Load user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Listen for storage changes (e.g., logout in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed
        setUser(null);
        apiCache.clear('user-data');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    fetchUser,
    updateUser,
    logout,
    getUserInitials
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
