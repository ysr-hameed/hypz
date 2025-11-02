import { Link } from 'react-router-dom';
import { Database, Plus, Search, MoreVertical, Lock, Globe, Calendar, HardDrive } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SkeletonBuckets } from '../../components/SkeletonLoaders';

const Buckets = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const buckets = [
    { name: 'my-images', files: 1243, size: '45.2 MB', visibility: 'Private', created: '2024-01-15' },
    { name: 'user-uploads', files: 892, size: '78.5 MB', visibility: 'Public', created: '2024-02-20' },
    { name: 'backup-files', files: 456, size: '120 MB', visibility: 'Private', created: '2024-03-10' },
    { name: 'static-assets', files: 2341, size: '156 MB', visibility: 'Public', created: '2024-01-05' },
    { name: 'documents', files: 234, size: '34.8 MB', visibility: 'Private', created: '2024-02-28' },
    { name: 'media-library', files: 567, size: '89.3 MB', visibility: 'Public', created: '2024-03-15' },
  ];

  const filteredBuckets = buckets.filter(bucket => 
    bucket.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <SkeletonBuckets />;
  }

  return (
    <div className="space-y-6 content-wrapper content-loaded">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slideIn">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buckets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your storage buckets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50"
        >
          <Plus size={20} className="mr-2" />
          Create Bucket
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search buckets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition"
        />
      </div>

      {/* Buckets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuckets.map((bucket, index) => (
          <Link
            key={index}
            to={`/buckets/${bucket.name}`}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                <Database className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                <MoreVertical size={18} className="text-gray-400" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-mono">
              {bucket.name}
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Files</span>
                <span className="font-medium text-gray-900 dark:text-white">{bucket.files.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Size</span>
                <span className="font-medium text-gray-900 dark:text-white font-mono">{bucket.size}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-1">
                {bucket.visibility === 'Public' ? (
                  <>
                    <Globe size={14} className="text-green-500" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Public</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Private</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500">
                <Calendar size={12} />
                <span>{bucket.created}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredBuckets.length === 0 && (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No buckets found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery ? 'Try a different search term' : 'Create your first bucket to get started'}
          </p>
        </div>
      )}

      {/* Create Bucket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Bucket</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bucket Name
                </label>
                <input
                  type="text"
                  placeholder="my-bucket-name"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 transition font-mono"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Only lowercase letters, numbers, and hyphens
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visibility
                </label>
                <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 transition">
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50"
                >
                  Create Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buckets;
