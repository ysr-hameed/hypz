import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import {
  LayoutDashboard,
  Users,
  Database,
  Activity,
  Settings,
  FileText,
  CreditCard,
  Bell,
  Shield,
  BarChart3,
  Server,
  Key,
  Globe,
  Package,
  Boxes,
  LogOut,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';

const AdminLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-500' },
    { path: '/admin/users', icon: Users, label: 'Users', color: 'text-green-500' },
    { path: '/admin/buckets', icon: Database, label: 'Buckets', color: 'text-purple-500' },
    { path: '/admin/files', icon: FileText, label: 'Files', color: 'text-orange-500' },
    { path: '/admin/storage', icon: Server, label: 'Storage', color: 'text-cyan-500' },
    { path: '/admin/billing', icon: CreditCard, label: 'Billing', color: 'text-yellow-500' },
    { path: '/admin/plans', icon: Package, label: 'Plans', color: 'text-pink-500' },
    { path: '/admin/api-keys', icon: Key, label: 'API Keys', color: 'text-indigo-500' },
    { path: '/admin/activity', icon: Activity, label: 'Activity Logs', color: 'text-red-500' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'text-teal-500' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications', color: 'text-amber-500' },
    { path: '/admin/security', icon: Shield, label: 'Security', color: 'text-rose-500' },
    { path: '/admin/cors', icon: Globe, label: 'CORS', color: 'text-emerald-500' },
    { path: '/admin/webhooks', icon: Boxes, label: 'Webhooks', color: 'text-violet-500' },
    { path: '/admin/settings', icon: Settings, label: 'Settings', color: 'text-gray-500' }
  ];

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('admin_verified');
    sessionStorage.removeItem('admin_verified_time');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 fixed h-full z-30`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 ${sidebarOpen ? item.color : ''} flex-shrink-0`} />
              {sidebarOpen && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Logged in as {user?.email}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.first_name?.[0] || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
