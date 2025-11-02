import { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, RefreshCw, Eye, EyeOff, Key, Calendar, Activity, AlertCircle, Shield, Edit3 } from 'lucide-react';
import { SkeletonList } from '../../components/SkeletonLoaders';
import { apiKeyAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import EditPermissionsModal from '../../components/EditPermissionsModal';

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyData, setNewKeyData] = useState(null);
  const [permissions, setPermissions] = useState({ read: true, write: true, delete: false });
  const [expiresIn, setExpiresIn] = useState('');
  const [creating, setCreating] = useState(false);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, data: null });
  const [editPermissionsModal, setEditPermissionsModal] = useState({ isOpen: false, keyId: null, keyName: '', currentPermissions: null });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiKeyAPI.getAll();
      setApiKeys(response.data || []);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      setCreating(true);
      
      // Build request data, excluding null/undefined values
      const requestData = {
        name: newKeyName,
        permissions
      };
      
      // Only include expiresIn if it has a value
      if (expiresIn && parseInt(expiresIn) > 0) {
        requestData.expiresIn = parseInt(expiresIn);
      }
      
      const response = await apiKeyAPI.create(requestData);
      
      setNewKeyData(response.data);
      setShowKeyModal(true);
      setShowModal(false);
      setNewKeyName('');
      setPermissions({ read: true, write: true, delete: false });
      setExpiresIn('');
      
      await fetchApiKeys();
      toast.success('API key created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId, keyName) => {
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      data: { keyId, keyName }
    });
  };

  const confirmDelete = async () => {
    const { keyId } = confirmModal.data;
    try {
      await apiKeyAPI.delete(keyId);
      toast.success('API key deleted successfully');
      await fetchApiKeys();
    } catch (error) {
      toast.error(error.message || 'Failed to delete API key');
    }
  };

  const handleRegenerateKey = async (keyId, keyName) => {
    setConfirmModal({
      isOpen: true,
      action: 'regenerate',
      data: { keyId, keyName }
    });
  };

  const confirmRegenerate = async () => {
    const { keyId } = confirmModal.data;
    try {
      const response = await apiKeyAPI.regenerate(keyId);
      setNewKeyData(response.data);
      setShowKeyModal(true);
      toast.success('API key regenerated successfully');
      await fetchApiKeys();
    } catch (error) {
      toast.error(error.message || 'Failed to regenerate API key');
    }
  };

  const handleToggleActive = async (keyId, currentStatus) => {
    try {
      await apiKeyAPI.update(keyId, { isActive: !currentStatus });
      toast.success(`API key ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      await fetchApiKeys();
    } catch (error) {
      toast.error(error.message || 'Failed to update API key');
    }
  };

  const handleEditPermissions = (keyId, keyName, currentPermissions) => {
    setEditPermissionsModal({
      isOpen: true,
      keyId,
      keyName,
      currentPermissions
    });
  };

  const savePermissions = async (newPermissions) => {
    const { keyId } = editPermissionsModal;
    try {
      await apiKeyAPI.update(keyId, { permissions: newPermissions });
      toast.success('Permissions updated successfully');
      await fetchApiKeys();
      setEditPermissionsModal({ isOpen: false, keyId: null, keyName: '', currentPermissions: null });
    } catch (error) {
      toast.error(error.message || 'Failed to update permissions');
      throw error;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
      {/* Header */}
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

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Keep your API keys secure</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              API keys provide full access to your account. Never share them publicly or commit them to version control.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No API keys yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first API key to get started with programmatic access</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
          >
            <Plus size={20} className="mr-2" />
            Create API Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => {
            const expired = isExpired(apiKey.expires_at);
            const inactive = !apiKey.is_active;
            
            return (
              <div
                key={apiKey.id}
                className={`bg-white dark:bg-gray-900 rounded-xl border p-6 transition ${
                  expired || inactive
                    ? 'border-gray-300 dark:border-gray-700 opacity-60'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {apiKey.name}
                      </h3>
                      {expired && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded">
                          Expired
                        </span>
                      )}
                      {inactive && !expired && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-xs rounded">
                          Disabled
                        </span>
                      )}
                    </div>

                    {/* Key Preview */}
                    <div className="flex items-center gap-2 mb-4">
                      <code className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-900 dark:text-white">
                        {apiKey.key_prefix}
                      </code>
                      <button
                        onClick={() => copyToClipboard(apiKey.key_prefix)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                        title="Copy prefix"
                      >
                        <Copy size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Created</p>
                        <p className="text-gray-900 dark:text-white font-medium flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(apiKey.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Last Used</p>
                        <p className="text-gray-900 dark:text-white font-medium flex items-center gap-1">
                          <Activity size={14} />
                          {formatDate(apiKey.last_used_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Expires</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {apiKey.expires_at ? formatDate(apiKey.expires_at) : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Permissions</p>
                        <div className="flex items-center gap-1">
                          {apiKey.permissions?.read && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                              Read
                            </span>
                          )}
                          {apiKey.permissions?.write && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
                              Write
                            </span>
                          )}
                          {apiKey.permissions?.delete && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded">
                              Delete
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4 flex-wrap">
                    <button
                      onClick={() => handleToggleActive(apiKey.id, apiKey.is_active)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition ${
                        apiKey.is_active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {apiKey.is_active ? (
                        <>
                          <Eye size={16} />
                          <span className="hidden sm:inline">Enabled</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} />
                          <span className="hidden sm:inline">Disabled</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEditPermissions(apiKey.id, apiKey.name, apiKey.permissions)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition font-medium text-sm"
                      title="Edit Permissions"
                    >
                      <Edit3 size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleRegenerateKey(apiKey.id, apiKey.name)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition font-medium text-sm"
                      title="Regenerate"
                    >
                      <RefreshCw size={16} />
                      <span className="hidden sm:inline">Regenerate</span>
                    </button>
                    <button
                      onClick={() => handleDeleteKey(apiKey.id, apiKey.name)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition font-medium text-sm"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create API Key Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create API Key</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.read}
                      onChange={(e) => setPermissions({ ...permissions, read: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Read (view files and buckets)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.write}
                      onChange={(e) => setPermissions({ ...permissions, write: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Write (upload files)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.delete}
                      onChange={(e) => setPermissions({ ...permissions, delete: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Delete (remove files)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expires In (Optional)
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="">Never</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={creating}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show New Key Modal */}
      {showKeyModal && newKeyData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Key Created!</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Save this key securely</p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Important:</strong> This is the only time you'll see this key. Please copy it now and store it securely.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your API Key
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono text-gray-900 dark:text-white break-all">
                  {newKeyData.apiKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newKeyData.apiKey)}
                  className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
                  title="Copy to clipboard"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setShowKeyModal(false);
                setNewKeyData(null);
              }}
              className="w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
            >
              I've Saved My Key
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'delete'}
        onClose={() => setConfirmModal({ isOpen: false, action: null, data: null })}
        onConfirm={confirmDelete}
        title="Delete API Key"
        message={`Are you sure you want to delete the API key "${confirmModal.data?.keyName}"? This action cannot be undone and any applications using this key will lose access immediately.`}
        confirmText="Delete Key"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        icon={Trash2}
        iconColor="text-red-600"
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'regenerate'}
        onClose={() => setConfirmModal({ isOpen: false, action: null, data: null })}
        onConfirm={confirmRegenerate}
        title="Regenerate API Key"
        message={`Are you sure you want to regenerate the API key "${confirmModal.data?.keyName}"? The old key will be invalidated immediately and any applications using it will need to be updated with the new key.`}
        confirmText="Regenerate Key"
        cancelText="Cancel"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
        icon={RefreshCw}
        iconColor="text-blue-600"
      />

      {/* Edit Permissions Modal */}
      {editPermissionsModal.isOpen && editPermissionsModal.currentPermissions && (
        <EditPermissionsModal
          isOpen={editPermissionsModal.isOpen}
          onClose={() => setEditPermissionsModal({ isOpen: false, keyId: null, keyName: '', currentPermissions: null })}
          onSave={savePermissions}
          currentPermissions={editPermissionsModal.currentPermissions}
          keyName={editPermissionsModal.keyName}
        />
      )}
    </div>
  );
};

export default ApiKeys;
