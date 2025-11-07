import { Link } from 'react-router-dom';
import { Database, Plus, Search, MoreVertical, Lock, Globe, Calendar, HardDrive, Trash2, Edit3, X, AlertCircle, Loader, FolderOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SkeletonBuckets } from '../../components/SkeletonLoaders';
import { bucketAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import { logger } from '../../utils/logger';

const Buckets = () => {
  const [buckets, setBuckets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, bucketId: null, bucketName: '' });
  
  // Form state
  const [bucketForm, setBucketForm] = useState({
    name: '',
    visibility: 'private',
    description: ''
  });

  useEffect(() => {
    fetchBuckets();
  }, []);

  const fetchBuckets = async () => {
    try {
      setLoading(true);
      const response = await bucketAPI.getAll({ search: searchQuery });
      logger.log('📦 Fetch buckets response:', response);
      
      // Backend returns: { success, message, data: { buckets: [], pagination: {} } }
      // Axios interceptor unwraps response.data
      // So we get: { success, message, data: { buckets: [], pagination: {} } }
      const bucketsData = response?.data?.buckets || [];
      logger.log('📦 Buckets data:', bucketsData);
      
      setBuckets(bucketsData);
    } catch (error) {
      logger.error('Failed to fetch buckets:', error);
      toast.error('Failed to load buckets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBucket = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!bucketForm.name.trim()) {
      toast.error('Bucket name is required');
      return;
    }

    // Validate bucket name format (lowercase, numbers, hyphens only)
    const bucketNameRegex = /^[a-z0-9-]+$/;
    if (!bucketNameRegex.test(bucketForm.name)) {
      toast.error('Bucket name can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    if (bucketForm.name.length < 3 || bucketForm.name.length > 63) {
      toast.error('Bucket name must be between 3 and 63 characters');
      return;
    }

    try {
      setCreating(true);
      logger.log('Creating bucket with data:', bucketForm);
      const response = await bucketAPI.create(bucketForm);
      logger.log('Bucket created successfully:', response);
      toast.success('Bucket created successfully!');
      setShowCreateModal(false);
      setBucketForm({ name: '', visibility: 'private', description: '' });
      fetchBuckets();
    } catch (error) {
      logger.error('Failed to create bucket:', error);
      logger.error('Error response:', error.response);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create bucket';
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBucket = (bucketId, bucketName) => {
    setConfirmModal({ isOpen: true, bucketId, bucketName });
  };

  const confirmDelete = async () => {
    try {
      await bucketAPI.delete(confirmModal.bucketId);
      toast.success('Bucket deleted successfully');
      fetchBuckets();
    } catch (error) {
      logger.error('Failed to delete bucket:', error);
      toast.error(error.response?.data?.message || 'Failed to delete bucket');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!loading) {
        fetchBuckets();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const filteredBuckets = buckets;

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
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition"
        />
      </div>

      {/* Buckets Grid */}
      {buckets.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No buckets found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery ? 'Try a different search term' : 'Create your first bucket to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition"
            >
              <Plus size={20} className="mr-2" />
              Create Your First Bucket
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuckets.map((bucket) => (
            <div
              key={bucket.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <Link
                  to={`/buckets/${bucket.id}`}
                  className="flex-1"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <Database className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </Link>
                <div className="relative group/menu">
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                    <MoreVertical size={18} className="text-gray-400" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                    <Link
                      to={`/file-manager?bucket=${bucket.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <FolderOpen size={14} />
                      Open in File Manager
                    </Link>
                    <Link
                      to={`/buckets/${bucket.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <Edit3 size={14} />
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDeleteBucket(bucket.id, bucket.name)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <Trash2 size={14} />
                      Delete Bucket
                    </button>
                  </div>
                </div>
              </div>

              <Link to={`/buckets/${bucket.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-mono hover:text-primary-600 dark:hover:text-primary-400 transition">
                  {bucket.name}
                </h3>

                {bucket.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {bucket.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Files</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {parseInt(bucket.file_count || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Size</span>
                    <span className="font-medium text-gray-900 dark:text-white font-mono">
                      {formatBytes(parseInt(bucket.total_size || 0))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-1">
                    {bucket.visibility === 'public' ? (
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
                    <span>{formatDate(bucket.created_at)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Bucket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 animate-fade-in overflow-y-auto pt-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Bucket</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateBucket} className="space-y-3.5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Bucket Name *
                </label>
                <input
                  type="text"
                  placeholder="my-bucket-name"
                  value={bucketForm.name}
                  onChange={(e) => setBucketForm({ ...bucketForm, name: e.target.value.toLowerCase() })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 transition font-mono text-sm text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Only lowercase letters, numbers, and hyphens (3-63 characters)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe what this bucket is for..."
                  value={bucketForm.description}
                  onChange={(e) => setBucketForm({ ...bucketForm, description: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 transition text-sm text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Visibility
                </label>
                <div className="space-y-2">
                  <label className="flex items-start p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={bucketForm.visibility === 'private'}
                      onChange={(e) => setBucketForm({ ...bucketForm, visibility: e.target.value })}
                      className="mt-0.5"
                    />
                    <div className="ml-2.5 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Lock size={14} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Private</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                        Files stored in your private B2 bucket. Requires authentication.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={bucketForm.visibility === 'public'}
                      onChange={(e) => setBucketForm({ ...bucketForm, visibility: e.target.value })}
                      className="mt-0.5"
                    />
                    <div className="ml-2.5 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Globe size={14} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Public</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                        Files stored in public B2 bucket. Anyone with URL can access.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5 flex items-start gap-2">
                <AlertCircle size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-0.5">Backblaze B2 Storage</p>
                  <p>Files stored in your configured B2 bucket based on visibility.</p>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {creating ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Bucket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, bucketId: null, bucketName: '' })}
        onConfirm={confirmDelete}
        title="Delete Bucket"
        message={`Are you sure you want to delete the bucket "${confirmModal.bucketName}"? This will also delete all files inside this bucket. This action cannot be undone.`}
        confirmText="Delete Bucket"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        icon={Trash2}
        iconColor="text-red-600"
      />
    </div>
  );
};

export default Buckets;
