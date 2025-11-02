import { useState, useEffect, useRef } from 'react';
import { Database, TrendingUp, Zap, HardDrive, Globe, Activity, Loader2 } from 'lucide-react';
import { bucketAPI, usageAPI, plansAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { apiCache } from '../../utils/apiCache';
import { SkeletonDashboard } from '../../components/SkeletonLoaders';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStages, setLoadingStages] = useState({
    usage: true,
    plan: true,
    buckets: true
  });
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent double fetch in React StrictMode
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch usage data with cache
        setLoadingStages(prev => ({ ...prev, usage: true }));
        const usageResponse = await apiCache.wrapRequest(
          'usage:current',
          () => usageAPI.getCurrent(),
          30000 // 30 second cache
        );
        const usage = usageResponse.data;
        setLoadingStages(prev => ({ ...prev, usage: false }));

        // Fetch current plan with cache
        setLoadingStages(prev => ({ ...prev, plan: true }));
        try {
          const planResponse = await apiCache.wrapRequest(
            'plan:current',
            () => plansAPI.getUserPlan(),
            60000 // 60 second cache
          );
          setCurrentPlan(planResponse.data);
        } catch (planError) {
          console.warn('Plan fetch failed, using defaults:', planError);
          // Set default plan if fetch fails
          setCurrentPlan({
            plan: {
              name: 'Free Plan',
              storage_gb: 1,
              bandwidth_gb: 3,
              api_calls: 50000
            }
          });
        }
        setLoadingStages(prev => ({ ...prev, plan: false }));

        // Fetch buckets count with cache
        setLoadingStages(prev => ({ ...prev, buckets: true }));
        const bucketsResponse = await apiCache.wrapRequest(
          'buckets:all',
          () => bucketAPI.getAll(),
          30000 // 30 second cache
        );
        setBuckets(bucketsResponse.data || []);
        setLoadingStages(prev => ({ ...prev, buckets: false }));

        // Calculate stats - usage.month contains current usage
        const storageUsed = usage.month?.storage_bytes || 0;
        const bandwidthUsed = usage.month?.bandwidth_bytes || 0;
        const apiCallsUsed = usage.month?.api_calls || 0;
        
        const planData = planResponse.data?.plan;
        const storageLimit = (planData?.storage_gb || 1) * 1024 * 1024 * 1024; // Convert to bytes
        const bandwidthLimit = (planData?.bandwidth_gb || 3) * 1024 * 1024 * 1024;
        const apiCallsLimit = planData?.api_calls || 50000;

        setStats([
          {
            icon: HardDrive,
            label: 'Storage Used',
            value: formatBytes(storageUsed),
            total: formatBytes(storageLimit),
            percent: Math.min((storageUsed / storageLimit) * 100, 100),
            color: 'text-blue-500'
          },
          {
            icon: Globe,
            label: 'Bandwidth',
            value: formatBytes(bandwidthUsed),
            total: formatBytes(bandwidthLimit),
            percent: Math.min((bandwidthUsed / bandwidthLimit) * 100, 100),
            color: 'text-green-500'
          },
          {
            icon: Zap,
            label: 'API Calls',
            value: apiCallsUsed.toLocaleString(),
            total: apiCallsLimit.toLocaleString(),
            percent: Math.min((apiCallsUsed / apiCallsLimit) * 100, 100),
            color: 'text-purple-500'
          },
          {
            icon: Activity,
            label: 'Active Buckets',
            value: bucketsResponse.data?.length || 0,
            total: 'Unlimited',
            percent: 100,
            color: 'text-orange-500'
          }
        ]);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your storage usage and activity</p>
        </div>
        <SkeletonDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-6 content-wrapper content-loaded">
      <div className="animate-slideIn">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your storage usage and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideIn">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`${stat.color} w-8 h-8`} />
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{stat.percent}%</span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">of {stat.total}</p>
            <div className="mt-3 w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full ${stat.color.replace('text-', 'bg-')} rounded-full`} style={{ width: `${stat.percent}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Info */}
      <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full uppercase">
                {currentPlan?.plan?.type || 'FREE'} PLAN
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {currentPlan?.plan?.name || 'Free Plan'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {currentPlan?.plan?.type === 'free' 
                ? `${currentPlan?.plan?.storage_gb}GB Storage • ${currentPlan?.plan?.bandwidth_gb}GB Bandwidth • ${(currentPlan?.plan?.api_calls || 0).toLocaleString()} API Calls`
                : 'Pay only for what you use with no base fees'}
            </p>
            <button 
              onClick={() => navigate('/dashboard/plans')}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50">
              {currentPlan?.plan?.type === 'free' ? 'Upgrade to Pay-As-You-Go' : 'View Plan Details'}
            </button>
          </div>
          <TrendingUp className="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/dashboard/buckets')}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition text-left group"
        >
          <Database className="w-10 h-10 text-blue-500 mb-3 group-hover:scale-110 transition" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create Bucket</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Start storing your files</p>
        </button>

        <button
          onClick={() => navigate('/dashboard/api-keys')}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition text-left group"
        >
          <Zap className="w-10 h-10 text-purple-500 mb-3 group-hover:scale-110 transition" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Generate API Key</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Connect your application</p>
        </button>

        <button
          onClick={() => navigate('/dashboard/documentation')}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition text-left group"
        >
          <Activity className="w-10 h-10 text-green-500 mb-3 group-hover:scale-110 transition" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Documentation</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Learn how to integrate</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
