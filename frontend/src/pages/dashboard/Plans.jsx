import { useState, useEffect } from 'react';
import { Check, Loader2, Star, Sparkles, Zap } from 'lucide-react';
import { plansAPI } from '../../services/api';
import PaymentModal from '../../components/PaymentModalNew';
import { SkeletonPlans } from '../../components/SkeletonLoaders';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await plansAPI.getAll();
        setPlans(response.data || []);
        
        try {
          const currentPlanResponse = await plansAPI.getUserPlan();
          setCurrentPlan(currentPlanResponse.data?.plan);
        } catch (err) {
          console.log('No current plan found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load plans');
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };

    fetchPlans();
  }, []);

  const freePlan = plans.find(p => p.type === 'free' || p.id === 'free_forever');
  const proPlan = plans.find(p => p.type === 'pro' || p.id === 'pro_monthly');
  const paygPlan = plans.find(p => p.type === 'payg' || p.id === 'payg_usage');

  // Helper function to convert plan data to array of feature strings
  const formatFeatures = (plan) => {
    if (!plan) return [];
    
    const features = [];
    
    if (plan.storage_gb) {
      features.push(`${plan.storage_gb} GB Storage`);
    } else if (plan.payg_storage_rate) {
      features.push(`$${plan.payg_storage_rate}/GB Storage`);
    }
    
    if (plan.bandwidth_gb) {
      features.push(`${plan.bandwidth_gb} GB Bandwidth/month`);
    } else if (plan.payg_bandwidth_rate) {
      features.push(`$${plan.payg_bandwidth_rate}/GB Bandwidth`);
    }
    
    if (plan.api_calls) {
      features.push(`${plan.api_calls.toLocaleString()} API Calls/month`);
    }
    
    if (plan.backup_retention_days > 0) {
      features.push(`${plan.backup_retention_days}-Day Auto Backup`);
    }
    
    if (plan.custom_domain) {
      features.push('Custom Domain Support');
    }
    
    if (plan.versioning) {
      features.push('File Versioning');
    }
    
    if (plan.cdn_enabled) {
      features.push('Global CDN');
    }
    
    if (plan.team_members) {
      features.push(`${plan.team_members} Team Member${plan.team_members > 1 ? 's' : ''}`);
    }
    
    // Add JSONB features
    if (plan.features) {
      if (plan.features.priority_support) {
        features.push(plan.features.priority_support);
      }
      if (plan.features.support) {
        features.push(plan.features.support);
      }
      if (plan.features.signed_urls) {
        features.push('Signed URLs');
      }
    }
    
    return features;
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    plansAPI.getUserPlan().then(response => {
      setCurrentPlan(response.data?.plan);
    });
  };

  if (loading) {
    return <SkeletonPlans />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-6 max-w-md">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 content-wrapper content-loaded">
      <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white py-20 animate-slideIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
          {currentPlan && (
            <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full">
              <p className="text-sm">Current Plan: <span className="font-semibold">{currentPlan.name}</span></p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20">
        {!freePlan || !proPlan || !paygPlan ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No plans available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
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
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                    <span className="text-gray-500 dark:text-gray-400">forever</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">
                    No credit card required
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {formatFeatures(freePlan).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 py-2">
                      <div className="p-1.5 rounded-lg flex-shrink-0 bg-green-100 dark:bg-green-900/30">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(freePlan)}
                  disabled={currentPlan?.id === freePlan.id}
                  className="w-full py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentPlan?.id === freePlan.id ? 'Current Plan' : 'Get Started Free'}
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl border-2 border-primary-400 overflow-hidden">
              <div className="absolute -top-1 -right-1">
                <div className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-bl-2xl font-bold text-sm flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  MOST POPULAR
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-bold text-white">{proPlan.name}</h3>
                  <Zap className="w-6 h-6 text-yellow-400 fill-current" />
                </div>
                
                <p className="text-white/90 mb-6">
                  {proPlan.description}
                </p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">${proPlan.price_usd}</span>
                    <span className="text-white/70">/month</span>
                  </div>
                  <p className="text-sm text-white/80 font-medium mt-2">
                    100 GB Storage • 30-Day Backup • Priority Support
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {formatFeatures(proPlan).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 py-2">
                      <div className="p-1.5 rounded-lg flex-shrink-0 bg-white/20">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-white font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(proPlan)}
                  disabled={currentPlan?.id === proPlan.id}
                  className="w-full py-3 px-6 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentPlan?.id === proPlan.id ? 'Current Plan' : 'Upgrade to Pro'}
                </button>
              </div>
            </div>

            {/* PAYG Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{paygPlan.name}</h3>
                  <Zap className="w-6 h-6 text-primary-600" />
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {paygPlan.description}
                </p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                    <span className="text-gray-500 dark:text-gray-400">+ usage</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-2">
                    Pay only for what you use • No minimums
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {formatFeatures(paygPlan).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 py-2">
                      <div className="p-1.5 rounded-lg flex-shrink-0 bg-primary-100 dark:bg-primary-900/30">
                        <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(paygPlan)}
                  disabled={currentPlan?.id === paygPlan.id}
                  className="w-full py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentPlan?.id === paygPlan.id ? 'Current Plan' : 'Start Pay-As-You-Go'}
                </button>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <h4 className="text-white font-semibold mb-3 text-sm">Example Pricing:</h4>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="space-y-2 text-sm text-white/90">
                      <div className="flex justify-between">
                        <span>Storage</span>
                        <span className="font-mono">$0.023/GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bandwidth</span>
                        <span className="font-mono">$0.09/GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Calls</span>
                        <span className="font-mono">$0.40/10K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-2xl p-12 border border-primary-200 dark:border-primary-800 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Need Help Choosing?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start with the Free plan and upgrade anytime. No commitments, no surprises.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => window.location.href = '/dashboard/documentation'}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              View Documentation
            </button>
            <button
              onClick={() => window.location.href = '/contact'}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-lg"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Plans;
