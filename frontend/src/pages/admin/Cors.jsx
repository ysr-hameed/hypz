import { Globe, RefreshCw } from 'lucide-react';

const AdminCorsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CORS Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure cross-origin resource sharing policies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Globe className="w-4 h-4" />
          Add CORS Rule
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Global CORS Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current: Allow All Origins (*)</p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Fine-grained CORS policy management per bucket, custom headers, and advanced configuration coming soon.
        </p>
      </div>
    </div>
  );
};

export default AdminCorsPage;
