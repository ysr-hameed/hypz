import { Webhook, RefreshCw, CheckCircle, XCircle, Clock, ExternalLink, Ban } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import logger from '../../utils/logger';
import ConfirmModal from '../../components/ConfirmModal';

const AdminWebhooksPage = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [showDeliveries, setShowDeliveries] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getAllWebhooks();
      setWebhooks(response.data.webhooks);
    } catch (err) {
      logger.error('Failed to fetch webhooks:', err);
      setError('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async (webhookId) => {
    try {
      const response = await adminAPI.getWebhookDeliveries(webhookId);
      setDeliveries(response.data.deliveries);
      setSelectedWebhook(webhooks.find(w => w.id === webhookId));
      setShowDeliveries(true);
    } catch (err) {
      logger.error('Failed to fetch deliveries:', err);
      setError('Failed to load delivery history');
    }
  };

  const handleDisableWebhook = async () => {
    try {
      await adminAPI.disableWebhook(selectedWebhook.id);
      setShowDisableModal(false);
      setSelectedWebhook(null);
      fetchWebhooks();
      logger.info('Webhook disabled successfully');
    } catch (err) {
      logger.error('Failed to disable webhook:', err);
      setError(err.response?.data?.message || 'Failed to disable webhook');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      success: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const calculateSuccessRate = (webhook) => {
    const total = parseInt(webhook.total_deliveries) || 0;
    const successful = parseInt(webhook.successful_deliveries) || 0;
    return total > 0 ? ((successful / total) * 100).toFixed(1) : 'N/A';
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Webhooks Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor all webhook subscriptions and deliveries</p>
        </div>
        <button 
          onClick={fetchWebhooks}
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
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {webhooks.map((webhook) => (
                <tr key={webhook.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{webhook.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{webhook.user_email}</div>
                      {webhook.bucket_name && (
                        <div className="text-xs text-gray-400">Bucket: {webhook.bucket_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      <a 
                        href={webhook.endpoint_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 flex items-center gap-1"
                      >
                        {webhook.endpoint_url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {webhook.events && JSON.parse(webhook.events).slice(0, 2).map((event, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                        >
                          {event}
                        </span>
                      ))}
                      {webhook.events && JSON.parse(webhook.events).length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                          +{JSON.parse(webhook.events).length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {webhook.enabled ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                        <Ban className="w-3 h-3" />
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {calculateSuccessRate(webhook)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {webhook.successful_deliveries}/{webhook.total_deliveries} delivered
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchDeliveries(webhook.id)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Logs
                      </button>
                      {webhook.enabled && (
                        <button
                          onClick={() => {
                            setSelectedWebhook(webhook);
                            setShowDisableModal(true);
                          }}
                          className="text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                          Disable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {webhooks.length === 0 && !loading && (
          <div className="p-12 text-center">
            <Webhook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Webhooks</h3>
            <p className="text-gray-600 dark:text-gray-400">No webhook subscriptions yet</p>
          </div>
        )}
      </div>

      {/* Deliveries Modal */}
      {showDeliveries && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delivery History
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedWebhook?.name} - {selectedWebhook?.user_email}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeliveries(false);
                  setSelectedWebhook(null);
                  setDeliveries([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {deliveries.map((delivery) => (
                <div 
                  key={delivery.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {delivery.event_type}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(delivery.created_at).toLocaleString()}
                      </div>
                    </div>
                    {getStatusBadge(delivery.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <span className="text-gray-500">Response:</span>
                      <span className="ml-2 font-mono text-gray-900 dark:text-white">
                        {delivery.response_code || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Attempts:</span>
                      <span className="ml-2 font-mono text-gray-900 dark:text-white">
                        {delivery.attempts || 1}
                      </span>
                    </div>
                  </div>

                  {delivery.error_message && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200">
                      <div className="text-xs font-medium text-red-600 mb-1">Error:</div>
                      <div className="text-xs text-red-700 font-mono">
                        {delivery.error_message}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {deliveries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No deliveries recorded yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disable Confirmation */}
      {showDisableModal && (
        <ConfirmModal
          isOpen={showDisableModal}
          onClose={() => {
            setShowDisableModal(false);
            setSelectedWebhook(null);
          }}
          onConfirm={handleDisableWebhook}
          title="Disable Webhook"
          message={`Are you sure you want to disable "${selectedWebhook?.name}"?`}
          confirmText="Disable"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
    </div>
  );
};

export default AdminWebhooksPage;
