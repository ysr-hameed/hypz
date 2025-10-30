import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!password) {
      toast.error('Password is required');
      return;
    }

    // Store admin password in sessionStorage
    sessionStorage.setItem('adminPassword', password);
    toast.success('Admin access granted');
    navigate('/admin-ysr/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-md w-full px-4">
        <div className="card bg-gray-800 border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="text-white text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Admin Access</h2>
            <p className="text-gray-400">Enter admin password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600"
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
