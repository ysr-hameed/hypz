import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  CreditCard, 
  BarChart3, 
  Key, 
  Users, 
  Settings, 
  FileText,
  Wallet,
  ChevronLeft
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/buckets', icon: Database, label: 'Buckets' },
    { to: '/usage', icon: BarChart3, label: 'Usage & Stats' },
    { to: '/plans', icon: CreditCard, label: 'Plans' },
    { to: '/billing', icon: Wallet, label: 'Billing' },
    { to: '/api-keys', icon: Key, label: 'API Keys' },
    { to: '/team', icon: Users, label: 'Team' },
    { to: '/docs', icon: FileText, label: 'Documentation' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} hidden lg:block`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  Hypz
                </span>
              </div>
            )}
            {collapsed && <span className="text-2xl mx-auto">⚡</span>}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
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
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/40 px-2 py-1 rounded">
                    FREE PLAN
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Storage</span>
                    <span className="font-mono font-medium">175/500 MB</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <NavLink
                  to="/plans"
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-lg transition shadow-lg shadow-primary-500/50"
                >
                  Upgrade Plan
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
