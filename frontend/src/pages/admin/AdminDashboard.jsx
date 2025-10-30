import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiUsers, FiDollarSign, FiActivity, FiTrendingUp, 
  FiLogOut, FiSearch, FiShield 
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const adminPassword = sessionStorage.getItem('adminPassword');

  useEffect(() => {
    if (!adminPassword) {
      navigate('/admin-ysr');
      return;
    }
    fetchData();
  }, [adminPassword, navigate]);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
      'X-Admin-Password': adminPassword
    }
  });

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin-ysr/stats'),
        api.get('/admin-ysr/users?limit=50')
      ]);
      
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error('Failed to fetch admin data');
      if (error.response?.status === 403) {
        sessionStorage.removeItem('adminPassword');
        navigate('/admin-ysr');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminPassword');
    toast.success('Logged out');
    navigate('/admin-ysr');
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FiShield className="text-3xl text-purple-500" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <FiUsers className="text-3xl text-blue-500 mb-2" />
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <FiActivity className="text-3xl text-green-500 mb-2" />
            <p className="text-gray-400 text-sm">Active Subscriptions</p>
            <p className="text-3xl font-bold">{stats?.activeSubscriptions || 0}</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <FiDollarSign className="text-3xl text-yellow-500 mb-2" />
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold">₹{stats?.totalRevenue?.toFixed(2) || 0}</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <FiTrendingUp className="text-3xl text-purple-500 mb-2" />
            <p className="text-gray-400 text-sm">Growth</p>
            <p className="text-3xl font-bold">+12%</p>
          </div>
        </div>

        {/* Plan Distribution */}
        {stats?.planDistribution && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h3 className="text-xl font-bold mb-4">Plan Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              {stats.planDistribution.map((plan) => (
                <div key={plan.name} className="text-center">
                  <p className="text-2xl font-bold text-purple-500">{plan.user_count}</p>
                  <p className="text-gray-400 text-sm">{plan.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Recent Users</h3>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">2FA</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-sm">
                        {user.plan_name || 'Free'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${user.is_verified ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                        {user.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.two_factor_enabled ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-gray-500">–</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        {stats?.recentTransactions && stats.recentTransactions.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-8">
            <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.user_name}</p>
                    <p className="text-sm text-gray-400">{transaction.plan_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">₹{transaction.amount}</p>
                    <p className="text-xs text-gray-400">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
