import { useState, useEffect } from 'react';
import { Database, Plus, Search, RefreshCw } from 'lucide-react';
import { adminAPI } from '../../services/api';
import logger from '../../utils/logger';

const AdminBucketsPage = () => {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBuckets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllBuckets();
      setBuckets(response.data || []);
    } catch (err) {
      logger.error('Failed to fetch admin buckets:', err);
      setError(err.message || 'Failed to load buckets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  const handleRefresh = () => {
    fetchBuckets();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bucket Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all storage buckets across users
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-16 h-16 text-gray-400 mb-4 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Loading buckets...</p>
          </div>
        ) : buckets.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              All Buckets ({buckets.length})
            </h3>
            {buckets.map((bucket) => (
              <div key={bucket.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white">{bucket.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Owner: {bucket.user_id}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Database className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Buckets Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              No buckets have been created yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBucketsPage;
