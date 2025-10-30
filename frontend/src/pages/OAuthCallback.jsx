import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error('OAuth authentication failed');
      navigate('/login');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      
      // Fetch user data
      import('../utils/api').then(({ default: api }) => {
        api.get('/auth/me')
          .then(response => {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            updateUser(response.data.user);
            toast.success('Login successful!');
            navigate('/dashboard');
          })
          .catch(() => {
            toast.error('Failed to fetch user data');
            navigate('/login');
          });
      });
    } else {
      navigate('/login');
    }
  }, [location, navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="card max-w-md text-center">
        <div className="loader mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold gradient-text mb-2">Processing Login</h2>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
