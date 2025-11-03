import { useState, useEffect } from 'react';
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

const Billing = () => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [usageCost, setUsageCost] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [autoRenew, setAutoRenew] = useState(true);
  const [updating, setUpdating] = useState(false);

  const api = axios.create({
    baseURL: apiConfig.API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
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
        console.log('No usage cost data');
      }

      // Fetch payment history
      try {
        const historyRes = await api.get('/payments/history');
        setPaymentHistory(historyRes.data.data || historyRes.data || []);
      } catch (err) {
        console.error('Failed to fetch payment history:', err);
      }

      // Fetch pending invoices
      try {
        const invoicesRes = await api.get('/subscriptions/pending-invoices');
        setPendingInvoices(invoicesRes.data.data || invoicesRes.data || []);
      } catch (err) {
        console.log('No pending invoices');
      }

    } catch (error) {
      console.error('Failed to load billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoRenewToggle = async () => {
    setUpdating(true);
    try {
      await api.put('/subscriptions/auto-renew', { autoRenew: !autoRenew });
      setAutoRenew(!autoRenew);
      toast.success(`Auto-renewal ${!autoRenew ? 'enabled' : 'disabled'}`);
    } catch (error) {
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
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Month Usage</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Storage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{usageCost.usage.storageGB} GB</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formatCurrency(usageCost.costs.storage)}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bandwidth</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{usageCost.usage.bandwidthGB} GB</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formatCurrency(usageCost.costs.bandwidth)}</p>
            </div>

            <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4">
              <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">Estimated Total</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(usageCost.costs.total)}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Billing period: {formatDate(usageCost.billingPeriod.start)} - {formatDate(usageCost.billingPeriod.end)}
          </p>
        </div>
      )}

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
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

        {paymentHistory.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">No payment history yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Amount</th>
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
                      {payment.billing_reason || 'Subscription payment'}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
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
