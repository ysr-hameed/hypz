import { Check, Zap, TrendingUp, Bell, CreditCard } from 'lucide-react';

const Plans = () => {
  return (
    <div className="space-y-8 animate-slideIn max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Start free, scale as you grow</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 transition">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🧪 Free Plan</h2>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-sm font-semibold rounded-full">
              ACTIVE
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Perfect for students, developers, or teams testing Hypz APIs before going live.</p>
          
          <div className="mb-8">
            <span className="text-5xl font-bold text-gray-900 dark:text-white">₹0</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">forever</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">💾 500 MB Storage</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Permanent file storage</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">🌐 1 GB Bandwidth / month</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly download quota</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">⚙️ 10,000 API Calls / month</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload, list, delete, and access APIs</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">📅 Lifetime Validity</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">For testing only - May slow after 30 days inactive</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">💸 No Card Required</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Start immediately</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Zap size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">🎁 Launch Bonus</p>
                <p className="text-sm text-green-600 dark:text-green-400">+500 MB extra storage for first 30 days!</p>
              </div>
            </div>
          </div>

          <button className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Pay-As-You-Go Plan */}
        <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
              ⭐ POPULAR
            </span>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">💰 Pay-As-You-Go Plan</h2>
          <p className="text-white/90 mb-6">No monthly commitment — just top-up your wallet and pay for actual usage.</p>
          
          <div className="mb-8">
            <span className="text-5xl font-bold text-white">Usage Based</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">💾 ₹5 / GB / month</p>
                <p className="text-sm text-white/80">Storage - Billed daily, charged monthly</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">🌐 ₹10 / GB</p>
                <p className="text-sm text-white/80">Bandwidth - Pay for file delivery/download</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">⚙️ ₹0.02 / 100 calls</p>
                <p className="text-sm text-white/80">API Calls - First 10,000 free every month</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">�� ₹10 Minimum Bill</p>
                <p className="text-sm text-white/80">Only when usage exceeds free tier</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">🔄 30-Day Billing Cycle</p>
                <p className="text-sm text-white/80">Auto-deduct from Razorpay wallet or card</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Bell size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">🔔 Usage Alerts</p>
                <p className="text-sm text-white/90">Email/SMS at 80% usage - Prevent surprise billing</p>
              </div>
            </div>
          </div>

          <button className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-primary-600 rounded-lg font-medium transition shadow-xl">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Features Comparison */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Feature</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Free Plan</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Pay-As-You-Go</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Storage</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">500 MB</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Bandwidth</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">1 GB/month</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">API Calls</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">10,000/month</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">CDN</td>
                <td className="py-3 px-4 text-center"><Check className="mx-auto text-green-500" size={20} /></td>
                <td className="py-3 px-4 text-center"><Check className="mx-auto text-green-500" size={20} /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">SSL/TLS</td>
                <td className="py-3 px-4 text-center"><Check className="mx-auto text-green-500" size={20} /></td>
                <td className="py-3 px-4 text-center"><Check className="mx-auto text-green-500" size={20} /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Priority Support</td>
                <td className="py-3 px-4 text-center text-gray-400">-</td>
                <td className="py-3 px-4 text-center"><Check className="mx-auto text-green-500" size={20} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Plans;
