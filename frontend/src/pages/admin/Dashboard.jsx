import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { logger } from '../../utils/logger';
import {
  Users,
  Database,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  HardDrive,
  FileText,
  Server,
  Zap
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, activityRes] = await Promise.all([
        adminAPI.getSystemStats(),
        adminAPI.getUsers({ limit: 5, page: 1 }),
        adminAPI.getActivityLogs({ limit: 10, page: 1 })
      ]);

      setStats(statsRes.data);
      setRecentUsers(usersRes.data?.users || []);
      setRecentActivity(activityRes.data?.logs || []);
    } catch (error) {
      logger.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: formatNumber(stats?.users?.total_users || 0),
      change: `+${stats?.users?.new_users_30d || 0} this month`,
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Storage',
      value: formatBytes(stats?.storage?.total_bytes || 0),
      change: formatBytes(stats?.storage?.used_bytes || 0) + ' used',
      trend: 'up',
      icon: HardDrive,
      color: 'purple'
    },
    {
      title: 'Total Buckets',
      value: formatNumber(stats?.buckets?.total_buckets || 0),
      change: `${stats?.buckets?.active_buckets || 0} active`,
      trend: 'up',
      icon: Database,
      color: 'green'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats?.revenue?.monthly_revenue || 0),
      change: formatCurrency(stats?.revenue?.total_revenue || 0) + ' total',
      trend: 'up',
      icon: DollarSign,
      color: 'yellow'
    },
    {
      title: 'Total Files',
      value: formatNumber(stats?.files?.total_files || 0),
      change: `${stats?.files?.public_files || 0} public`,
      trend: 'up',
      icon: FileText,
      color: 'orange'
    },
    {
      title: 'API Calls (30d)',
      value: formatNumber(stats?.api?.total_calls_30d || 0),
      change: `${formatNumber(stats?.api?.calls_today || 0)} today`,
      trend: 'up',
      icon: Zap,
      color: 'cyan'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    cyan: 'bg-cyan-500'
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          System Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor your platform's key metrics and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}/10`}>
                <stat.icon className={`w-6 h-6 ${colorClasses[stat.color].replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Users
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.first_name?.[0] || user.email?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    log.action?.includes('error') || log.action?.includes('failed')
                      ? 'bg-red-500'
                      : log.action?.includes('warning')
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {log.action}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {log.email || `${log.first_name || ''} ${log.last_name || ''}`.trim() || 'System'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
