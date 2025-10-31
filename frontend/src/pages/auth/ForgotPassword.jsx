import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 animate-slideIn">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-3xl">⚡</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Hypz
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset your password</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Enter your email to receive reset instructions</p>
      </div>

      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="john@example.com"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-lg font-medium transition shadow-lg shadow-primary-500/50"
        >
          Send Reset Link
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700">
          <ArrowLeft size={16} className="mr-2" />
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
