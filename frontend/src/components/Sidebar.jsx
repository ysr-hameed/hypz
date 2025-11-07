import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  CreditCard, 
  BarChart3, 
  Key, 
  Settings,
  Zap,
  ShieldCheck,
  X,
  FolderOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { usageAPI, plansAPI } from '../services/api';
import { apiCache } from '../utils/apiCache';
import { logger } from '../utils/logger';

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit, setStorageLimit] = useState(1073741824); // 1GB default
  const [planName, setPlanName] = useState('FREE PLAN');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        // Fetch usage data with cache
        const usageResponse = await apiCache.wrapRequest(
          'usage:current',
          () => usageAPI.getCurrent(),
          30000 // 30 second cache
        );
        const usage = usageResponse.data;
        
        // Fetch current plan with cache
        const planResponse = await apiCache.wrapRequest(
          'plan:current',
          () => plansAPI.getUserPlan(),
          60000 // 60 second cache
        );
        
        const planData = planResponse.data?.plan;
        setStorageUsed(usage.month?.storage_bytes || 0);
        setStorageLimit((planData?.storage_gb || 1) * 1024 * 1024 * 1024);
        setPlanName(planData?.name?.toUpperCase() || 'FREE PLAN');
        setLoading(false);
      } catch (error) {
        logger.error('Failed to fetch storage data:', error);
        setLoading(false);
      }
    };

    fetchStorageData();
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/file-manager', icon: FolderOpen, label: 'File Manager' },
    { to: '/buckets', icon: Database, label: 'Buckets' },
    { to: '/usage', icon: BarChart3, label: 'Usage' },
    { to: '/billing', icon: CreditCard, label: 'Billing' },
    { to: '/api-keys', icon: Key, label: 'API Keys' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} hidden lg:block`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  Hypz
                </span>
              </div>
            )}
            {collapsed && (
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                  title={collapsed ? item.label : ''}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Plan Info */}
          {!collapsed && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/40 px-2 py-1 rounded">
                    {planName}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Storage</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">
                      {loading ? '...' : `${formatBytes(storageUsed)} / ${formatBytes(storageLimit)}`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-300" 
                      style={{ width: `${storagePercent}%` }}
                    ></div>
                  </div>
                </div>
                <a
                  href="/plans"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-lg transition"
                >
                  Upgrade Plan
                </a>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transition-transform duration-300 ease-in-out lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo with Close Button */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Hypz
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Plan Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/40 px-2 py-1 rounded">
                  {planName}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Storage</span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white">
                    {loading ? '...' : `${formatBytes(storageUsed)} / ${formatBytes(storageLimit)}`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-300" 
                    style={{ width: `${storagePercent}%` }}
                  ></div>
                </div>
              </div>
              <NavLink
                to="/plans"
                onClick={closeMobileMenu}
                className="block w-full text-center px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-lg transition"
              >
                Upgrade Plan
              </NavLink>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
