import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CreditCard, 
  RefreshCw, 
  Download, 
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Settings as SettingsIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import apiConfig from '../../config/api';
import { logger } from '../../utils/logger';

const Billing = () => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [usageCost, setUsageCost] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [autoRenew, setAutoRenew] = useState(true);
  const [updating, setUpdating] = useState(false);

  const api = useMemo(() => axios.create({
    baseURL: apiConfig.API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }), []);

  const fetchBillingData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch subscription status
      const subRes = await api.get('/subscriptions/status');
      setSubscription(subRes.data.data || subRes.data);
      setAutoRenew(subRes.data.data?.auto_renew ?? subRes.data.auto_renew ?? true);

      // Fetch current usage cost (for PAYG users)
      try {
        const usageRes = await api.get('/subscriptions/usage-cost');
        setUsageCost(usageRes.data.data || usageRes.data);
      } catch (err) {
        // Not a PAYG user or no usage yet
        logger.debug('No usage cost data available:', err);
      }

      // Fetch payment history
      try {
        const historyRes = await api.get('/payments/history');
        const historyData = historyRes.data.data || historyRes.data;
        setPaymentHistory(historyData.payments || historyData || []);
      } catch (err) {
        logger.error('Failed to fetch payment history:', err);
        setPaymentHistory([]);
      }

      // Fetch pending invoices
      try {
        const invoicesRes = await api.get('/subscriptions/pending-invoices');
        const invoicesData = invoicesRes.data.data || invoicesRes.data;
        setPendingInvoices(invoicesData.invoices || invoicesData || []);
      } catch (err) {
        logger.debug('No pending invoices:', err);
        setPendingInvoices([]);
      }

    } catch (error) {
      logger.error('Failed to load billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleAutoRenewToggle = async () => {
    setUpdating(true);
    try {
      await api.put('/subscriptions/auto-renew', { autoRenew: !autoRenew });
      setAutoRenew(!autoRenew);
      toast.success(`Auto-renewal ${!autoRenew ? 'enabled' : 'disabled'}`);
    } catch (error) {
      logger.error('Failed to update auto-renewal setting:', error);
      toast.error('Failed to update auto-renewal setting');
    } finally {
      setUpdating(false);
    }
  };

  const handlePayInvoice = async (billingId) => {
    try {
      await api.post('/subscriptions/pay-invoice', { billingId });
      toast.success('Payment successful!');
      fetchBillingData(); // Refresh data
    } catch (error) {
      logger.error('Failed to pay invoice:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: AlertCircle },
      past_due: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', icon: XCircle },
      cancelled: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-300', icon: XCircle }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your subscription, payments, and billing history
        </p>
      </div>

      {/* Current Subscription Card */}
      <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/80 text-sm mb-1">Current Subscription</p>
            <h2 className="text-3xl font-bold">{subscription?.plan_name || 'Free Plan'}</h2>
            <p className="text-white/90 mt-1">{subscription?.plan_type || 'free'} plan</p>
          </div>
          <div className="text-right">
            {getStatusBadge(subscription?.status || 'active')}
          </div>
        </div>

        {subscription?.current_period_end && (
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Next billing: {formatDate(subscription.current_period_end)}</span>
          </div>
        )}

        {/* Auto-Renewal Toggle */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Auto-Renewal</p>
              <p className="text-sm text-white/80">
                {autoRenew ? 'Your subscription will renew automatically' : 'You need to manually renew'}
              </p>
            </div>
            <button
              onClick={handleAutoRenewToggle}
              disabled={updating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRenew ? 'bg-white' : 'bg-white/30'
              } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-primary-600 transition-transform ${
                  autoRenew ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Current Month Usage (PAYG Only) */}
      {usageCost && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Month Usage & Costs</h3>
              {usageCost.plan && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {usageCost.plan.name} Plan • Billing Period: {formatDate(usageCost.billingPeriod.start)} - {formatDate(usageCost.billingPeriod.end)}
                </p>
              )}
            </div>
          </div>

          {/* Main Usage Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{usageCost.usage.storageGB} GB</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-semibold">{formatCurrency(usageCost.costs.storage)}</p>
              {usageCost.plan?.storageLimit > 0 && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Limit: {usageCost.plan.storageLimit} GB
                </p>
              )}
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Bandwidth</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{usageCost.usage.bandwidthGB} GB</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1 font-semibold">{formatCurrency(usageCost.costs.bandwidth)}</p>
              {usageCost.plan?.bandwidthLimit > 0 && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Limit: {usageCost.plan.bandwidthLimit} GB
                </p>
              )}
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">Meta Operations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(usageCost.usage.uploadCalls + usageCost.usage.deleteCalls + usageCost.usage.listCalls).toLocaleString()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-semibold">{formatCurrency(usageCost.costs.metaOps)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Upload, Delete, List</p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Access Operations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {usageCost.usage.downloadCalls.toLocaleString()}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1 font-semibold">{formatCurrency(usageCost.costs.accessOps)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Download Operations</p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Detailed Usage Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Upload</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{usageCost.usage.uploadGB} GB</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{usageCost.usage.uploadCalls.toLocaleString()} calls</p>
              </div>

              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Download</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{usageCost.usage.downloadGB} GB</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{usageCost.usage.downloadCalls.toLocaleString()} calls</p>
              </div>

              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Delete</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{usageCost.usage.deleteCalls.toLocaleString()}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">operations</p>
              </div>

              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">List</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{usageCost.usage.listCalls.toLocaleString()}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">operations</p>
              </div>

              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total API</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{usageCost.usage.apiCalls.toLocaleString()}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">calls</p>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg p-6 border-2 border-primary-200 dark:border-primary-700">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Storage Cost</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(usageCost.costs.storage)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Bandwidth Cost</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(usageCost.costs.bandwidth)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Meta Ops Cost</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(usageCost.costs.metaOps)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Access Ops Cost</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(usageCost.costs.accessOps)}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-xs text-primary-600 dark:text-primary-400 mb-1 font-semibold">TOTAL COST</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(usageCost.costs.total)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              This amount will be charged on the 1st of next month
            </p>
          </div>
        </div>
      )}

      {/* Pending Invoices */}
      {Array.isArray(pendingInvoices) && pendingInvoices.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pending Invoices</h3>
          </div>

          <div className="space-y-3">
            {pendingInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Invoice for {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Amount: {formatCurrency(invoice.total_cost)}
                  </p>
                </div>
                <button
                  onClick={() => handlePayInvoice(invoice.id)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition"
                >
                  Pay Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment History</h3>
        </div>

        {!Array.isArray(paymentHistory) || paymentHistory.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">No payment history yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Gateway</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {payment.plan_name || payment.billing_reason || 'Subscription payment'}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {payment.payment_gateway === 'lemonsqueezy' ? 'Lemon Squeezy' : payment.payment_gateway || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'completed' || payment.status === 'paid'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {payment.invoice_url && (
                        <a 
                          href={payment.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 inline-flex items-center gap-1 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={fetchBillingData}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="font-medium">Refresh Data</span>
        </button>

        <button
          onClick={() => window.location.href = '/pricing'}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-medium"
        >
          <SettingsIcon className="w-5 h-5" />
          <span>Change Plan</span>
        </button>
      </div>
    </div>
  );
};

export default Billing;
