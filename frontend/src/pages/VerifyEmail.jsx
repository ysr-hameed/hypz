import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [location]);

  const verifyEmail = async (token) => {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage(response.data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">H</span>
            </div>
          </Link>

          {status === 'verifying' && (
            <>
              <div className="loader mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
              <p className="text-gray-600">Please wait...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link to="/login" className="btn btn-primary">
                Continue to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <FiXCircle className="text-red-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link to="/register" className="btn btn-primary">
                Back to Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
