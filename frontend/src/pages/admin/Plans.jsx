import { Package, Plus, RefreshCw, Edit2, Trash2, Users, DollarSign, HardDrive, Wifi, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import logger from '../../utils/logger';
import ConfirmModal from '../../components/ConfirmModal';

const AdminPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'subscription',
    price_usd: 0,
    storage_gb: 10,
    bandwidth_gb: 10,
    api_calls: 10000,
    max_buckets: 5,
    max_file_size_mb: 100,
    features: []
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getAllPlans();
      setPlans(response.data);
    } catch (err) {
      logger.error('Failed to fetch plans:', err);
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createPlan(formData);
      setShowCreateModal(false);
      resetForm();
      fetchPlans();
      logger.info('Plan created successfully');
    } catch (err) {
      logger.error('Failed to create plan:', err);
      setError(err.response?.data?.message || 'Failed to create plan');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updatePlan(selectedPlan.id, formData);
      setShowEditModal(false);
      resetForm();
      fetchPlans();
      logger.info('Plan updated successfully');
    } catch (err) {
      logger.error('Failed to update plan:', err);
      setError(err.response?.data?.message || 'Failed to update plan');
    }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deletePlan(selectedPlan.id);
      setShowDeleteModal(false);
      setSelectedPlan(null);
      fetchPlans();
      logger.info('Plan deleted successfully');
    } catch (err) {
      logger.error('Failed to delete plan:', err);
      setError(err.response?.data?.message || 'Failed to delete plan');
    }
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      id: plan.id,
      name: plan.name,
      type: plan.type,
      price_usd: plan.price_usd,
      storage_gb: plan.storage_gb,
      bandwidth_gb: plan.bandwidth_gb,
      api_calls: plan.api_calls,
      max_buckets: plan.max_buckets || 5,
      max_file_size_mb: plan.max_file_size_mb || 100,
      features: plan.features || []
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (plan) => {
    setSelectedPlan(plan);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      type: 'subscription',
      price_usd: 0,
      storage_gb: 10,
      bandwidth_gb: 10,
      api_calls: 10000,
      max_buckets: 5,
      max_file_size_mb: 100,
      features: []
    });
    setSelectedPlan(null);
  };

  const getPlanBadge = (type) => {
    const badges = {
      free: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      subscription: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      payg: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return badges[type] || badges.subscription;
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plan Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage subscription plans</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getPlanBadge(plan.type)}`}>
                  {plan.type.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEditModal(plan)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={() => openDeleteModal(plan)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
                <DollarSign className="w-6 h-6" />
                {plan.price_usd}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <HardDrive className="w-4 h-4" />
                  <span>{plan.storage_gb === -1 ? 'Unlimited' : `${plan.storage_gb} GB`} Storage</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Wifi className="w-4 h-4" />
                  <span>{plan.bandwidth_gb === -1 ? 'Unlimited' : `${plan.bandwidth_gb} GB`} Bandwidth</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Zap className="w-4 h-4" />
                  <span>{plan.api_calls === -1 ? 'Unlimited' : plan.api_calls.toLocaleString()} API Calls</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{plan.subscriber_count || 0} Subscribers</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Max {plan.max_buckets || 5} buckets • {plan.max_file_size_mb || 100} MB file limit
              </p>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Plans Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first subscription plan</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {showCreateModal ? 'Create New Plan' : 'Edit Plan'}
              </h3>
            </div>

            <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="p-6 space-y-4">
              {showCreateModal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="free">Free</option>
                  <option value="subscription">Subscription</option>
                  <option value="payg">Pay As You Go</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (USD/month)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_usd}
                    onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Storage (GB, -1 = unlimited)
                  </label>
                  <input
                    type="number"
                    value={formData.storage_gb}
                    onChange={(e) => setFormData({ ...formData, storage_gb: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bandwidth (GB, -1 = unlimited)
                  </label>
                  <input
                    type="number"
                    value={formData.bandwidth_gb}
                    onChange={(e) => setFormData({ ...formData, bandwidth_gb: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Calls (-1 = unlimited)
                  </label>
                  <input
                    type="number"
                    value={formData.api_calls}
                    onChange={(e) => setFormData({ ...formData, api_calls: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showCreateModal ? 'Create Plan' : 'Update Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Plan"
          message={`Are you sure you want to delete the "${selectedPlan?.name}" plan? This action cannot be undone.`}
          confirmText="Delete"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
    </div>
  );
};

export default AdminPlansPage;
