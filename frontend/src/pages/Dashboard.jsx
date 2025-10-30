import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FiPackage, FiActivity, FiCreditCard, FiShield } from 'react-icons/fi';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/payment/subscription');
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: <FiPackage className="text-3xl text-primary-500" />,
      label: 'Current Plan',
      value: user?.plan?.name || 'Free',
      color: 'bg-blue-50'
    },
    {
      icon: <FiActivity className="text-3xl text-green-500" />,
      label: 'Status',
      value: user?.isVerified ? 'Verified' : 'Unverified',
      color: 'bg-green-50'
    },
    {
      icon: <FiCreditCard className="text-3xl text-purple-500" />,
      label: 'Subscription',
      value: subscription?.status || 'None',
      color: 'bg-purple-50'
    },
    {
      icon: <FiShield className="text-3xl text-orange-500" />,
      label: '2FA',
      value: user?.twoFactorEnabled ? 'Enabled' : 'Disabled',
      color: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your account</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card card-hover">
              <div className={`${stat.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Plan Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Plan Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold">{user?.plan?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold">
                  {user?.plan?.price === 0 ? 'Free' : `₹${user?.plan?.price}/month`}
                </span>
              </div>
              {subscription && (
                <>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-semibold ${subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {subscription.status}
                    </span>
                  </div>
                  {subscription.end_date && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Renewal Date</span>
                      <span className="font-semibold">
                        {new Date(subscription.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Account Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-gray-600">
                    {user?.isVerified ? 'Your email is verified' : 'Please verify your email'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${user?.isVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">
                    {user?.twoFactorEnabled ? 'Extra security enabled' : 'Add an extra layer of security'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${user?.twoFactorEnabled ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mt-6">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/profile" className="btn btn-secondary">
              Update Profile
            </a>
            <a href="/settings" className="btn btn-secondary">
              Security Settings
            </a>
            <a href="/pricing" className="btn btn-primary">
              Upgrade Plan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
