import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import logger from '../../utils/logger';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getSettings();
      setSettings(response.data);
    } catch (err) {
      logger.error('Failed to fetch settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key, value) => {
    try {
      await adminAPI.updateSetting(key, value);
      setSuccess(`Setting "${key}" updated successfully`);
      setTimeout(() => setSuccess(''), 3000);
      fetchSettings();
    } catch (err) {
      logger.error('Failed to update setting:', err);
      setError(err.response?.data?.message || 'Failed to update setting');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure platform-wide settings</p>
        </div>
        <button 
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(settings).map(([category, categorySettings]) => (
          <div key={category} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
              {category.replace('_', ' ')}
            </h3>
            <div className="space-y-4">
              {categorySettings.map((setting) => (
                <div key={setting.key} className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{setting.key}</div>
                    {setting.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{setting.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={typeof setting.value === 'object' ? JSON.stringify(setting.value) : setting.value}
                      onBlur={(e) => {
                        if (e.target.value !== setting.value) {
                          let newValue = e.target.value;
                          try {
                            newValue = JSON.parse(e.target.value);
                          } catch {
                            // Keep as string if not valid JSON
                          }
                          handleUpdateSetting(setting.key, newValue);
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(settings).length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <SettingsIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Settings</h3>
            <p className="text-gray-600 dark:text-gray-400">No system settings configured yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
