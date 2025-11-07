import { BarChart3, TrendingUp, RefreshCw, Users, HardDrive, Database, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import logger from '../../utils/logger';

const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getSystemStats();
      setStats(response.data);
    } catch (err) {
      logger.error('Failed to fetch stats:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time platform insights and metrics</p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {stats && (
        <>
          {/* User Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.users?.total_users || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                +{stats.users?.new_users_30d || 0} this month
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.storage?.total_files || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Files</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {formatBytes(stats.storage?.total_storage_bytes || 0)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.buckets?.total_buckets || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Buckets</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                ${stats.revenue?.total_revenue || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                ${stats.revenue?.revenue_30d || 0} this month
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Engagement</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Verified Users</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.users?.verified_users || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">2FA Enabled</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.users?.users_with_2fa || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">24h Activity</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.activity?.total_activities || 0} actions
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Payments</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.revenue?.total_payments || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Revenue</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${stats.revenue?.revenue_30d || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Lifetime Value</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${stats.revenue?.total_revenue || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
