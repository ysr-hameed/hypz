import { useState } from 'react';
import { usePlan } from '../../context/PlanContext';
import { getPlanByRegion } from '../../config/plans';
import { Check, X, Zap, Shield, TrendingUp, Clock, Users, HardDrive, Radio, Code, Globe, BarChart3, RefreshCw, AlertCircle, Crown, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Plans = () => {
  const { userData, planDetails, updatePlan } = usePlan();
  const [selectedRegion, setSelectedRegion] = useState(userData?.region || 'india');
  const [showComparison, setShowComparison] = useState(false);

  const plans = getPlanByRegion(selectedRegion);
  const currency = selectedRegion === 'india' ? 'INR' : 'USD';
  const priceKey = selectedRegion === 'india' ? 'priceINR' : 'priceUSD';
  const planOrder = ['free', 'payg', 'starter', 'pro', 'business'];

  const handleUpgrade = (planId) => {
    if (confirm('Are you sure you want to upgrade to this plan?')) {
      updatePlan(planId);
      alert('Plan updated successfully! Changes will take effect immediately.');
    }
  };

  const getPlanBadge = (planKey) => {
    if (planKey === 'pro') return { text: 'MOST POPULAR', color: 'bg-gradient-to-r from-blue-500 to-purple-600', icon: Star };
    if (planKey === 'business') return { text: 'ENTERPRISE', color: 'bg-gradient-to-r from-purple-600 to-pink-600', icon: Crown };
    if (planKey === 'payg') return { text: 'FLEXIBLE', color: 'bg-gradient-to-r from-green-500 to-teal-600', icon: TrendingUp };
    return null;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num;
  };

  const getAfterLimitIcon = (afterLimit) => {
    switch(afterLimit) {
      case 'stop_or_upgrade': return { icon: AlertCircle, color: 'text-red-500' };
      case 'auto_bill': return { icon: Zap, color: 'text-yellow-500' };
      case 'throttle_and_alert': return { icon: Clock, color: 'text-orange-500' };
      case 'contact_support': return { icon: Shield, color: 'text-purple-500' };
      default: return { icon: AlertCircle, color: 'text-gray-500' };
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">HYPZ STORAGE PLANS</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Perfect Plan
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Scale your storage infrastructure effortlessly. All plans include unlimited uploads, 99.9% uptime SLA, and enterprise-grade security.
        </p>
      </div>

      {/* Region Selector */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-xl border-2 border-gray-200 dark:border-gray-700 p-1.5 bg-gray-50 dark:bg-gray-800 shadow-lg">
          <button
            onClick={() => setSelectedRegion('india')}
            className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              selectedRegion === 'india'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="mr-2">🇮🇳</span> India (INR)
          </button>
          <button
            onClick={() => setSelectedRegion('global')}
            className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              selectedRegion === 'global'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="mr-2">🌍</span> Global (USD)
          </button>
        </div>
      </div>

      {/* Current Plan Alert */}
      {planDetails && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg mr-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">CURRENT PLAN</p>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">{planDetails.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <span className="flex items-center"><HardDrive className="h-4 w-4 mr-1" /> {planDetails.storageGB || planDetails.freeStorageGB}GB Storage</span>
                  <span className="flex items-center"><Radio className="h-4 w-4 mr-1" /> {planDetails.bandwidthGB || planDetails.freeBandwidthGB}GB Bandwidth</span>
                  <span className="flex items-center"><Users className="h-4 w-4 mr-1" /> {planDetails.teamMembers} Team {planDetails.teamMembers === 1 ? 'Member' : 'Members'}</span>
                </div>
              </div>
            </div>
            <Link to="/billing" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg">
              Manage Plan
            </Link>
          </div>
        </div>
      )}

      {/* Toggle Comparison View */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 transition-colors"
        >
          <BarChart3 className="h-5 w-5" />
          {showComparison ? 'Hide' : 'Show'} Detailed Comparison
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {planOrder.map(planKey => {
          const plan = plans[planKey];
          if (!plan) return null;
          const isCurrentPlan = planDetails?.id === plan.id;
          const price = plan[priceKey];
          const badge = getPlanBadge(planKey);
          const afterLimitInfo = getAfterLimitIcon(plan.afterLimit);
          const AfterLimitIcon = afterLimitInfo.icon;

          return (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                isCurrentPlan
                  ? 'border-blue-500 ring-4 ring-blue-500/20'
                  : planKey === 'pro'
                  ? 'border-purple-500 ring-2 ring-purple-500/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Badge */}
              {badge && (
                <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${badge.color} px-4 py-1 rounded-full shadow-lg`}>
                  <div className="flex items-center text-white text-xs font-bold">
                    <badge.icon className="h-3 w-3 mr-1" />
                    {badge.text}
                  </div>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                  <Check className="h-5 w-5" />
                </div>
              )}

              <div className="text-center mb-6 mt-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{plan.name}</h3>
                
                {/* Pricing */}
                <div className="mb-4">
                  {plan.type === 'scalable' ? (
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pay as you go</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Usage-based billing</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                          {price === 0 ? 'Free' : `${currency === 'INR' ? '₹' : '$'}${price}`}
                        </span>
                        {price !== 0 && <span className="text-gray-500 dark:text-gray-400 ml-2 text-lg">/month</span>}
                      </div>
                      {price === 0 && <p className="text-sm text-green-600 dark:text-green-400 font-medium">Forever free</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-6">
                {/* Storage */}
                <div className="flex items-start text-sm">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded mr-3 flex-shrink-0">
                    <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {plan.type === 'scalable' ? (
                        <>{plan.freeStorageGB}GB free, then {currency === 'INR' ? `₹${plan.storageRateINR}` : `$${plan.storageRateUSD}`}/GB</>
                      ) : (
                        <>{plan.storageGB}GB Storage</>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cloud storage space</p>
                  </div>
                </div>

                {/* Bandwidth */}
                <div className="flex items-start text-sm">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded mr-3 flex-shrink-0">
                    <Radio className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {plan.type === 'scalable' ? (
                        <>{plan.freeBandwidthGB}GB free, then {currency === 'INR' ? `₹${plan.bandwidthRateINR}` : `$${plan.bandwidthRateUSD}`}/GB</>
                      ) : (
                        <>{plan.bandwidthGB}GB Bandwidth</>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monthly data transfer</p>
                  </div>
                </div>

                {/* API Calls */}
                <div className="flex items-start text-sm">
                  <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded mr-3 flex-shrink-0">
                    <Code className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {plan.type === 'scalable' ? (
                        <>{formatNumber(plan.apiFree)} free, then {currency === 'INR' ? `₹${plan.apiRateINR}` : `$${plan.apiRateUSD}`}/10K</>
                      ) : (
                        <>{formatNumber(plan.apiCalls)} API Calls</>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Per month</p>
                  </div>
                </div>

                {/* Uploads */}
                <div className="flex items-start text-sm">
                  <div className="p-1 bg-yellow-100 dark:bg-yellow-900/30 rounded mr-3 flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Unlimited Uploads</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">No upload limits</p>
                  </div>
                </div>

                {/* Team Members */}
                <div className="flex items-start text-sm">
                  <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded mr-3 flex-shrink-0">
                    <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{plan.teamMembers} Team {plan.teamMembers === 1 ? 'Member' : 'Members'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Collaboration slots</p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start text-sm">
                  {plan.analytics === 'advanced' ? (
                    <>
                      <div className="p-1 bg-pink-100 dark:bg-pink-900/30 rounded mr-3 flex-shrink-0">
                        <BarChart3 className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">Advanced Analytics</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Detailed insights & reports</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded mr-3 flex-shrink-0">
                        <X className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-400 dark:text-gray-500">Basic Analytics Only</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Limited reporting</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Custom Domain */}
                <div className="flex items-start text-sm">
                  {plan.customDomain ? (
                    <>
                      <div className="p-1 bg-cyan-100 dark:bg-cyan-900/30 rounded mr-3 flex-shrink-0">
                        <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">Custom Domain</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Use your own domain</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded mr-3 flex-shrink-0">
                        <X className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-400 dark:text-gray-500">No Custom Domain</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">HYPZ subdomain only</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Renewal */}
                <div className="flex items-start text-sm">
                  <div className="p-1 bg-teal-100 dark:bg-teal-900/30 rounded mr-3 flex-shrink-0">
                    <RefreshCw className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {plan.renewal === 'auto' ? 'Auto Renewal' : 
                       plan.renewal === 'manual' ? 'Manual Renewal' : 
                       'Flexible Renewal'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Billing preference</p>
                  </div>
                </div>

                {/* Auto Upgrade */}
                {plan.autoUpgrade && (
                  <div className="flex items-start text-sm">
                    <div className="p-1 bg-yellow-100 dark:bg-yellow-900/30 rounded mr-3 flex-shrink-0">
                      <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">Auto Upgrade Available</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Seamless scaling</p>
                    </div>
                  </div>
                )}
              </div>

              {/* After Limit Info */}
              <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 mb-6`}>
                <div className="flex items-start">
                  <AfterLimitIcon className={`h-4 w-4 ${afterLimitInfo.color} mr-2 flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">When limits reached:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {plan.afterLimit === 'stop_or_upgrade' && 'Service stops - upgrade required'}
                      {plan.afterLimit === 'auto_bill' && 'Automatic billing for overages'}
                      {plan.afterLimit === 'throttle_and_alert' && 'Throttle service with email alerts'}
                      {plan.afterLimit === 'contact_support' && 'Contact support for custom limits'}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrentPlan}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                  isCurrentPlan
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : planKey === 'pro'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : planKey === 'business'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 shadow-lg hover:shadow-xl'
                }`}
              >
                {isCurrentPlan ? '✓ Current Plan' : price === 0 ? 'Get Started Free' : 'Upgrade Now'}
              </button>

              {!isCurrentPlan && price !== 0 && (
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                  7-day money-back guarantee
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Comparison Table */}
      {showComparison && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            Complete Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="text-left py-4 px-6 font-bold text-gray-900 dark:text-white">Feature</th>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    return (
                      <th key={planKey} className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white min-w-[120px]">
                        {plan?.name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Storage */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Storage Space</td>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    return (
                      <td key={planKey} className="text-center py-4 px-4 text-gray-700 dark:text-gray-300">
                        {plan?.type === 'scalable' 
                          ? `${plan.freeStorageGB}GB + Pay/GB` 
                          : `${plan?.storageGB}GB`}
                      </td>
                    );
                  })}
                </tr>

                {/* Bandwidth */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Bandwidth</td>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    return (
                      <td key={planKey} className="text-center py-4 px-4 text-gray-700 dark:text-gray-300">
                        {plan?.type === 'scalable' 
                          ? `${plan.freeBandwidthGB}GB + Pay/GB` 
                          : `${plan?.bandwidthGB}GB`}
                      </td>
                    );
                  })}
                </tr>

                {/* API Calls */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">API Calls/Month</td>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    return (
                      <td key={planKey} className="text-center py-4 px-4 text-gray-700 dark:text-gray-300">
                        {plan?.type === 'scalable' 
                          ? `${formatNumber(plan.apiFree)} + Pay/10K` 
                          : formatNumber(plan?.apiCalls || 0)}
                      </td>
                    );
                  })}
                </tr>

                {/* API Downloads */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">API Downloads</td>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    return (
                      <td key={planKey} className="text-center py-4 px-4 text-gray-700 dark:text-gray-300">
                        {plan?.apiDownloadLimit ? formatNumber(plan.apiDownloadLimit) : 'Unlimited'}
                      </td>
                    );
                  })}
                </tr>

                {/* API Uploads */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">API Uploads</td>
                  {planOrder.map(planKey => (
                    <td key={planKey} className="text-center py-4 px-4">
                      <span className="inline-flex items-center text-green-600 dark:text-green-400 font-semibold">
                        <Check className="h-5 w-5 mr-1" /> Unlimited
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Team Members */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Team Members</td>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    return (
                      <td key={planKey} className="text-center py-4 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                        {plan?.teamMembers}
                      </td>
                    );
                  })}
                </tr>

                {/* Analytics */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Analytics</td>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    return (
                      <td key={planKey} className="text-center py-4 px-4">
                        {plan?.analytics === 'advanced' ? (
                          <span className="text-green-600 dark:text-green-400 font-semibold">Advanced</span>
                        ) : (
                          <span className="text-gray-400">Basic</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Custom Domain */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Custom Domain</td>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    return (
                      <td key={planKey} className="text-center py-4 px-4">
                        {plan?.customDomain ? (
                          <Check className="h-6 w-6 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Auto Upgrade */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Auto Upgrade</td>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    return (
                      <td key={planKey} className="text-center py-4 px-4">
                        {plan?.autoUpgrade ? (
                          <Check className="h-6 w-6 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Renewal Type */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Renewal Type</td>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    return (
                      <td key={planKey} className="text-center py-4 px-4 text-gray-700 dark:text-gray-300 text-sm">
                        {plan?.renewal === 'auto' ? 'Automatic' : 
                         plan?.renewal === 'manual' ? 'Manual' : 
                         'Flexible'}
                      </td>
                    );
                  })}
                </tr>

                {/* After Limit Behavior */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">After Limit</td>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    return (
                      <td key={planKey} className="text-center py-4 px-4 text-xs text-gray-600 dark:text-gray-400">
                        {plan?.afterLimit === 'stop_or_upgrade' && 'Stop/Upgrade'}
                        {plan?.afterLimit === 'auto_bill' && 'Auto Bill'}
                        {plan?.afterLimit === 'throttle_and_alert' && 'Throttle'}
                        {plan?.afterLimit === 'contact_support' && 'Custom'}
                      </td>
                    );
                  })}
                </tr>

                {/* Price */}
                <tr className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                  <td className="py-4 px-6 text-lg text-gray-900 dark:text-white">Monthly Price</td>
                  {planOrder.map(planKey => {
                    const plan = plans[planKey];
                    const price = plan?.[priceKey];
                    return (
                      <td key={planKey} className="text-center py-4 px-4 text-lg text-gray-900 dark:text-white">
                        {price === 'usage_based' ? 'Variable' : 
                         price === 0 ? 'FREE' : 
                         `${currency === 'INR' ? '₹' : '$'}${price}`}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">?</span>
              Can I upgrade or downgrade anytime?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Yes! You can change your plan at any time. Upgrades are instant, and downgrades take effect at the end of your current billing cycle.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">?</span>
              What happens when I exceed my limits?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Depending on your plan: Free stops at limit, PAYG auto-bills for overages, Starter/Pro throttles with alerts, Business gets custom limits.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">?</span>
              Do you offer refunds?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              We offer a 7-day money-back guarantee on all paid plans. No questions asked. Just contact support to request a refund.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">?</span>
              Need a custom enterprise plan?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Contact our sales team for custom pricing, dedicated support, SLA guarantees, and volume discounts for your organization.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">?</span>
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              We accept credit/debit cards, UPI, net banking (for India), PayPal, and wire transfers for enterprise plans.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">?</span>
              Is there a free trial for paid plans?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Start with our Free plan to test the platform. When you upgrade, you're covered by our 7-day money-back guarantee.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-2xl">
        <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
        <p className="text-lg mb-6 opacity-90">Our team is here to help you choose the perfect plan</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">
            Contact Sales
          </button>
          <button className="px-8 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg border-2 border-white/20">
            View Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Plans;
