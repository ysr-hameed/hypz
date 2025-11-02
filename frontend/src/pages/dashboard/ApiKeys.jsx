import { Key, Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SkeletonList } from '../../components/SkeletonLoaders';

const ApiKeys = () => {
  const [showModal, setShowModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const keys = [
    { id: 1, name: 'Production API', key: 'sk_live_51H7xQ2Kd...', created: '2024-03-15', lastUsed: '2 hours ago' },
    { id: 2, name: 'Development API', key: 'sk_test_51H7xQ2Kd...', created: '2024-03-10', lastUsed: '5 days ago' },
  ];

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Keys</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your API keys for programmatic access</p>
          </div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <SkeletonList items={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 content-wrapper content-loaded">
      <div className="flex items-center justify-between animate-slideIn">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Keys</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your API keys for programmatic access</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50"
        >
          <Plus size={20} className="mr-2" />
          Create New Key
        </button>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {keys.map((apiKey) => (
          <div key={apiKey.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
                  <Key className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{apiKey.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created {apiKey.created}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
              <code className="flex-1 text-gray-900 dark:text-white">
                {visibleKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••'}
              </code>
              <button
                onClick={() => toggleKeyVisibility(apiKey.id)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
              >
                {visibleKeys[apiKey.id] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition">
                <Copy size={16} />
              </button>
            </div>

            <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span>Last used: {apiKey.lastUsed}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New API Key</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g., Production API"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50">
                  Create Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
