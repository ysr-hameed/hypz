import { DollarSign, RefreshCw, TrendingUp, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import logger from '../../utils/logger';

const AdminBillingPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSystemStats();
      setStats(response.data);
    } catch (err) {
      logger.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Revenue</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Financial overview and payment tracking</p>
        </div>
        <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            ${stats?.revenue?.total_revenue || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats?.revenue?.total_payments || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Payments</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            ${stats?.revenue?.revenue_30d || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Last 30 Days</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Overview</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed invoice management, payment history, and revenue analytics coming soon.
        </p>
      </div>
    </div>
  );
};

export default AdminBillingPage;
