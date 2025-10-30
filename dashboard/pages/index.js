import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowRight, Database, Zap, Shield, Globe } from 'lucide-react';
import { isAuthenticated } from '../lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                Hypz Storage
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              S3-Compatible Object Storage for India. Fast, Affordable, and Scalable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-300 dark:border-gray-600"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              S3 Compatible
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Works with all S3-compatible tools and libraries
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Optimized for Indian infrastructure and low latency
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Secure & Reliable
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enterprise-grade security with 99.9% uptime SLA
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Made for India
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Affordable pricing in INR with local payment options
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Start free, scale as you grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Free', price: '0', storage: '1 GB', bandwidth: '5 GB' },
            { name: 'Pro', price: '499', storage: '100 GB', bandwidth: '500 GB' },
            { name: 'Enterprise', price: '2,999', storage: '1 TB', bandwidth: '5 TB' },
          ].map((plan) => (
            <div
              key={plan.name}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  ₹{plan.price}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li>✓ {plan.storage} Storage</li>
                <li>✓ {plan.bandwidth} Bandwidth</li>
                <li>✓ S3-Compatible API</li>
                <li>✓ REST API & SDK</li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 Hypz Storage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
