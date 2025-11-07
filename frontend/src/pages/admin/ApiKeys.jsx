import { Key, RefreshCw, Shield, Ban, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import logger from '../../utils/logger';
import ConfirmModal from '../../components/ConfirmModal';

const AdminApiKeysPage = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError('');
  const response = await adminAPI.getAllApiKeys();
  const apiKeysData = response?.data?.apiKeys ?? response?.data ?? [];
  setApiKeys(apiKeysData);
    } catch (err) {
      logger.error('Failed to fetch API keys:', err);
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async () => {
    try {
      await adminAPI.revokeApiKey(selectedKey.id);
      setShowRevokeModal(false);
      setSelectedKey(null);
      fetchApiKeys();
      logger.info('API key revoked successfully');
    } catch (err) {
      logger.error('Failed to revoke API key:', err);
      setError(err.response?.data?.message || 'Failed to revoke API key');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const maskKey = (key) => {
    if (!key) return 'N/A';
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor all API keys and usage across the platform</p>
        </div>
        <button 
          onClick={fetchApiKeys}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Name & User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  API Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{apiKey.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{apiKey.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {maskKey(apiKey.key)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {apiKey.permissions ? Object.keys(JSON.parse(apiKey.permissions)).length : 0} perms
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {apiKey.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        Revoked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {apiKey.total_uses || 0} calls
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(apiKey.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {apiKey.is_active && (
                      <button
                        onClick={() => {
                          setSelectedKey(apiKey);
                          setShowRevokeModal(true);
                        }}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {apiKeys.length === 0 && !loading && (
          <div className="p-12 text-center">
            <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No API Keys</h3>
            <p className="text-gray-600 dark:text-gray-400">No API keys have been created yet</p>
          </div>
        )}
      </div>

      {/* Revoke Confirmation */}
      {showRevokeModal && (
        <ConfirmModal
          isOpen={showRevokeModal}
          onClose={() => {
            setShowRevokeModal(false);
            setSelectedKey(null);
          }}
          onConfirm={handleRevokeKey}
          title="Revoke API Key"
          message={`Are you sure you want to revoke the API key "${selectedKey?.name}" for ${selectedKey?.user_email}? This action cannot be undone.`}
          confirmText="Revoke"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
    </div>
  );
};

export default AdminApiKeysPage;
