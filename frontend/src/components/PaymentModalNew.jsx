import { useState, useEffect } from 'react';
import { X, Check, CreditCard, Loader2 } from 'lucide-react';
import { paymentAPI, plansAPI, configAPI } from '../services/api';

const PaymentModal = ({ plan, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState('US');
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);

  // Fetch backend config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await configAPI.getPublicConfig();
        setConfig(response.data);
      } catch (err) {
        console.error('Failed to fetch config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Detect user's country for payment gateway selection
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setCountry(data.country_code || 'US');
      })
      .catch(() => setCountry('US'));
  }, []);

  const isIndia = country === 'IN';
  const currency = isIndia ? 'INR' : 'USD';
  const price = isIndia ? plan.price_inr : plan.price_usd;

  // Handle Razorpay payment (for India)
  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create Razorpay order
      const response = await paymentAPI.createRazorpayOrder({
        amount: Math.round(price * 100), // Convert to paise
        planId: plan.id,
        currency: 'INR'
      });

      const { orderId, amount } = response.data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: config?.payment?.razorpay?.keyId,
          amount: amount,
          currency: 'INR',
          name: 'Hypz Storage',
          description: `Subscribe to ${plan.name}`,
          order_id: orderId,
          handler: async function (response) {
            try {
              // Verify payment on backend
              await paymentAPI.verifyRazorpayPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                planId: plan.id
              });

              // Update user's plan
              await plansAPI.updateUserPlan(plan.id);

              onSuccess?.();
              onClose();
            } catch (err) {
              setError('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            email: localStorage.getItem('userEmail') || '',
          },
          theme: {
            color: '#6366f1'
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };

      script.onerror = () => {
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
      };

    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  // Handle Lemon Squeezy payment (for international)
  const handleLemonSqueezyPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const response = await paymentAPI.createLemonSqueezyCheckout({
        variantId: plan.lemonsqueezy_variant_id,
        planId: plan.id
      });

      const { checkoutUrl } = response.data;

      // Redirect to Lemon Squeezy checkout
      window.location.href = checkoutUrl;

    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  // Handle free plan activation
  const handleFreePlan = async () => {
    try {
      setLoading(true);
      setError(null);

      await plansAPI.updateUserPlan(plan.id);

      onSuccess?.();
      onClose();
    } catch (err) {
      setError('Failed to activate plan. Please try again.');
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (plan.type === 'free' || price === 0) {
      handleFreePlan();
    } else if (isIndia) {
      handleRazorpayPayment();
    } else {
      handleLemonSqueezyPayment();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscribe to {plan.name}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Plan Details */}
          <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {plan.name}
            </h3>
            
            {/* Features */}
            <div className="space-y-2 mb-4">
              {plan.features && Array.isArray(plan.features) && plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            {plan.type !== 'free' && price > 0 ? (
              <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-700">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currency === 'INR' ? '₹' : '$'}{price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Free Forever
                </div>
              </div>
            )}
          </div>

          {/* Payment Gateway Info */}
          {plan.type !== 'free' && price > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  Payment Gateway
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {isIndia ? (
                  <>
                    Powered by <span className="font-semibold">Razorpay</span>
                    <br />
                    <span className="text-xs">Supports UPI, Cards, Net Banking, Wallets & more</span>
                  </>
                ) : (
                  <>
                    Powered by <span className="font-semibold">Lemon Squeezy</span>
                    <br />
                    <span className="text-xs">Supports Credit/Debit Cards, PayPal & more</span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Processing...' : plan.type === 'free' || price === 0 ? 'Start Free' : 'Subscribe Now'}
            </button>
          </div>

          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            By subscribing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
