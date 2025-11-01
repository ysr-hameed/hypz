import { Navigate } from 'react-router-dom';
import { shouldBypassAuth } from '../config/env';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = () => {
    // In development mode, bypass authentication
    if (shouldBypassAuth()) {
      return true;
    }
    
    // In production, check for auth token (correct key)
    const token = localStorage.getItem('token');
    return !!token;
  };

  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
