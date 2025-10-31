import { TrendingUp, Database, Globe, Zap } from 'lucide-react';

const Usage = () => {
  const stats = [
    { name: 'Storage Used', value: '175 MB', limit: '500 MB', percent: 35, icon: Database, color: 'blue' },
    { name: 'Bandwidth', value: '420 MB', limit: '1 GB', percent: 42, icon: Globe, color: 'green' },
    { name: 'API Calls', value: '3,245', limit: '10,000', percent: 32, icon: Zap, color: 'purple' },
  ];

  const recentActivity = [
    { action: 'File Upload', file: 'banner.jpg', size: '567 KB', time: '2 hours ago' },
    { action: 'File Download', file: 'avatar.png', size: '245 KB', time: '5 hours ago' },
    { action: 'API Call', file: 'GET /buckets', size: '2 KB', time: '1 day ago' },
    { action: 'File Delete', file: 'old-data.json', size: '128 KB', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usage Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor your resource consumption</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 dark:from-${stat.color}-900/30 dark:to-${stat.color}-900/20 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.name}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>of {stat.limit}</span>
              <span>{stat.percent}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r from-${stat.color}-600 to-${stat.color}-500 h-2 rounded-full`}
                style={{ width: `${stat.percent}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Chart Placeholder */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Usage Over Time</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-500">Chart visualization would go here</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">File/Endpoint</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentActivity.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{activity.action}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-400">{activity.file}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{activity.size}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{activity.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Usage;
