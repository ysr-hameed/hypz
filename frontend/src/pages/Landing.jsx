import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Globe, Code, Check, Star } from 'lucide-react';
import { PLANS_DATA } from '../config/plans';
import { useUser } from '../context/UserContext';
import SEO from '../components/SEO';

const Landing = () => {
  const { isAuthenticated } = useUser();
  const freePlan = PLANS_DATA.plans.free;
  const paygPlan = PLANS_DATA.plans.payg;
  
  const features = [
    { icon: Zap, title: 'Lightning Fast', description: 'Upload and deliver files at blazing speeds with our global CDN' },
    { icon: Shield, title: 'Secure & Reliable', description: 'Enterprise-grade security with 99.99% uptime SLA' },
    { icon: Globe, title: 'Global CDN', description: 'Serve content from 100+ edge locations worldwide' },
    { icon: Code, title: 'Developer First', description: 'Simple REST API with SDKs for all major languages' },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Hypz Object Storage',
    description: 'S3-compatible object storage solution with global CDN, enterprise security, and developer-friendly APIs',
    brand: {
      '@type': 'Brand',
      name: 'Hypz'
    },
    offers: {
      '@type': 'AggregateOffer',
      offerCount: '3',
      lowPrice: '0',
      highPrice: '49',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '250',
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950">
      <SEO
        title="Hypz - Modern Object Storage Solution | Secure Cloud Storage"
        description="S3-compatible object storage powered by Backblaze B2. Secure, scalable, cost-effective cloud storage with global CDN. Perfect for developers and enterprises. Start free with 500MB."
        keywords="object storage, cloud storage, s3 compatible, backblaze b2, cdn storage, developer storage, api storage, secure file storage, scalable storage"
        url="/"
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="inline-block animate-bounce-slow">
              <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/40 dark:to-purple-900/40 text-primary-700 dark:text-primary-300 text-sm font-medium border border-primary-200 dark:border-primary-800">
                <Star size={16} fill="currentColor" className="text-yellow-500" />
                <span>Now with 99.99% uptime SLA</span>
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              Object Storage
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Built for Developers
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300">
              Store, manage, and deliver files globally with our S3-compatible object storage. Simple pricing, powerful APIs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-xl transition-all duration-300 shadow-2xl shadow-purple-500/50 hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-xl transition-all duration-300 shadow-2xl shadow-purple-500/50 hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              )}
              <Link
                to="/docs"
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-400 dark:hover:border-purple-500 rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
              >
                View Documentation
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-green-500 dark:text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-green-500 dark:text-green-400" />
                <span className="font-semibold">1 GB free forever</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to scale
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Built with modern technologies for maximum performance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Start free, pay as you grow
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-300">
              <div className="mb-6">
                <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full mb-3">
                  FREE FOREVER
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{freePlan.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Perfect to get started</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$0</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2 text-lg">forever</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300"><strong className="text-blue-600 dark:text-blue-400">{freePlan.features.storage.amount} {freePlan.features.storage.unit}</strong> storage</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300"><strong className="text-blue-600 dark:text-blue-400">{freePlan.features.bandwidth.amount} {freePlan.features.bandwidth.unit}</strong> bandwidth/month</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300"><strong className="text-blue-600 dark:text-blue-400">{(freePlan.features.apiCalls.amount / 1000).toFixed(0)}K</strong> API calls/month</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">No credit card required</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300"><strong className="text-blue-600 dark:text-blue-400">{freePlan.features.buckets.amount}</strong> storage buckets</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center px-6 py-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-semibold rounded-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800 hover:scale-105"
              >
                Start Free
              </Link>
            </div>

            {/* Pay-As-You-Go Plan */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
              <div className="relative">
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/30 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
                    ⭐ POPULAR
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{paygPlan.name}</h3>
                  <p className="text-white/90 text-sm">Scale without limits</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">Pay as you use</span>
                  <p className="text-white/90 text-sm mt-2 font-medium">
                    {paygPlan.baseIncludes.storage.amount}GB storage + {paygPlan.baseIncludes.bandwidth.amount}GB bandwidth free
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3">
                    <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white"><strong className="text-yellow-300">${paygPlan.pricing.storage.usd}/GB/month</strong> storage</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white"><strong className="text-yellow-300">${paygPlan.pricing.bandwidth.usd}/GB</strong> bandwidth</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white"><strong className="text-yellow-300">${paygPlan.pricing.apiCalls.usd}/1M</strong> API calls</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white font-semibold">Unlimited everything</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white font-semibold">Priority support</span>
                  </li>
                </ul>
                <Link
                  to="/pricing"
                  className="block w-full text-center px-6 py-3 text-purple-600 bg-white hover:bg-gray-100 font-bold rounded-xl transition-all duration-300 shadow-2xl hover:scale-105"
                >
                  View Full Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-white/95 mb-8">
            Join thousands of developers using Hypz for their storage needs
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 text-lg font-bold text-purple-600 bg-white hover:bg-gray-100 rounded-xl transition-all duration-300 shadow-2xl hover:scale-110"
          >
            Create Free Account
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
