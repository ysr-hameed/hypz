import { Navigate } from 'react-router-dom';
import { shouldBypassAuth } from '../config/env';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated (you can replace this with your actual auth logic)
  const isAuthenticated = () => {
    // In development mode, bypass authentication
    if (shouldBypassAuth()) {
      console.log('🔓 Development Mode: Authentication bypassed - Access granted to all routes');
      return true;
    }
    
    // In production, check for auth token
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('🔒 Production Mode: No auth token found - Redirecting to login');
    }
    return !!token;
  };

  if (!isAuthenticated()) {
    // Redirect to login if not authenticated (production only)
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
