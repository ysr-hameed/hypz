import { useState } from 'react';
import {
  Check,
  X,
  Zap,
  TrendingUp,
  Shield,
  Globe,
  Database,
  Activity,
  CreditCard,
  ArrowRight,
  Info,
  Star,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { PLANS_DATA, COMPETITOR_PRICING, CURRENCIES, formatPrice, calculatePaygCost } from '../../config/plans';

const Plans = () => {
  const [selectedCurrency] = useState('USD');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showComparison, setShowComparison] = useState(true);

  const freePlan = PLANS_DATA.plans.free;
  const paygPlan = PLANS_DATA.plans.payg;

  const exampleUsage = {
    storage: 100,
    bandwidth: 500,
    apiCalls: 5000000
  };

  const paygExample = calculatePaygCost(
    exampleUsage.storage,
    exampleUsage.bandwidth,
    exampleUsage.apiCalls,
    selectedCurrency
  );

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const FeatureItem = ({ included, text, highlight }) => (
    <div className="flex items-start gap-3 py-2">
      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
        included 
          ? 'bg-green-100 dark:bg-green-900/30' 
          : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        {included ? (
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
        ) : (
          <X className="w-4 h-4 text-gray-400 dark:text-gray-600" />
        )}
      </div>
      <div className="flex-1">
        <span className={`text-sm ${
          included 
            ? 'text-gray-900 dark:text-white font-medium' 
            : 'text-gray-500 dark:text-gray-500 line-through'
        }`}>
          {text}
        </span>
        {highlight && (
          <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
            {highlight}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises. All prices in USD.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {freePlan.name}
                </h3>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-sm font-semibold">Perfect Start</span>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Perfect for testing and small projects
              </p>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    $0
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">forever</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">
                  No credit card required
                </p>
              </div>

              <div className="space-y-1 mb-8">
                <FeatureItem 
                  included={true} 
                  text={`${freePlan.features.storage.amount}${freePlan.features.storage.unit} Storage`}
                />
                <FeatureItem 
                  included={true} 
                  text={`${freePlan.features.bandwidth.amount}${freePlan.features.bandwidth.unit} Bandwidth/month`}
                />
                <FeatureItem 
                  included={true} 
                  text={`${(freePlan.features.apiCalls.amount / 1000).toFixed(0)}K API Calls/month`}
                />
                <FeatureItem 
                  included={true} 
                  text={`${freePlan.features.buckets.amount} Storage Bucket${freePlan.features.buckets.amount > 1 ? 's' : ''}`}
                />
                <FeatureItem 
                  included={true} 
                  text={`Max ${freePlan.features.fileSize.amount}${freePlan.features.fileSize.unit} file size`}
                />
                <FeatureItem 
                  included={true} 
                  text="Community Support"
                />
                <FeatureItem 
                  included={false} 
                  text="Custom Domain"
                />
                <FeatureItem 
                  included={false} 
                  text="Webhooks"
                />
                <FeatureItem 
                  included={false} 
                  text="Advanced Analytics"
                />
                <FeatureItem 
                  included={false} 
                  text="Priority Support"
                />
              </div>

              <button
                onClick={() => window.location.href = '/register'}
                className="w-full py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg"
              >
                Get Started Free
              </button>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl border-2 border-primary-400 overflow-hidden">
            <div className="absolute -top-1 -right-1">
              <div className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-bl-2xl font-bold text-sm flex items-center gap-1 shadow-lg">
                <Sparkles className="w-4 h-4" />
                MOST POPULAR
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-bold text-white">
                  {paygPlan.name}
                </h3>
                <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
              
              <p className="text-white/90 mb-6">
                Scale without limits, pay only for what you use
              </p>

              <div className="mb-8">
                <div className="text-4xl font-bold text-white mb-3">
                  Pay as you go
                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-white/80 text-sm mb-2">Base includes (FREE):</p>
                  <div className="space-y-1 text-white font-medium">
                    <div>✓ {paygPlan.baseIncludes.storage.amount}GB Storage</div>
                    <div>✓ {paygPlan.baseIncludes.bandwidth.amount}GB Bandwidth (3x storage)</div>
                    <div>✓ {(paygPlan.baseIncludes.apiCalls.amount / 1000).toFixed(0)}K API Calls</div>
                    <div>✓ Unlimited Upload API Calls</div>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-8 border border-white/20">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Usage-Based Pricing
                </h4>
                <div className="space-y-2 text-white/90 text-sm">
                  <div className="flex justify-between">
                    <span>Storage</span>
                    <span className="font-semibold">
                      {formatPrice(paygPlan.pricing.storage[selectedCurrency.toLowerCase()], selectedCurrency)}/GB/month
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bandwidth</span>
                    <span className="font-semibold">
                      {formatPrice(paygPlan.pricing.bandwidth[selectedCurrency.toLowerCase()], selectedCurrency)}/GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Calls</span>
                    <span className="font-semibold">
                      {formatPrice(paygPlan.pricing.apiCalls[selectedCurrency.toLowerCase()], selectedCurrency)}/1K calls
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/20">
                    <p className="text-xs text-white/70">
                      * Upload API calls are unlimited and free
                    </p>
                    <p className="text-xs text-white/70">
                      * Other API calls: First 50K free, then $0.008 per 1,000 calls
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <FeatureItem included={true} text="Unlimited Storage" highlight="∞" />
                <FeatureItem included={true} text="Unlimited Bandwidth" highlight="∞" />
                <FeatureItem included={true} text="Unlimited API Calls" highlight="∞" />
                <FeatureItem included={true} text="Unlimited Buckets" />
                <FeatureItem included={true} text="Up to 100GB file size" />
                <FeatureItem included={true} text="Custom Domain" />
                <FeatureItem included={true} text="Webhooks" />
                <FeatureItem included={true} text="Advanced Analytics" />
                <FeatureItem included={true} text="Priority Support" />
                <FeatureItem included={true} text="99.9% SLA" />
              </div>

              <button
                onClick={() => handleSubscribe(paygPlan)}
                className="w-full py-3 px-6 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-xl flex items-center justify-center gap-2 group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-600" />
            Cost Example - Pay-As-You-Go
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            See how affordable our PAYG plan can be
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Example Usage:</h4>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Storage</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{exampleUsage.storage}GB</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Bandwidth</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{exampleUsage.bandwidth}GB</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">API Calls</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{(exampleUsage.apiCalls / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Estimated Monthly Cost:</h4>
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-primary-200 dark:border-primary-700">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {formatPrice(paygExample, selectedCurrency)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">per month</p>
                </div>
                <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    Including {paygPlan.baseIncludes.storage.amount}GB free storage, {paygPlan.baseIncludes.bandwidth.amount}GB free bandwidth, and {(paygPlan.baseIncludes.apiCalls.amount / 1000).toFixed(0)}K free API calls
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Comparison - Real Example */}
        {showComparison && (
          <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Real Cost Comparison
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based on: 10GB storage + 50GB bandwidth + 100K API calls/month
                </p>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Example Scenario Card */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Example Usage Scenario</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Storage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">10 GB</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bandwidth</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">50 GB</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">API Calls</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">100K</p>
                </div>
              </div>
            </div>

            {/* Price Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Hypz Card */}
              <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Star className="w-6 h-6 fill-current text-yellow-300" />
                </div>
                <div className="mb-4">
                  <p className="text-xs opacity-90 mb-1">Your Price</p>
                  <h4 className="text-lg font-bold mb-2">Hypz</h4>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-1">
                    ${((10 - paygPlan.freeStorageGB) * paygPlan.storageRateUSD + (50 - paygPlan.freeBandwidthGB) * paygPlan.bandwidthRateUSD + ((100000 - paygPlan.apiFree) / 1000000) * paygPlan.apiRateUSD).toFixed(2)}
                  </div>
                  <p className="text-xs opacity-90">per month</p>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <p className="text-xs opacity-90 mb-2">Breakdown:</p>
                  <p className="text-xs">Storage: ${((10 - paygPlan.freeStorageGB) * paygPlan.storageRateUSD).toFixed(2)}</p>
                  <p className="text-xs">Bandwidth: ${((50 - paygPlan.freeBandwidthGB) * paygPlan.bandwidthRateUSD).toFixed(2)}</p>
                  <p className="text-xs">API: ${(((100000 - paygPlan.apiFree) / 1000000) * paygPlan.apiRateUSD).toFixed(2)}</p>
                </div>
              </div>

              {/* Competitor Cards */}
              {COMPETITOR_PRICING.map((competitor, index) => {
                const totalCost = (10 * competitor.storage) + (50 * competitor.bandwidth) + ((100000 / 1000000) * competitor.apiCalls);
                const hypzCost = (10 - paygPlan.freeStorageGB) * paygPlan.storageRateUSD + (50 - paygPlan.freeBandwidthGB) * paygPlan.bandwidthRateUSD + ((100000 - paygPlan.apiFree) / 1000000) * paygPlan.apiRateUSD;
                const savings = totalCost - hypzCost;
                const savingsPercent = ((savings / totalCost) * 100).toFixed(0);
                
                return (
                  <div key={competitor.name} className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Competitor</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{competitor.logo}</span>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">{competitor.name}</h4>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        ${totalCost.toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">per month</p>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Breakdown:</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Storage: ${(10 * competitor.storage).toFixed(2)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Bandwidth: ${(50 * competitor.bandwidth).toFixed(2)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">API: ${((100000 / 1000000) * competitor.apiCalls).toFixed(2)}</p>
                      {savings > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                            +${savings.toFixed(2)} more ({savingsPercent}%)
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 italic">{competitor.notes}</p>
                  </div>
                );
              })}
            </div>

            {/* Savings Highlight */}
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-600 rounded-full">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Why Hypz is Better
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">Includes Free Tier</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{paygPlan.freeStorageGB}GB storage + {paygPlan.freeBandwidthGB}GB bandwidth + {(paygPlan.apiFree / 1000).toFixed(0)}K API calls free</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">Transparent Pricing</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">No hidden fees or complex tiers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">Better Performance</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Global CDN with 50+ edge locations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">Developer Friendly</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Simple API, great documentation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                Can I switch plans anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We accept all major credit cards, debit cards, UPI, and international payments via Stripe.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                Is my data secure?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Absolutely! We use enterprise-grade encryption, regular backups, and comply with international security standards.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary-600" />
                Do you offer refunds?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-2xl p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of developers building amazing applications with Hypz
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/register'}
              className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-xl"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => window.location.href = '/documentation'}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              View Documentation
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Subscribe to {selectedPlan?.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Payment integration coming soon...
            </p>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full py-3 px-6 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
