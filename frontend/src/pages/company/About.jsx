import { Link } from 'react-router-dom';
import { Users, Target, Heart, Zap, Award, Globe } from 'lucide-react';
import SEO from '../../components/SEO';

const About = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Hypz',
    description: 'Learn about Hypz - modern, affordable cloud storage for everyone',
    mainEntity: {
      '@type': 'Organization',
      name: 'Hypz',
      description: 'Cloud object storage provider',
      url: 'https://hypz.io'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <SEO
        title="About Us - Hypz | Modern Cloud Storage Company"
        description="Learn about Hypz's mission to provide fast, reliable, and affordable cloud storage for everyone. Discover our values, team, and commitment to innovation."
        keywords="about hypz, cloud storage company, our mission, our values, about us"
        url="/about"
        structuredData={structuredData}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <Users className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Hypz
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Fast, reliable, and affordable cloud storage for everyone
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Mission */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              At Hypz, we believe cloud storage should be fast, simple, and affordable for everyone. We're building
              the next generation of cloud infrastructure that empowers developers and businesses to scale without
              breaking the bank. Our mission is to democratize access to enterprise-grade cloud storage.
            </p>
          </div>

          {/* Values */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Values</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary-600" />
                  Speed & Performance
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Lightning-fast uploads and downloads with global CDN infrastructure.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-600" />
                  Reliability
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  99.9% uptime SLA with automatic failover and redundancy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary-600" />
                  Transparency
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Clear pricing, no hidden fees, and honest communication.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  Customer First
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Dedicated support and continuous improvement based on feedback.
                </p>
              </div>
            </div>
          </div>

          {/* Story */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                Founded in 2025, Hypz was born out of frustration with expensive and complex cloud storage solutions.
                We saw developers and startups struggling with unpredictable bills and complicated pricing structures.
              </p>
              <p>
                We set out to build something better - a cloud storage platform that's powerful enough for enterprises
                yet simple and affordable enough for solo developers. Today, we serve thousands of users worldwide,
                storing petabytes of data with lightning-fast performance.
              </p>
              <p>
                We're just getting started. Join us on our journey to make cloud storage accessible to everyone.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">Hypz by the Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-1">99.9%</div>
                <div className="text-sm opacity-90">Uptime SLA</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">10k+</div>
                <div className="text-sm opacity-90">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">5PB+</div>
                <div className="text-sm opacity-90">Data Stored</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">150+</div>
                <div className="text-sm opacity-90">Countries</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to get started?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition shadow-lg"
            >
              Sign Up Free
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:border-primary-600 transition"
            >
              Contact Sales
            </Link>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
