import { isDevelopment, shouldBypassAuth } from '../config/env';
import { Shield, ShieldOff } from 'lucide-react';

const EnvIndicator = () => {
  // Only show in development
  if (!isDevelopment()) return null;

  const bypassAuth = shouldBypassAuth();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium shadow-lg backdrop-blur-sm border ${
        bypassAuth 
          ? 'bg-green-500/90 text-white border-green-600' 
          : 'bg-yellow-500/90 text-white border-yellow-600'
      }`}>
        {bypassAuth ? (
          <>
            <ShieldOff className="w-4 h-4" />
            <span>DEV MODE - Auth Disabled</span>
          </>
        ) : (
          <>
            <Shield className="w-4 h-4" />
            <span>DEV MODE - Auth Enabled</span>
          </>
        )}
      </div>
    </div>
  );
};

export default EnvIndicator;
