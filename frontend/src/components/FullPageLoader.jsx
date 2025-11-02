import { Loader2 } from 'lucide-react';

const FullPageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
              <span className="text-white text-2xl font-bold">H</span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl blur opacity-25 animate-pulse"></div>
          </div>
        </div>
        
        {/* Spinner */}
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
        
        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {message}
        </p>
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-1 mt-4">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default FullPageLoader;
