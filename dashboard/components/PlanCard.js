import { Check } from 'lucide-react';

export default function PlanCard({ plan, currentPlan, onSelect, loading }) {
  const isCurrent = currentPlan === plan.id;
  const isDowngrade = ['free', 'pro', 'enterprise'].indexOf(plan.id) < 
                      ['free', 'pro', 'enterprise'].indexOf(currentPlan);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div
      className={`relative rounded-2xl p-8 ${
        isCurrent
          ? 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-2 border-primary-500'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      } transition-all hover:shadow-xl`}
    >
      {isCurrent && (
        <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Current Plan
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h3>
        <div className="flex items-baseline">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
            ₹{plan.price}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        <li className="flex items-start">
          <Check className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">
            {formatBytes(plan.features.storage)} Storage
          </span>
        </li>
        <li className="flex items-start">
          <Check className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">
            {formatBytes(plan.features.bandwidth)} Bandwidth
          </span>
        </li>
        <li className="flex items-start">
          <Check className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">
            Max file size: {formatBytes(plan.features.maxFileSize)}
          </span>
        </li>
        <li className="flex items-start">
          <Check className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">
            {formatNumber(plan.features.apiCalls)} API calls/month
          </span>
        </li>
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrent || loading || isDowngrade}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          isCurrent
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : isDowngrade
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {loading
          ? 'Processing...'
          : isCurrent
          ? 'Current Plan'
          : isDowngrade
          ? 'Downgrade Not Available'
          : plan.price === 0
          ? 'Free Plan'
          : 'Upgrade Now'}
      </button>
    </div>
  );
}
