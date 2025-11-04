import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import FullPageLoader from './FullPageLoader';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useUser();
  
  // Show loader while checking authentication
  if (loading) {
    return <FullPageLoader message="Verifying authentication..." />;
  }

  // Check if user is authenticated
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check admin access if required
  if (requireAdmin && user.role !== 'admin') {
    // Redirect non-admins away from admin routes
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
