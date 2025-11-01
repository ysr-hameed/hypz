import { useState, useEffect } from 'react';
import { X, Check, CreditCard, Calendar, Loader2 } from 'lucide-react';
import { paymentAPI } from '../services/api';

const PaymentModal = ({ plan, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState('US');
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Detect user's country
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

  const handleApplyCoupon = () => {
    // Simulate coupon validation
    if (couponCode === 'WELCOME10') {
      setAppliedCoupon({ code: 'WELCOME10', discount: 10, type: 'percentage' });
    } else if (couponCode === 'SAVE20') {
      setAppliedCoupon({ code: 'SAVE20', discount: 20, type: 'percentage' });
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleSubscribe = () => {
    const message = `
Subscribing to ${plan?.name}
Currency: ${currency}
Payment Method: ${paymentMethod === 'auto' ? 'Automatic' : 'Manual'}
Billing Cycle: ${billingCycle}
Provider: ${provider === 'razorpay' ? 'Razorpay' : 'Lemon Squeezy'}
${appliedCoupon ? `Coupon: ${appliedCoupon.code} (${appliedCoupon.discount}% off)` : ''}

Backend integration needed for actual payment processing.
    `;
    alert(message);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscribe to {plan?.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Currency
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CURRENCIES.map((curr) => (
                <div
                  key={curr.code}
                  className={`p-3 rounded-lg border-2 transition-all cursor-default ${
                    currency === curr.code
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1 text-center">{curr.flag}</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white text-center">{curr.code}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 text-center">{curr.symbol}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Payment processed via <span className="font-semibold">{provider === 'razorpay' ? 'Razorpay' : 'Lemon Squeezy'}</span>
                </p>
              </div>
              {provider === 'razorpay' && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-6">
                  Supports UPI, Cards, Net Banking, and more
                </p>
              )}
              {provider === 'lemonsqueezy' && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-6">
                  Supports Credit/Debit Cards, PayPal, and more
                </p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          {plan?.id !== 'plan_free' && plan?.type !== 'free' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary-600 dark:hover:border-primary-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="auto"
                      checked={paymentMethod === 'auto'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">Auto Payment</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Automatic monthly billing based on usage</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary-600 dark:hover:border-primary-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="manual"
                      checked={paymentMethod === 'manual'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">Manual Payment</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Pay manually each month</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Billing Cycle */}
              {plan?.type === 'payg' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Billing Cycle
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        billingCycle === 'monthly'
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">Monthly</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Billed monthly</div>
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`p-4 rounded-lg border-2 transition-all relative ${
                        billingCycle === 'yearly'
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Save 10%
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">Yearly</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Annual billing</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Coupon Code (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    {appliedCoupon.discount}% discount applied!
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Try: WELCOME10 or SAVE20
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plan</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{plan?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {plan?.type === 'payg' ? 'Usage-Based' : 'Fixed'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Billing</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{paymentMethod === 'auto' ? 'Automatic' : 'Manual'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cycle</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">{billingCycle}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span className="font-semibold">-{appliedCoupon.discount}%</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                      <span>Starting at</span>
                      <span>{plan?.type === 'payg' ? formatPrice(0, currency) + '+ usage' : formatPrice(0, currency)}</span>
                    </div>
                    {plan?.type === 'payg' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Free tier included, pay only for what you use
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Free Plan Info */}
          {(plan?.id === 'plan_free' || plan?.type === 'free') && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Free Plan - No Payment Required
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Get started immediately with our free tier. No credit card required. You can upgrade anytime as your needs grow.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubscribe}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
            >
              {plan?.id === 'plan_free' || plan?.type === 'free' ? 'Start Free' : 'Subscribe Now'}
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
