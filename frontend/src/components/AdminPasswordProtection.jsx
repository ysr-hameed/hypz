import { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

const AdminPasswordProtection = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Check if admin session is already verified (valid for 1 hour)
  useEffect(() => {
    const adminSession = sessionStorage.getItem('admin_verified');
    const sessionTime = sessionStorage.getItem('admin_verified_time');
    
    if (adminSession === 'true' && sessionTime) {
      const elapsed = Date.now() - parseInt(sessionTime);
      const oneHour = 60 * 60 * 1000;
      
      if (elapsed < oneHour) {
        setIsVerified(true);
      } else {
        // Session expired, clear it
        sessionStorage.removeItem('admin_verified');
        sessionStorage.removeItem('admin_verified_time');
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('Too many failed attempts. Please refresh the page and try again.');
      return;
    }

    // Get admin password from environment variable
    // In production, this should be set in your .env file
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

    if (password === ADMIN_PASSWORD) {
      setIsVerified(true);
      setError('');
      // Store verification in session storage (valid for current session)
      sessionStorage.setItem('admin_verified', 'true');
      sessionStorage.setItem('admin_verified_time', Date.now().toString());
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setError('Too many failed attempts. Page locked. Please refresh and try again.');
      } else {
        setError(`Invalid password. ${3 - newAttempts} attempts remaining.`);
      }
      setPassword('');
    }
  };

  if (isVerified) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Admin Panel Access
            </h2>
            <p className="text-gray-400 text-sm">
              Enter admin password to continue
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-500 text-sm font-medium mb-1">
                  Restricted Area
                </p>
                <p className="text-gray-400 text-xs">
                  This area is restricted to authorized administrators only. 
                  All access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    error ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Enter admin password"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg ${
                isLocked ? 'bg-red-500/10 border border-red-500/20' : 'bg-orange-500/10 border border-orange-500/20'
              }`}>
                <p className={`text-sm ${isLocked ? 'text-red-500' : 'text-orange-500'}`}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLocked || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Verify Access
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              If you don't have admin access, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordProtection;
