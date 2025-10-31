import { Check, Zap, Sparkles } from 'lucide-react';

const Plans = () => {
  const plans = [
    {
      name: 'Free Plan',
      icon: <Sparkles className="w-6 h-6" />,
      price: '₹0',
      period: 'forever',
      description: 'Perfect for testing and small projects',
      features: [
        '500 MB Storage',
        '1 GB Bandwidth',
        '10,000 API Calls/month',
        'Basic Support',
        '+500 MB Bonus on signup'
      ],
      current: true
    },
    {
      name: 'Pay-As-You-Go',
      icon: <Zap className="w-6 h-6" />,
      price: 'Usage Based',
      period: 'billed monthly',
      description: 'Only pay for what you use',
      features: [
        '₹5 per GB Storage',
        '₹10 per GB Bandwidth',
        '₹0.02 per 100 API Calls',
        'Priority Support',
        'No monthly commitment'
      ],
      current: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plans & Pricing</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Choose the plan that fits your needs or upgrade anytime
        </p>
      </div>

      {/* Current Usage */}
      <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Current Plan: Free</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-8">
                <span className="text-gray-600 dark:text-gray-400">Storage Used:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">175 MB / 500 MB</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-primary-600 to-purple-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              <div className="flex items-center justify-between gap-8 mt-4">
                <span className="text-gray-600 dark:text-gray-400">Bandwidth Used:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">420 MB / 1 GB</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-primary-600 to-purple-600 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
          </div>
          <Sparkles className="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative bg-white dark:bg-gray-900 rounded-xl border-2 p-8 transition hover:shadow-xl ${
              plan.current
                ? 'border-primary-500 dark:border-primary-500 shadow-lg'
                : 'border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xs font-semibold rounded-full">
                Current Plan
              </div>
            )}

            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                    {plan.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.current ? (
              <button
                disabled
                className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                Current Plan
              </button>
            ) : (
              <button className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50">
                Upgrade to Pay-As-You-Go
              </button>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Can I switch between plans?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Yes! You can upgrade to Pay-As-You-Go anytime. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">What happens if I exceed free tier limits?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your services will be temporarily paused until you upgrade or the next billing cycle begins.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">How does Pay-As-You-Go billing work?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You're only charged for actual usage. Bills are calculated at the end of each month based on your storage, bandwidth, and API calls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
