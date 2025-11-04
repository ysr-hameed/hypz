import { Globe, Plus, RefreshCw } from 'lucide-react';

const AdminCorsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CORS Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage Cross-Origin Resource Sharing rules</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add CORS Rule
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center py-12">
          <Globe className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">CORS Management Coming Soon</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Configure CORS policies for buckets, manage allowed origins, methods, and headers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminCorsPage;
