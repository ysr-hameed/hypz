import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiCheck, FiZap } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Pricing = () => {
  const { user, isAuthenticated, planData } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (planData) {
      setPlans(planData);
    } else {
      fetchPlans();
    }
  }, [planData]);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/payment/plans');
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Failed to fetch plans');
    }
  };

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      toast.error('Please login to select a plan');
      window.location.href = '/login';
      return;
    }

    if (plan.price === 0) {
      // Free plan - just update
      try {
        await api.post('/payment/create-order', { planId: plan.id });
        toast.success('Plan activated successfully');
        window.location.reload();
      } catch (error) {
        // Error handled by interceptor
      }
      return;
    }

    if (plan.name === 'Custom') {
      toast.success('Please contact sales for custom plan');
      return;
    }

    // For Pay as you go, ask for amount
    let amount = plan.price;
    if (plan.name === 'Pay As You Go') {
      const customAmount = prompt('Enter amount (₹):');
      if (!customAmount || isNaN(customAmount) || customAmount <= 0) {
        toast.error('Invalid amount');
        return;
      }
      amount = parseFloat(customAmount);
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await api.post('/payment/create-order', {
        planId: plan.id,
        customAmount: plan.name === 'Pay As You Go' ? amount : undefined
      });

      const { orderId, amount: orderAmount, currency, keyId } = orderResponse.data;

      // Load Razorpay
      const options = {
        key: keyId,
        amount: orderAmount,
        currency: currency,
        name: 'Hypz',
        description: `${plan.name} Plan`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await api.post('/payment/verify-payment', {
              orderId: orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId: plan.id
            });
            
            toast.success('Payment successful! Plan activated.');
            window.location.href = '/dashboard';
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#667eea'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Select the perfect plan for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card card-hover ${plan.name === 'Pay As You Go' ? 'border-2 border-primary-500 relative' : 'border-2 border-gray-200'}`}
            >
              {plan.name === 'Pay As You Go' && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                  <FiZap className="inline mr-1" />
                  Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-4 gradient-text">
                {plan.price === 0 ? (
                  '₹0'
                ) : plan.name === 'Custom' ? (
                  'Custom'
                ) : (
                  'Variable'
                )}
                {plan.price > 0 && plan.name !== 'Custom' && (
                  <span className="text-lg text-gray-500">/usage</span>
                )}
              </div>
              
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <ul className="space-y-3 mb-6">
                {plan.features && typeof plan.features === 'object' && Object.entries(plan.features).map(([key, value]) => (
                  <li key={key} className="flex items-start">
                    <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {value === true ? 'Yes' : value === -1 ? 'Unlimited' : value}
                    </span>
                  </li>
                ))}
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Storage: {plan.storage_limit === -1 ? 'Unlimited' : `${(plan.storage_limit / 1073741824).toFixed(0)}GB`}
                  </span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Bandwidth: {plan.bandwidth_limit === -1 ? 'Unlimited' : `${(plan.bandwidth_limit / 1073741824).toFixed(0)}GB`}
                  </span>
                </li>
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={loading || (user?.plan_id === plan.id && plan.price === 0)}
                className={`btn w-full ${plan.name === 'Pay As You Go' ? 'btn-primary' : 'btn-secondary'}`}
              >
                {user?.plan_id === plan.id && plan.price === 0 ? (
                  'Current Plan'
                ) : plan.name === 'Custom' ? (
                  'Contact Sales'
                ) : (
                  'Select Plan'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">All Plans Include</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card">
              <FiCheck className="text-green-500 text-3xl mx-auto mb-2" />
              <h3 className="font-bold mb-2">Secure Storage</h3>
              <p className="text-gray-600 text-sm">Bank-level encryption for all your files</p>
            </div>
            <div className="card">
              <FiCheck className="text-green-500 text-3xl mx-auto mb-2" />
              <h3 className="font-bold mb-2">Fast API</h3>
              <p className="text-gray-600 text-sm">Lightning-fast file uploads and downloads</p>
            </div>
            <div className="card">
              <FiCheck className="text-green-500 text-3xl mx-auto mb-2" />
              <h3 className="font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Always here to help when you need us</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

export default Pricing;
