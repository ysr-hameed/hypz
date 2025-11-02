import { useState, useEffect } from 'react';
import { usePlan } from '../../context/PlanContext';
import { formatStorage, formatBandwidth, formatApiCalls } from '../../config/plans';
import { 
  CreditCardIcon, 
  ArrowPathIcon, 
  BoltIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { SkeletonBilling } from '../../components/SkeletonLoaders';

const Billing = () => {
  const { userData, planDetails, updateRenewalSettings } = usePlan();
  const [autoRenew, setAutoRenew] = useState(userData?.currentPlan?.renewalType === 'auto');
  const [autoUpgrade, setAutoUpgrade] = useState(userData?.currentPlan?.autoUpgrade || false);
  const [showInvoices, setShowInvoices] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Mock payment methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'card_1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/26',
      isDefault: true
    }
  ]);

  // Mock invoices
  const invoices = [
    {
      id: 'inv_001',
      date: '2025-10-01',
      amount: 0,
      status: 'paid',
      plan: 'Free Plan',
      description: 'Monthly subscription'
    }
  ];

  const handleRenewalToggle = () => {
    const newRenewalType = !autoRenew ? 'auto' : 'manual';
    setAutoRenew(!autoRenew);
    updateRenewalSettings(newRenewalType, autoUpgrade);
  };

  if (loading) {
    return <SkeletonBilling />;
  }

  const handleAutoUpgradeToggle = () => {
    setAutoUpgrade(!autoUpgrade);
    updateRenewalSettings(autoRenew ? 'auto' : 'manual', !autoUpgrade);
  };

  const currency = userData?.region === 'india' ? '₹' : '$';
  const priceKey = userData?.region === 'india' ? 'priceINR' : 'priceUSD';
  const currentPrice = planDetails?.[priceKey] || 0;

  return (
    <div className="p-6 space-y-6 content-wrapper content-loaded">
      {/* Header */}
      <div className="flex justify-between items-center animate-slideIn">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>
      </div>

      {/* Current Plan Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100 text-sm mb-1">Current Plan</p>
            <h2 className="text-3xl font-bold mb-2">{planDetails?.name || 'Loading...'}</h2>
            <p className="text-blue-100 text-sm">
              {planDetails?.type === 'scalable' ? 'Pay-as-you-go billing' : 'Fixed monthly billing'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm mb-1">Monthly Cost</p>
            <p className="text-4xl font-bold">
              {currentPrice === 'usage_based' ? 'Variable' : currentPrice === 0 ? 'Free' : `${currency}${currentPrice}`}
            </p>
            {currentPrice !== 0 && currentPrice !== 'usage_based' && (
              <p className="text-blue-100 text-xs mt-1">per month</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <p className="text-blue-100 text-xs mb-1">Storage</p>
            <p className="font-semibold">{formatStorage(planDetails?.storageGB || planDetails?.freeStorageGB || 0)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs mb-1">Bandwidth</p>
            <p className="font-semibold">{formatBandwidth(planDetails?.bandwidthGB || planDetails?.freeBandwidthGB || 0)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs mb-1">API Calls</p>
            <p className="font-semibold">{formatApiCalls(planDetails?.apiCalls || planDetails?.apiFree || 0)}</p>
          </div>
        </div>

        <div className="mt-4">
          <Link
            to="/plans"
            className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            <BoltIcon className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Renewal Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <ArrowPathIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Renewal Settings</h2>
          </div>

          <div className="space-y-4">
            {/* Auto Renewal */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Auto Renewal
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically renew your subscription each billing cycle
                </p>
                {autoRenew && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Next renewal: {userData?.currentPlan?.renewalDate || 'N/A'}
                  </p>
                )}
              </div>
              <button
                onClick={handleRenewalToggle}
                disabled={planDetails?.renewal === 'auto' && autoRenew}
                className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  autoRenew ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                } ${planDetails?.renewal === 'auto' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoRenew ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto Upgrade */}
            {planDetails?.autoUpgrade !== false && (
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                    <BoltIcon className="h-4 w-4 mr-1 text-yellow-500" />
                    Auto Upgrade
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically upgrade when you exceed plan limits
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {planDetails?.afterLimit === 'auto_bill' ? 'Pay-as-you-go overages enabled' : 'Prevents service interruption'}
                  </p>
                </div>
                <button
                  onClick={handleAutoUpgradeToggle}
                  className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                    autoUpgrade ? 'bg-yellow-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoUpgrade ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Plan Behavior Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 text-sm mb-2">
                When Limits Are Reached
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {planDetails?.afterLimit === 'stop_or_upgrade' && '⛔ Service stops - upgrade required'}
                {planDetails?.afterLimit === 'auto_bill' && '💳 Automatic billing for overages'}
                {planDetails?.afterLimit === 'throttle_and_alert' && '⚠️ Service throttled with email alerts'}
                {planDetails?.afterLimit === 'contact_support' && '📞 Contact support for custom limits'}
              </p>
            </div>

            {/* Next Billing Date */}
            {userData?.currentPlan?.renewalDate && (
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Next Billing Date</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{userData.currentPlan.renewalDate}</p>
                  </div>
                </div>
                {currentPrice !== 0 && currentPrice !== 'usage_based' && (
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {currency}{currentPrice}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CreditCardIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Methods</h2>
            </div>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              + Add New
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No payment methods added</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add Payment Method
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-8 bg-gray-900 dark:bg-gray-700 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">{method.brand}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        •••• {method.last4}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Expires {method.expiry}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                    <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add UPI/Net Banking for India */}
          {userData?.region === 'india' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center mb-2">
                <BanknotesIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                <h3 className="font-semibold text-purple-900 dark:text-purple-200">Indian Payment Methods</h3>
              </div>
              <p className="text-sm text-purple-800 dark:text-purple-300 mb-3">
                Support for UPI, Net Banking, and local payment methods
              </p>
              <button className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium">
                Add UPI or Net Banking →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Billing History</h2>
          </div>
          <button
            onClick={() => setShowInvoices(!showInvoices)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showInvoices ? 'Hide' : 'Show'} Invoices
          </button>
        </div>

        {showInvoices && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {invoice.plan} - {invoice.description}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.amount === 0 ? 'Free' : `${currency}${invoice.amount}`}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : invoice.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {invoice.status === 'paid' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                        {invoice.status === 'failed' && <XCircleIcon className="h-3 w-3 mr-1" />}
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {invoices.length === 0 && (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No invoices yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Billing Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Billing Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Billing Email
            </label>
            <input
              type="email"
              value={userData?.email || ''}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Region
            </label>
            <input
              type="text"
              value={userData?.region === 'india' ? 'India' : 'Global'}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Update Billing Information
        </button>
      </div>
    </div>
  );
};

export default Billing;
