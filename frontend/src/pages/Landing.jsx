import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Globe, Code, Check, Star } from 'lucide-react';

const Landing = () => {
  const features = [
    { icon: Zap, title: 'Lightning Fast', description: 'Upload and deliver files at blazing speeds with our global CDN' },
    { icon: Shield, title: 'Secure & Reliable', description: 'Enterprise-grade security with 99.99% uptime SLA' },
    { icon: Globe, title: 'Global CDN', description: 'Serve content from 100+ edge locations worldwide' },
    { icon: Code, title: 'Developer First', description: 'Simple REST API with SDKs for all major languages' },
  ];

  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-primary-950 dark:via-purple-950 dark:to-pink-950 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
                <Star size={16} fill="currentColor" />
                <span>Now with 99.99% uptime SLA</span>
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white">
              Object Storage
              <span className="block bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Built for Developers
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Store, manage, and deliver files globally with our S3-compatible object storage. Simple pricing, powerful APIs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-lg transition shadow-xl shadow-primary-500/50"
              >
                Start Free Trial
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
              >
                View Documentation
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-green-500" />
                <span>500 MB free forever</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to scale
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Built with modern technologies for maximum performance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Start free, pay as you grow
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 border-gray-200 dark:border-gray-700">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free Plan</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">For testing & development</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">₹0</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">forever</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400"><strong>500 MB</strong> storage</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400"><strong>1 GB</strong> bandwidth/month</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400"><strong>10,000</strong> API calls/month</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No credit card required</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">+500 MB bonus first 30 days</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center px-6 py-3 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 font-medium rounded-lg transition"
              >
                Start Free
              </Link>
            </div>

            {/* Pay-As-You-Go Plan */}
            <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                  POPULAR
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pay-As-You-Go</h3>
                <p className="text-white/80 text-sm">Scale as you grow</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Usage Based</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90"><strong>₹5/GB/month</strong> storage</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90"><strong>₹10/GB</strong> bandwidth</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90"><strong>₹0.02/100</strong> API calls</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">First 10,000 API calls free</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">Email/SMS alerts at 80% usage</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center px-6 py-3 text-primary-600 bg-white hover:bg-gray-100 font-medium rounded-lg transition shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Join thousands of developers using Hypz for their storage needs
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-primary-600 bg-white hover:bg-gray-100 rounded-lg transition shadow-2xl"
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
