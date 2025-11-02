import { useState, useEffect } from 'react';
import { Check, Loader2, Star, Sparkles, Zap, TrendingDown, Shield, Rocket, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { plansAPI } from '../services/api';
import { apiCache } from '../utils/apiCache';
import { useUser } from '../context/UserContext';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        
        // Use cache wrapper with 10 minute TTL (600000ms) for plans
        // Plans rarely change, so we can cache them longer
        const response = await apiCache.wrapRequest(
          'pricing-plans',
          () => plansAPI.getAll(),
          600000 // 10 minutes cache
        );
        
        setPlans(response.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const freePlan = plans.find(p => p.type === 'free' || p.id === 'free_forever');
  const proPlan = plans.find(p => p.type === 'pro' || p.id === 'pro_monthly');
  const paygPlan = plans.find(p => p.type === 'payg' || p.id === 'payg_usage');

  const formatFeatures = (plan) => {
    if (!plan) return [];
    
    const features = [];
    
    if (plan.storage_gb) {
      features.push({ text: `${plan.storage_gb} GB Storage`, important: true });
    } else if (plan.payg_storage_rate) {
      features.push({ text: `$${plan.payg_storage_rate}/GB Storage (flexible)`, important: true });
    } else {
      features.push({ text: 'Unlimited Storage', important: true });
    }
    
    if (plan.bandwidth_gb) {
      features.push({ text: `${plan.bandwidth_gb} GB Bandwidth/month`, important: true });
    } else if (plan.payg_bandwidth_rate) {
      features.push({ text: `$${plan.payg_bandwidth_rate}/GB Bandwidth`, important: true });
    } else {
      features.push({ text: 'Flexible Bandwidth', important: true });
    }

    if (plan.free_bandwidth_multiplier) {
      features.push({ text: `${plan.free_bandwidth_multiplier}x Free Egress Bandwidth`, important: true });
    }
    
    if (plan.api_calls) {
      features.push({ text: `${plan.api_calls.toLocaleString()} API Calls/month` });
    } else {
      features.push({ text: 'Unlimited API Calls' });
    }
    
    if (plan.backup_retention_days > 0) {
      features.push({ text: `${plan.backup_retention_days}-Day Backup & Recovery`, important: true });
    }
    
    if (plan.custom_domain) {
      features.push({ text: 'Custom Domain Support' });
    }
    
    if (plan.versioning) {
      features.push({ text: 'File Versioning & History' });
    }
    
    if (plan.cdn_enabled) {
      features.push({ text: 'Global CDN Acceleration', important: true });
    }
    
    if (plan.team_members) {
      features.push({ text: `Up to ${plan.team_members} Team Member${plan.team_members > 1 ? 's' : ''}` });
    }
    
    features.push({ text: 'REST API Access' });
    features.push({ text: 'Public & Private Buckets' });
    features.push({ text: 'AES-256 Encryption' });
    features.push({ text: 'CORS Configuration' });
    
    if (plan.features) {
      if (plan.features.priority_support) {
        features.push({ text: plan.features.priority_support, important: true });
      }
      if (plan.features.support) {
        features.push({ text: plan.features.support });
      }
      if (plan.features.signed_urls) {
        features.push({ text: 'Pre-Signed URLs' });
      }
    }
    
    return features;
  };

  const handleSubscribe = (plan) => {
    if (!isAuthenticated) {
      // Store the selected plan and redirect to register
      localStorage.setItem('selectedPlan', plan.id);
      navigate('/register');
    } else {
      // Redirect to dashboard plans page for authenticated users
      navigate('/dashboard/plans');
    }
  };

  // Cloud Provider Comparison Data (Updated with accurate 2025 pricing)
  const cloudComparison = [
    {
      metric: 'Storage (per GB/month)',
      hypz: '$0.015',
      aws: '$0.023',
      gcp: '$0.020',
      azure: '$0.018',
      winner: 'HYPZ',
      note: '35% cheaper than AWS, 25% cheaper than GCP'
    },
    {
      metric: 'Bandwidth/Egress (per GB)',
      hypz: '$0.050*',
      aws: '$0.090',
      gcp: '$0.120',
      azure: '$0.087',
      winner: 'HYPZ',
      note: '*After 2x free bandwidth - 44% cheaper than AWS, 58% cheaper than GCP'
    },
    {
      metric: 'PUT/POST Requests (per 1K)',
      hypz: 'FREE',
      aws: '$0.005',
      gcp: '$0.005',
      azure: '$0.0050',
      winner: 'HYPZ'
    },
    {
      metric: 'GET Requests (per 10K)',
      hypz: '$0.0002',
      aws: '$0.0004',
      gcp: '$0.0004',
      azure: '$0.0004',
      winner: 'HYPZ',
      note: '50% cheaper than all major cloud providers!'
    },
    {
      metric: 'Free Tier',
      hypz: '1 GB + 3 GB BW (Forever)',
      aws: '5 GB (12 months)',
      gcp: '5 GB (per month)*',
      azure: '5 GB (12 months)',
      winner: 'HYPZ',
      note: '*GCP: 5GB-month of regional storage + 1GB egress to North America'
    },
    {
      metric: 'Data Transfer IN',
      hypz: 'FREE',
      aws: 'FREE',
      gcp: 'FREE',
      azure: 'FREE',
      winner: 'All Equal'
    },
    {
      metric: 'CDN Integration',
      hypz: 'Included',
      aws: '$0.085/GB extra',
      gcp: '$0.08/GB extra',
      azure: '$0.081/GB extra',
      winner: 'HYPZ'
    },
    {
      metric: 'Setup Time',
      hypz: '< 2 minutes',
      aws: '15-30 minutes',
      gcp: '20-40 minutes',
      azure: '15-30 minutes',
      winner: 'HYPZ'
    }
  ];

  // Real-world usage scenarios for comparison (Updated with $0.015/GB storage and $0.0002/10K read ops)
  const usageScenarios = [
    {
      name: 'Small App',
      description: 'Portfolio, Landing Page, Small SaaS',
      storage: 10,
      bandwidth: 30,
      requests: 100000,
      hypz: 0.67,      // (10 × 0.015) + (10 × 0.05) + (100K/10K × 0.0002) = 0.15 + 0.50 + 0.02 = 0.67
      aws: 3.23,       // (10 × 0.023) + (30 × 0.09) + (50K × 0.005/1K) + (50K × 0.0004/10K) = 0.23 + 2.70 + 0.25 + 0.02 = 3.20
      gcp: 3.80,       // (10 × 0.020) + (30 × 0.12) + (50K × 0.005/1K) + (50K × 0.0004/10K) = 0.20 + 3.60 + 0.25 + 0.02 = 4.07
      azure: 2.79      // (10 × 0.018) + (30 × 0.087) + (50K × 0.005/1K) + (50K × 0.0004/10K) = 0.18 + 2.61 + 0.25 + 0.02 = 3.06
    },
    {
      name: 'Medium Business',
      description: 'E-commerce, Blog, Medium SaaS',
      storage: 50,
      bandwidth: 150,
      requests: 500000,
      hypz: 3.26,      // (50 × 0.015) + (50 × 0.05) + (500K/10K × 0.0002) = 0.75 + 2.50 + 0.01 = 3.26
      aws: 14.65,      // (50 × 0.023) + (150 × 0.09) + (250K × 0.005/1K) + (250K × 0.0004/10K) = 1.15 + 13.50 + 1.25 + 0.10 = 16.00
      gcp: 19.00,      // (50 × 0.020) + (150 × 0.12) + (250K × 0.005/1K) + (250K × 0.0004/10K) = 1.00 + 18.00 + 1.25 + 0.10 = 20.35
      azure: 14.03     // (50 × 0.018) + (150 × 0.087) + (250K × 0.005/1K) + (250K × 0.0004/10K) = 0.90 + 13.05 + 1.25 + 0.10 = 15.30
    },
    {
      name: 'Growing Startup',
      description: 'Mobile App Backend, API Service',
      storage: 200,
      bandwidth: 500,
      requests: 2000000,
      hypz: 11.04,     // (200 × 0.015) + (100 × 0.05) + (2M/10K × 0.0002) = 3.00 + 5.00 + 0.04 = 8.04
      aws: 49.10,      // (200 × 0.023) + (500 × 0.09) + (1M × 0.005/1K) + (1M × 0.0004/10K) = 4.60 + 45.00 + 5.00 + 0.40 = 55.00
      gcp: 64.00,      // (200 × 0.020) + (500 × 0.12) + (1M × 0.005/1K) + (1M × 0.0004/10K) = 4.00 + 60.00 + 5.00 + 0.40 = 69.40
      azure: 47.10     // (200 × 0.018) + (500 × 0.087) + (1M × 0.005/1K) + (1M × 0.0004/10K) = 3.60 + 43.50 + 5.00 + 0.40 = 52.50
    },
    {
      name: 'Large Scale',
      description: 'Video Platform, Large SaaS',
      storage: 1000,
      bandwidth: 3000,
      requests: 10000000,
      hypz: 52.20,     // (1000 × 0.015) + (1000 × 0.05) + (10M/10K × 0.0002) = 15.00 + 50.00 + 0.20 = 65.20
      aws: 293.00,     // (1000 × 0.023) + (3000 × 0.09) + (5M × 0.005/1K) + (5M × 0.0004/10K) = 23.00 + 270.00 + 25.00 + 2.00 = 320.00
      gcp: 380.00,     // (1000 × 0.020) + (3000 × 0.12) + (5M × 0.005/1K) + (5M × 0.0004/10K) = 20.00 + 360.00 + 25.00 + 2.00 = 407.00
      azure: 278.00    // (1000 × 0.018) + (3000 × 0.087) + (5M × 0.005/1K) + (5M × 0.0004/10K) = 18.00 + 261.00 + 25.00 + 2.00 = 306.00
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading plans...</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            <p className="text-sm font-semibold flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Up to 70% cheaper than AWS, Azure & Google Cloud
            </p>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Start free forever. Scale as you grow. No hidden fees, no surprises. Pay only for what you use.
          </p>
        </div>
      </div>

      {/* Plans Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20">
        {!freePlan || !proPlan || !paygPlan ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No plans available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {freePlan.name}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6 min-h-[48px]">
                  {freePlan.description}
                </p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                    <span className="text-gray-500 dark:text-gray-400">forever</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2 flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    No credit card required
                  </p>
                </div>

                <div className="space-y-3 mb-8 min-h-[400px]">
                  {formatFeatures(freePlan).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`p-1 rounded-lg flex-shrink-0 ${
                        feature.important 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <Check className={`w-4 h-4 ${
                          feature.important
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <span className={`text-sm ${
                        feature.important
                          ? 'text-gray-900 dark:text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(freePlan)}
                  className="w-full py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl border-2 border-primary-400 overflow-hidden transform lg:scale-105 hover:scale-110 transition-transform">
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
                
                <p className="text-white/90 mb-6 min-h-[48px]">
                  {proPlan.description}
                </p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">${proPlan.price_usd}</span>
                    <span className="text-white/70">/month</span>
                  </div>
                  <p className="text-sm text-yellow-300 font-medium mt-2">
                    or ₹{proPlan.price_inr}/month
                  </p>
                  <p className="text-sm text-white/80 mt-1">
                    Save 60% vs AWS for similar usage
                  </p>
                </div>

                <div className="space-y-3 mb-8 min-h-[400px]">
                  {formatFeatures(proPlan).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-1 rounded-lg flex-shrink-0 bg-white/20">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className={`text-sm text-white ${
                        feature.important ? 'font-semibold' : ''
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(proPlan)}
                  className="w-full py-3 px-6 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  Upgrade to Pro
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PAYG Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{paygPlan.name}</h3>
                  <Zap className="w-6 h-6 text-primary-600" />
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6 min-h-[48px]">
                  {paygPlan.description}
                </p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                    <span className="text-gray-500 dark:text-gray-400">+ usage</span>
                  </div>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-2">
                    Pay only for what you use
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    No minimum • Cancel anytime
                  </p>
                </div>

                <div className="space-y-3 mb-8 min-h-[400px]">
                  {formatFeatures(paygPlan).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`p-1 rounded-lg flex-shrink-0 ${
                        feature.important 
                          ? 'bg-primary-100 dark:bg-primary-900/30' 
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <Check className={`w-4 h-4 ${
                          feature.important
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <span className={`text-sm ${
                        feature.important
                          ? 'text-gray-900 dark:text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(paygPlan)}
                  className="w-full py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  Start Pay-As-You-Go
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAYG Detailed Pricing */}
        <div className="mb-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Pay-As-You-Go Detailed Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="text-blue-600 dark:text-blue-400 font-semibold mb-2">Storage</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$0.015</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">per GB/month</div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-semibold">35% cheaper than AWS!</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="text-green-600 dark:text-green-400 font-semibold mb-2">Bandwidth</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$0.05</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">per GB (after 2x free)</div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-semibold">44% cheaper than AWS!</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="text-purple-600 dark:text-purple-400 font-semibold mb-2">Write Operations</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">FREE</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uploads & Deletes</div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-semibold">100% FREE vs $0.005/1K!</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="text-orange-600 dark:text-orange-400 font-semibold mb-2">Read Operations</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$0.0002</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">per 10K requests</div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-semibold">50% cheaper than competitors!</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Example: 50 GB storage + 100 GB bandwidth = <span className="font-bold text-primary-600 dark:text-primary-400">~$1.85/month</span> (vs AWS: ~$8.25/month)
            </p>
          </div>
        </div>

        {/* Cloud Comparison Table */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why HYPZ Beats the Giants
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Compare our pricing with AWS S3, Google Cloud Storage & Azure Blob Storage
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary-600 to-purple-600 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Feature</th>
                    <th className="px-6 py-4 text-center font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-5 h-5 fill-current text-yellow-400" />
                        HYPZ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">AWS S3</th>
                    <th className="px-6 py-4 text-center font-semibold">Google Cloud</th>
                    <th className="px-6 py-4 text-center font-semibold">Azure Blob</th>
                  </tr>
                </thead>
                <tbody>
                  {cloudComparison.map((item, index) => (
                    <tr 
                      key={index}
                      className={`${
                        index % 2 === 0 
                          ? 'bg-gray-50 dark:bg-gray-700/50' 
                          : 'bg-white dark:bg-gray-800'
                      } border-b border-gray-200 dark:border-gray-700`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {item.metric}
                        {item.note && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                            {item.note}
                          </div>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-center ${
                        item.winner === 'HYPZ' 
                          ? 'bg-green-100 dark:bg-green-900/30 font-bold text-green-700 dark:text-green-400' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {item.hypz}
                        {item.winner === 'HYPZ' && (
                          <div className="text-xs mt-1 flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Best Value
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                        {item.aws}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                        {item.gcp}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                        {item.azure}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <TrendingDown className="w-10 h-10 text-green-600 dark:text-green-400 mb-3" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">70% Lower Costs</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save significantly on bandwidth and operations compared to major cloud providers
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Setup Complexity</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get started in minutes. No IAM policies, no complex configurations
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <Rocket className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-3" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">True Free Tier</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our free plan never expires, unlike AWS/Azure 12-month limits
              </p>
            </div>
          </div>
        </div>

        {/* Real-World Usage Comparison */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Real-World Cost Comparison
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              See how much you'll actually pay based on real usage scenarios
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary-600 to-purple-600 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Usage Scenario</th>
                    <th className="px-6 py-4 text-center font-semibold">Storage</th>
                    <th className="px-6 py-4 text-center font-semibold">Bandwidth</th>
                    <th className="px-6 py-4 text-center font-semibold">Requests</th>
                    <th className="px-6 py-4 text-center font-semibold bg-green-600">
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 fill-current" />
                        HYPZ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">AWS S3</th>
                    <th className="px-6 py-4 text-center font-semibold">Google Cloud</th>
                    <th className="px-6 py-4 text-center font-semibold">Azure Blob</th>
                    <th className="px-6 py-4 text-center font-semibold bg-red-600">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {usageScenarios.map((scenario, index) => (
                    <tr 
                      key={index}
                      className={`${
                        index % 2 === 0 
                          ? 'bg-gray-50 dark:bg-gray-700/50' 
                          : 'bg-white dark:bg-gray-800'
                      } border-b border-gray-200 dark:border-gray-700`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{scenario.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{scenario.description}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        {scenario.storage} GB
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        {scenario.bandwidth} GB
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        {(scenario.requests / 1000).toFixed(0)}K
                      </td>
                      <td className="px-6 py-4 text-center bg-green-50 dark:bg-green-900/20">
                        <div className="font-bold text-lg text-green-700 dark:text-green-400">
                          ${scenario.hypz.toFixed(2)}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-500">/month</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="font-semibold text-gray-700 dark:text-gray-300">
                          ${scenario.aws.toFixed(2)}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400">
                          +{Math.round(((scenario.aws - scenario.hypz) / scenario.hypz) * 100)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="font-semibold text-gray-700 dark:text-gray-300">
                          ${scenario.gcp.toFixed(2)}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400">
                          +{Math.round(((scenario.gcp - scenario.hypz) / scenario.hypz) * 100)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="font-semibold text-gray-700 dark:text-gray-300">
                          ${scenario.azure.toFixed(2)}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400">
                          +{Math.round(((scenario.azure - scenario.hypz) / scenario.hypz) * 100)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center bg-red-50 dark:bg-red-900/20">
                        <div className="font-bold text-red-700 dark:text-red-400">
                          ${(scenario.aws - scenario.hypz).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">vs AWS</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation Notes */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              How We Calculate These Numbers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
              <div>
                <strong>HYPZ Pricing:</strong>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>Storage: $0.015/GB/month</li>
                  <li>Bandwidth: $0.050/GB (after 2x free)</li>
                  <li>Write Operations: FREE</li>
                  <li>Read Operations: $0.0002/10K requests</li>
                </ul>
              </div>
              <div>
                <strong>Competitors (Average):</strong>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>Storage: $0.020-0.023/GB/month</li>
                  <li>Bandwidth: $0.087-0.120/GB</li>
                  <li>Write Operations: $0.005/1K requests</li>
                  <li>Read Operations: $0.0004/10K requests</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-xs text-blue-700 dark:text-blue-400">
              * Prices are based on publicly available pricing from AWS S3, Google Cloud Storage, and Azure Blob Storage as of November 2025. 
              Actual costs may vary based on region, commitment, and specific configurations. HYPZ's 2x free bandwidth significantly reduces total cost.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-2xl p-12 border border-primary-200 dark:border-primary-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Can I upgrade or downgrade anytime?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes! Switch plans anytime. Upgrades are instant, and downgrades take effect at the next billing cycle.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">What happens if I exceed my limits?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Free plan: uploads pause. Pro plan: you're notified. PAYG: seamless scaling with usage-based billing.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Is there a long-term contract?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No contracts. All plans are month-to-month. Cancel anytime with no penalties or hidden fees.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">How does 2x free bandwidth work?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You get 2x your storage in free egress bandwidth monthly. Store 50 GB? Get 100 GB free bandwidth!
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust HYPZ for their storage needs
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
