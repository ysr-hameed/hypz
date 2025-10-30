import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiShield, FiZap, FiLock, FiCloud, FiUsers, FiTrendingUp,
  FiCheck, FiArrowRight 
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Landing = () => {
  const features = [
    {
      icon: <FiShield className="text-4xl text-primary-500" />,
      title: 'Bank-Level Security',
      description: '2FA, OAuth, and encrypted storage keep your data safe.'
    },
    {
      icon: <FiZap className="text-4xl text-primary-500" />,
      title: 'Lightning Fast',
      description: 'Optimized APIs with async support for maximum speed.'
    },
    {
      icon: <FiLock className="text-4xl text-primary-500" />,
      title: 'Privacy First',
      description: 'Your data is encrypted and never shared with third parties.'
    },
    {
      icon: <FiCloud className="text-4xl text-primary-500" />,
      title: 'Scalable Storage',
      description: 'From free tier to enterprise, we scale with your needs.'
    },
    {
      icon: <FiUsers className="text-4xl text-primary-500" />,
      title: 'OAuth Integration',
      description: 'Sign in with Google, GitHub, or email - your choice.'
    },
    {
      icon: <FiTrendingUp className="text-4xl text-primary-500" />,
      title: 'Analytics Dashboard',
      description: 'Track usage, monitor storage, and manage your account.'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-bg py-20 md:py-32 animate-gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Secure Cloud Storage
              <br />
              <span className="text-yellow-300">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Store, manage, and share your files with enterprise-grade security
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
                Get Started Free <FiArrowRight className="inline ml-2" />
              </Link>
              <a href="#features" className="btn bg-transparent border-2 border-white hover:bg-white hover:text-primary-600">
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage your files securely
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card card-hover"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="card card-hover border-2 border-gray-200"
            >
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4 gradient-text">
                ₹0<span className="text-lg text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> 1GB Storage
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> 100 Files
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Community Support
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Basic Security
                </li>
              </ul>
              <Link to="/register" className="btn btn-secondary w-full">
                Get Started
              </Link>
            </motion.div>

            {/* Pay as You Go */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="card card-hover border-2 border-primary-500 relative"
            >
              <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pay as You Go</h3>
              <div className="text-4xl font-bold mb-4 gradient-text">
                Variable<span className="text-lg text-gray-500">/usage</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Unlimited Storage
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Unlimited Files
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Email Support
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Custom Domain
                </li>
              </ul>
              <Link to="/pricing" className="btn btn-primary w-full">
                View Pricing
              </Link>
            </motion.div>

            {/* Custom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="card card-hover border-2 border-gray-200"
            >
              <h3 className="text-2xl font-bold mb-2">Custom</h3>
              <div className="text-4xl font-bold mb-4 gradient-text">
                Contact<span className="text-lg text-gray-500"></span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Enterprise Storage
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Priority Support
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Dedicated Account
                </li>
                <li className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" /> Custom Features
                </li>
              </ul>
              <Link to="/pricing" className="btn btn-secondary w-full">
                Contact Sales
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of users who trust Hypz with their data
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100">
            Create Free Account <FiArrowRight className="inline ml-2" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
