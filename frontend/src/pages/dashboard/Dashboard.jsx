import { Database, TrendingUp, Zap, HardDrive, Globe, Activity } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { icon: HardDrive, label: 'Storage Used', value: '175 MB', total: '500 MB', percent: 35, color: 'text-blue-500' },
    { icon: Globe, label: 'Bandwidth', value: '320 MB', total: '1 GB', percent: 32, color: 'text-green-500' },
    { icon: Zap, label: 'API Calls', value: '3,245', total: '10,000', percent: 32, color: 'text-purple-500' },
    { icon: Activity, label: 'Active Buckets', value: '8', total: 'Unlimited', percent: 100, color: 'text-orange-500' },
  ];

  const recentActivity = [
    { action: 'File uploaded', file: 'avatar.png', bucket: 'my-images', time: '2 minutes ago' },
    { action: 'Bucket created', file: 'backup-files', bucket: '-', time: '1 hour ago' },
    { action: 'File deleted', file: 'old-data.json', bucket: 'my-data', time: '3 hours ago' },
    { action: 'API key generated', file: 'prod-key-001', bucket: '-', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your storage usage and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full">
                FREE PLAN
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                +500 MB BONUS
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're on the Free Plan</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Perfect for testing! Get 500 MB storage + 1 GB bandwidth monthly.<br />
              <span className="font-semibold">Bonus:</span> Extra 500 MB for first 30 days
            </p>
            <button className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50">
              Upgrade to Pay-As-You-Go
            </button>
          </div>
          <TrendingUp className="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="font-mono">{activity.file}</span>
                    {activity.bucket !== '-' && <span> in <span className="font-mono">{activity.bucket}</span></span>}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
