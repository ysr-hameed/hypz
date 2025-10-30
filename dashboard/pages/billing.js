import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import PlanCard from '../components/PlanCard';
import { billingAPI } from '../lib/api';
import { displayRazorpay } from '../lib/razorpay';
import { isAuthenticated, getUser } from '../lib/auth';

export default function Billing() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getUser();
    setCurrentPlan(user?.plan || 'free');
    fetchPlans();
  }, [router]);

  const fetchPlans = async () => {
    try {
      const response = await billingAPI.getPlans();
      setPlans(response.data.data);
    } catch (error) {
      toast.error('Failed to load plans');
    }
  };

  const handleSelectPlan = async (plan) => {
    if (plan.price === 0) return;

    setLoading(true);
    try {
      // Create order
      const orderResponse = await billingAPI.createOrder({ plan: plan.id });
      const orderData = orderResponse.data.data;

      const user = getUser();

      // Display Razorpay payment
      displayRazorpay(
        {
          ...orderData,
          email: user.email,
        },
        async (paymentData) => {
          // Verify payment
          try {
            await billingAPI.verifyPayment(paymentData);
            toast.success('Payment successful! Plan upgraded.');
            
            // Update local user data
            const updatedUser = { ...user, plan: plan.id };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentPlan(plan.id);
            
            router.push('/dashboard');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        (error) => {
          toast.error(error || 'Payment cancelled');
        }
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Upgrade to unlock more storage and features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              onSelect={handleSelectPlan}
              loading={loading}
            />
          ))}
        </div>

        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Payment Methods
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">UPI</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cards</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Net Banking</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Wallets</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            Secure payments powered by Razorpay. All prices in INR.
          </p>
        </div>
      </main>
    </div>
  );
}
