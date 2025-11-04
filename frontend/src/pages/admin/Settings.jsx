import { Settings as SettingsIcon, Save } from 'lucide-react';

const AdminSettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure platform settings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center py-12">
          <SettingsIcon className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Settings Coming Soon</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Configure system-wide settings, email templates, payment gateways, and feature flags.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
