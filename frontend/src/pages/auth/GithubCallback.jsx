import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';

const GithubCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('GitHub authentication was cancelled or failed');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        const response = await authAPI.githubOAuth(code);
        
        // Save auth data
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError(err.message || 'GitHub authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to login page...
            </p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Completing GitHub Sign In
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we authenticate you...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GithubCallback;
