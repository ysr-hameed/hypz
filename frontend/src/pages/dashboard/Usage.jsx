import { useState, useEffect } from 'react';
import { usePlan } from '../../context/PlanContext';
import { formatStorage, formatBandwidth, formatApiCalls } from '../../config/plans';
import { SkeletonStats, SkeletonChart } from '../../components/SkeletonLoaders';
import { 
  ChartBarIcon, 
  ServerIcon, 
  ArrowsRightLeftIcon, 
  CodeBracketIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Usage = () => {
  const { userData, planDetails, getStorageUsage, getBandwidthUsage, getApiCallsUsage } = usePlan();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const storageUsage = getStorageUsage();
  const bandwidthUsage = getBandwidthUsage();
  const apiCallsUsage = getApiCallsUsage();

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' };
    if (percentage >= 75) return { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200' };
    return { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' };
  };

  const getUsageStatus = (percentage) => {
    if (percentage >= 90) return { icon: ExclamationTriangleIcon, text: 'Critical', color: 'text-red-600' };
    if (percentage >= 75) return { icon: ExclamationTriangleIcon, text: 'Warning', color: 'text-yellow-600' };
    return { icon: CheckCircleIcon, text: 'Healthy', color: 'text-green-600' };
  };

  // Mock usage trends data
  const usageTrends = {
    storage: [
      { date: '10-25', value: 0.3 },
      { date: '10-26', value: 0.35 },
      { date: '10-27', value: 0.4 },
      { date: '10-28', value: 0.42 },
      { date: '10-29', value: 0.45 },
      { date: '10-30', value: 0.48 },
      { date: '10-31', value: 0.5 }
    ],
    bandwidth: [
      { date: '10-25', value: 1.5 },
      { date: '10-26', value: 1.8 },
      { date: '10-27', value: 1.9 },
      { date: '10-28', value: 2.0 },
      { date: '10-29', value: 2.1 },
      { date: '10-30', value: 2.2 },
      { date: '10-31', value: 2.3 }
    ],
    apiCalls: [
      { date: '10-25', value: 8000 },
      { date: '10-26', value: 9500 },
      { date: '10-27', value: 10200 },
      { date: '10-28', value: 11000 },
      { date: '10-29', value: 11500 },
      { date: '10-30', value: 12000 },
      { date: '10-31', value: 12500 }
    ]
  };

  const UsageCard = ({ title, icon: Icon, used, limit, unit, color, type }) => {
    const percentage = limit === 'unlimited' || limit === 0 ? 0 : (used / limit) * 100;
    const colors = getUsageColor(percentage);
    const status = getUsageStatus(percentage);
    const StatusIcon = status.icon;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${color} bg-opacity-10 mr-3`}>
              <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Period</p>
            </div>
          </div>
          <div className="flex items-center">
            <StatusIcon className={`h-5 w-5 ${status.color} mr-1`} />
            <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {used.toFixed(2)} {unit}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              of {limit === 'unlimited' ? '∞' : `${limit} ${unit}`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 ${colors.bg} transition-all duration-500 relative overflow-hidden`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>
            <p className="text-right text-sm text-gray-600 dark:text-gray-400 mt-1">
              {percentage.toFixed(1)}% used
            </p>
          </div>

          {/* Mini Trend Chart */}
          {planDetails?.analytics === 'advanced' && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">7-Day Trend</span>
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                  <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                  +{((used / usageTrends[type][0].value - 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-end justify-between h-12 space-x-1">
                {usageTrends[type].map((point, idx) => {
                  const maxValue = Math.max(...usageTrends[type].map(p => p.value));
                  const height = (point.value / maxValue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full ${colors.bg} bg-opacity-60 rounded-t transition-all hover:bg-opacity-100`}
                        style={{ height: `${height}%` }}
                        title={`${point.date}: ${point.value} ${unit}`}
                      ></div>
                      <span className="text-[8px] text-gray-500 mt-1">{point.date.split('-')[1]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alert Message */}
          {percentage >= 75 && (
            <div className={`p-3 rounded-lg border ${colors.border} bg-opacity-10 ${colors.bg}`}>
              <p className={`text-sm ${colors.text} font-medium`}>
                {percentage >= 90
                  ? `⚠️ ${planDetails?.afterLimit === 'stop_or_upgrade' ? 'Service will stop' : 'Auto-billing enabled'} when limit reached`
                  : `⚡ You're using ${percentage.toFixed(0)}% of your ${title.toLowerCase()}`}
              </p>
              {percentage >= 90 && planDetails?.afterLimit === 'stop_or_upgrade' && (
                <Link to="/plans" className="text-sm underline mt-1 inline-block">
                  Upgrade Now
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usage Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your resource consumption and trends
          </p>
        </div>
        <SkeletonStats count={3} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 content-wrapper content-loaded">
      {/* Header */}
      <div className="flex justify-between items-start animate-slideIn">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usage Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your resource consumption and trends
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Plan</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{planDetails?.name}</p>
          <Link to="/plans" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Upgrade Plan
          </Link>
        </div>
      </div>

      {/* Analytics Badge */}
      {planDetails?.analytics === 'none' && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-200">
                  Upgrade for Advanced Analytics
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Get detailed usage trends, predictions, and insights with paid plans
                </p>
              </div>
            </div>
            <Link
              to="/plans"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium whitespace-nowrap"
            >
              View Plans
            </Link>
          </div>
        </div>
      )}

      {/* Usage Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <UsageCard
          title="Storage"
          icon={ServerIcon}
          used={storageUsage.used}
          limit={storageUsage.limit}
          unit="GB"
          color="bg-blue-500"
          type="storage"
        />
        <UsageCard
          title="Bandwidth"
          icon={ArrowsRightLeftIcon}
          used={bandwidthUsage.used}
          limit={bandwidthUsage.limit}
          unit="GB"
          color="bg-purple-500"
          type="bandwidth"
        />
        <UsageCard
          title="API Calls"
          icon={CodeBracketIcon}
          used={apiCallsUsage.used}
          limit={apiCallsUsage.limit}
          unit="calls"
          color="bg-green-500"
          type="apiCalls"
        />
      </div>

      {/* Usage Details Table */}
      {planDetails?.analytics === 'advanced' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
            Detailed Usage Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Resource</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Used</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Limit</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">% Used</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Storage</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">{storageUsage.used.toFixed(2)} GB</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">{storageUsage.limit} GB</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white text-right">{storageUsage.percentage.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      storageUsage.percentage >= 90 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      storageUsage.percentage >= 75 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {storageUsage.percentage >= 90 ? 'Critical' : storageUsage.percentage >= 75 ? 'Warning' : 'Healthy'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Bandwidth</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">{bandwidthUsage.used.toFixed(2)} GB</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">{bandwidthUsage.limit} GB</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white text-right">{bandwidthUsage.percentage.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      bandwidthUsage.percentage >= 90 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      bandwidthUsage.percentage >= 75 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {bandwidthUsage.percentage >= 90 ? 'Critical' : bandwidthUsage.percentage >= 75 ? 'Warning' : 'Healthy'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">API Calls</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">{formatApiCalls(apiCallsUsage.used)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">{formatApiCalls(apiCallsUsage.limit)}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white text-right">{apiCallsUsage.percentage.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      apiCallsUsage.percentage >= 90 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      apiCallsUsage.percentage >= 75 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {apiCallsUsage.percentage >= 90 ? 'Critical' : apiCallsUsage.percentage >= 75 ? 'Warning' : 'Healthy'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">API Uploads</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">-</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 text-right">Unlimited</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white text-right">-</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Unlimited
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">💡 Recommendations</h2>
        <ul className="space-y-2">
          {storageUsage.percentage > 75 && (
            <li className="text-sm text-blue-800 dark:text-blue-300">
              • Your storage is at {storageUsage.percentage.toFixed(0)}%. Consider upgrading to avoid service interruption.
            </li>
          )}
          {bandwidthUsage.percentage > 75 && (
            <li className="text-sm text-blue-800 dark:text-blue-300">
              • High bandwidth usage detected. Upgrade for more bandwidth or optimize your content delivery.
            </li>
          )}
          {apiCallsUsage.percentage > 75 && (
            <li className="text-sm text-blue-800 dark:text-blue-300">
              • API calls are high. Consider caching frequently accessed data or upgrading your plan.
            </li>
          )}
          {storageUsage.percentage < 50 && bandwidthUsage.percentage < 50 && apiCallsUsage.percentage < 50 && (
            <li className="text-sm text-blue-800 dark:text-blue-300">
              ✅ Great! Your usage is healthy. You're making efficient use of your resources.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Usage;
