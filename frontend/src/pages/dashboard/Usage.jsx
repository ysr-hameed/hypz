import { useState, useEffect } from 'react';
import { 
  HardDrive, 
  Globe, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Upload,
  Database,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { usageAPI, plansAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const Usage = () => {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30'); // 7, 30, 90 days
  const [currentUsage, setCurrentUsage] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  
  useEffect(() => {
    fetchUsageData();
  }, [timeframe]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      
      // Fetch current usage
      const usageResponse = await usageAPI.getCurrent();
      console.log('Usage Response:', usageResponse);
      setCurrentUsage(usageResponse.data);
      
      // Fetch plan data
      const planResponse = await plansAPI.getUserPlan();
      console.log('Plan Response:', planResponse);
      setPlanData(planResponse.data);
      
      // Check if advanced analytics is enabled based on plan
      const planName = planResponse.data?.plan?.name?.toLowerCase() || '';
      setAnalyticsEnabled(planName.includes('pro') || planName.includes('pay'));
      
      // Fetch historical data
      const historyResponse = await usageAPI.getHistory(parseInt(timeframe));
      console.log('History Response:', historyResponse);
      setHistoricalData(historyResponse.data?.history || []);
      
    } catch (error) {
      console.error('Error fetching usage data:', error);
      toast.error('Failed to load usage data');
      // Set fallback data to prevent undefined errors
      setCurrentUsage({
        storage: { current: 0, previous: 0 },
        bandwidth: { current: 0, previous: 0, upload: 0, download: 0 },
        api_calls: { current: 0, previous: 0, upload: 0, download: 0, delete: 0, list: 0 },
        files: { total: 0, uploaded_today: 0, downloaded_today: 0 },
        performance: { avg_response_time: 0 }
      });
      setPlanData({
        plan: { name: 'Free', storage_gb: 1, bandwidth_gb: 3, api_calls: 50000 }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const calculatePercentage = (used, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageStatus = (percentage) => {
    if (percentage >= 90) return { color: 'red', icon: AlertCircle, text: 'Critical' };
    if (percentage >= 75) return { color: 'yellow', icon: AlertCircle, text: 'Warning' };
    return { color: 'green', icon: CheckCircle, text: 'Healthy' };
  };

  const getTrendIcon = (current, previous) => {
    if (!previous || current === previous) return <Minus size={16} className="text-gray-500" />;
    if (current > previous) return <ArrowUp size={16} className="text-red-500" />;
    return <ArrowDown size={16} className="text-green-500" />;
  };

  const getTrendPercentage = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Calculate metrics
  const storageUsed = currentUsage?.storage?.current || 0;
  const storageLimit = (planData?.plan?.storage_gb || 1) * 1024 * 1024 * 1024;
  const storagePercentage = calculatePercentage(storageUsed, storageLimit);
  const storageStatus = getUsageStatus(storagePercentage);

  const bandwidthUsed = currentUsage?.bandwidth?.current || 0;
  const bandwidthLimit = (planData?.plan?.bandwidth_gb || 3) * 1024 * 1024 * 1024;
  const bandwidthPercentage = calculatePercentage(bandwidthUsed, bandwidthLimit);
  const bandwidthStatus = getUsageStatus(bandwidthPercentage);

  const apiCallsUsed = currentUsage?.api_calls?.current || 0;
  const apiCallsLimit = planData?.plan?.api_calls || 50000;
  const apiCallsPercentage = calculatePercentage(apiCallsUsed, apiCallsLimit);
  const apiCallsStatus = getUsageStatus(apiCallsPercentage);

  // Previous period data for trends
  const storagePrevious = currentUsage?.storage?.previous || 0;
  const bandwidthPrevious = currentUsage?.bandwidth?.previous || 0;
  const apiCallsPrevious = currentUsage?.api_calls?.previous || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usage & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your resource usage and performance metrics
          </p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {['7', '30', '90'].map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeframe === days
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Current Plan Info */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{planData?.plan?.name || 'Free Plan'}</h2>
            <p className="text-white/80 mt-1">
              Current billing period: {new Date().toLocaleDateString()} - {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Main Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Storage Usage */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <HardDrive className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Storage</h3>
                <p className="text-xs text-gray-500">Total space used</p>
              </div>
            </div>
            <storageStatus.icon className={`text-${storageStatus.color}-500`} size={20} />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatBytes(storageUsed)}
              </span>
              <span className="text-sm text-gray-500">
                of {formatBytes(storageLimit)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`bg-${storageStatus.color}-500 h-2 rounded-full transition-all duration-300`}
                style={{ width: `${storagePercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className={`text-${storageStatus.color}-600 dark:text-${storageStatus.color}-400 font-medium`}>
                {storagePercentage.toFixed(1)}% used
              </span>
              <div className="flex items-center gap-1">
                {getTrendIcon(storageUsed, storagePrevious)}
                <span className="text-gray-600 dark:text-gray-400">
                  {getTrendPercentage(storageUsed, storagePrevious)}% vs last period
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bandwidth Usage */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Globe className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Bandwidth</h3>
                <p className="text-xs text-gray-500">Data transferred</p>
              </div>
            </div>
            <bandwidthStatus.icon className={`text-${bandwidthStatus.color}-500`} size={20} />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatBytes(bandwidthUsed)}
              </span>
              <span className="text-sm text-gray-500">
                of {formatBytes(bandwidthLimit)}
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`bg-${bandwidthStatus.color}-500 h-2 rounded-full transition-all duration-300`}
                style={{ width: `${bandwidthPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className={`text-${bandwidthStatus.color}-600 dark:text-${bandwidthStatus.color}-400 font-medium`}>
                {bandwidthPercentage.toFixed(1)}% used
              </span>
              <div className="flex items-center gap-1">
                {getTrendIcon(bandwidthUsed, bandwidthPrevious)}
                <span className="text-gray-600 dark:text-gray-400">
                  {getTrendPercentage(bandwidthUsed, bandwidthPrevious)}% vs last period
                </span>
              </div>
            </div>

            {/* Bandwidth Breakdown */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Upload size={12} className="text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Upload: {formatBytes(currentUsage?.bandwidth?.upload || 0)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download size={12} className="text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Download: {formatBytes(currentUsage?.bandwidth?.download || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Calls Usage */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Zap className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">API Calls</h3>
                <p className="text-xs text-gray-500">Requests made</p>
              </div>
            </div>
            <apiCallsStatus.icon className={`text-${apiCallsStatus.color}-500`} size={20} />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {apiCallsUsed.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">
                of {apiCallsLimit === -1 ? 'Unlimited' : apiCallsLimit.toLocaleString()}
              </span>
            </div>

            {apiCallsLimit !== -1 && (
              <>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-${apiCallsStatus.color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${apiCallsPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className={`text-${apiCallsStatus.color}-600 dark:text-${apiCallsStatus.color}-400 font-medium`}>
                    {apiCallsPercentage.toFixed(1)}% used
                  </span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(apiCallsUsed, apiCallsPrevious)}
                    <span className="text-gray-600 dark:text-gray-400">
                      {getTrendPercentage(apiCallsUsed, apiCallsPrevious)}% vs last period
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* API Calls Breakdown */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Upload:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                  {(currentUsage?.api_calls?.upload || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Download:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                  {(currentUsage?.api_calls?.download || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Delete:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                  {(currentUsage?.api_calls?.delete || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">List:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                  {(currentUsage?.api_calls?.list || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      {analyticsEnabled ? (
        <>
          {/* Historical Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Trend Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Storage Trend</h3>
                <BarChart3 className="text-gray-400" size={20} />
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {historicalData.slice(0, 7).map((day, index) => {
                  const height = ((day.storage_bytes || 0) / storageLimit) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative" style={{ height: '200px' }}>
                        <div
                          className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all"
                          style={{ height: `${height}%` }}
                          title={formatBytes(day.storage_bytes || 0)}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bandwidth Trend Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bandwidth Trend</h3>
                <Activity className="text-gray-400" size={20} />
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {historicalData.slice(0, 7).map((day, index) => {
                  const height = ((day.bandwidth_bytes || 0) / bandwidthLimit) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative" style={{ height: '200px' }}>
                        <div
                          className="absolute bottom-0 w-full bg-green-500 rounded-t-lg transition-all"
                          style={{ height: `${Math.min(height, 100)}%` }}
                          title={formatBytes(day.bandwidth_bytes || 0)}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <Database className="text-blue-500" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Total Files</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {(currentUsage?.files?.total || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <Upload className="text-green-500" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Uploads Today</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {(currentUsage?.files?.uploaded_today || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <Download className="text-purple-500" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Downloads Today</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {(currentUsage?.files?.downloaded_today || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <Clock className="text-orange-500" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Avg Response Time</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {(currentUsage?.performance?.avg_response_time || 0)}ms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Basic Analytics Locked Message
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
          <div className="max-w-md mx-auto">
            <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Advanced Analytics Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upgrade to Pro or Pay-as-you-go plan to unlock detailed usage trends, historical charts, and performance metrics.
            </p>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Plan Features */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Plan Includes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Storage', value: `${planData?.plan?.storage_gb || 1} GB` },
            { label: 'Bandwidth', value: `${planData?.plan?.bandwidth_gb || 3} GB` },
            { label: 'API Calls', value: planData?.plan?.api_calls === -1 ? 'Unlimited' : (planData?.plan?.api_calls || 50000).toLocaleString() },
            { label: 'Bandwidth per GB', value: '$0.0500/GB' },
            { label: 'Free Egress', value: '2x Free Bandwidth' },
            { label: 'Backup & Recovery', value: '30-Day Retention' },
            { label: 'Custom Domain', value: planData?.plan?.features?.custom_domain ? 'Included' : 'Not Available' },
            { label: 'File Versioning', value: planData?.plan?.features?.file_versioning ? 'Enabled' : 'Not Available' },
            { label: 'Global CDN', value: planData?.plan?.features?.cdn ? 'Enabled' : 'Not Available' },
            { label: 'Team Members', value: `Up to ${planData?.plan?.features?.team_members || 1}` },
            { label: 'REST API Access', value: 'Full Access' },
            { label: 'Bucket Types', value: 'Public & Private' },
            { label: 'Encryption', value: 'AES-256' },
            { label: 'CORS Configuration', value: planData?.plan?.features?.cors ? 'Enabled' : 'Basic' },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
              <span className="text-gray-600 dark:text-gray-400">{item.label}:</span>
              <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Usage;
