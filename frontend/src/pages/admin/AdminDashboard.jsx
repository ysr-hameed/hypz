import { Users, Database, Activity, DollarSign, Server, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { name: 'Total Users', value: '1,245', change: '+12%', icon: Users, color: 'blue' },
    { name: 'Total Storage', value: '2.4 TB', change: '+8%', icon: Database, color: 'green' },
    { name: 'API Requests', value: '1.2M', change: '+24%', icon: Activity, color: 'purple' },
    { name: 'Revenue', value: '₹45,678', change: '+15%', icon: DollarSign, color: 'yellow' },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'Free', joined: '2024-03-20', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', plan: 'Pay-As-You-Go', joined: '2024-03-19', status: 'active' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', plan: 'Free', joined: '2024-03-18', status: 'suspended' },
  ];

  const systemHealth = [
    { service: 'API Server', status: 'operational', uptime: '99.98%' },
    { service: 'Storage Service', status: 'operational', uptime: '99.95%' },
    { service: 'Database', status: 'operational', uptime: '99.99%' },
    { service: 'CDN', status: 'degraded', uptime: '98.50%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor and manage your entire platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">{stat.change}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.name}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <Server className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Health</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {systemHealth.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {service.status === 'operational' ? (
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">{service.service}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uptime: {service.uptime}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    service.status === 'operational' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Users</h2>
          </div>
          <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{user.plan}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.joined}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
