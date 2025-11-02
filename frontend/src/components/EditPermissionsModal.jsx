import { X, Shield, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

const EditPermissionsModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentPermissions = { read: true, write: true, delete: false },
  keyName 
}) => {
  const [permissions, setPermissions] = useState(currentPermissions || { read: true, write: true, delete: false });
  const [saving, setSaving] = useState(false);

  // Update permissions when currentPermissions changes
  useEffect(() => {
    if (currentPermissions) {
      setPermissions(currentPermissions);
    }
  }, [currentPermissions]);

  if (!isOpen || !currentPermissions) return null;

  const handleTogglePermission = (permission) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(permissions);
      onClose();
    } catch (error) {
      console.error('Failed to save permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  const permissionsList = [
    {
      key: 'read',
      label: 'Read',
      description: 'View buckets and download files',
      color: 'blue'
    },
    {
      key: 'write',
      label: 'Write',
      description: 'Upload and modify files',
      color: 'green'
    },
    {
      key: 'delete',
      label: 'Delete',
      description: 'Delete files and buckets',
      color: 'red'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Permissions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {keyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Configure what actions this API key is allowed to perform
          </p>

          {permissionsList.map((perm) => (
            <div
              key={perm.key}
              className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                permissions[perm.key]
                  ? `border-${perm.color}-500 bg-${perm.color}-50 dark:bg-${perm.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
              }`}
              onClick={() => handleTogglePermission(perm.key)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={`font-semibold ${
                      permissions[perm.key]
                        ? `text-${perm.color}-700 dark:text-${perm.color}-300`
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {perm.label}
                    </h4>
                    {permissions[perm.key] && (
                      <Check size={16} className={`text-${perm.color}-600`} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {perm.description}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={permissions[perm.key]}
                    onChange={() => handleTogglePermission(perm.key)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${perm.color}-600`}></div>
                </label>
              </div>
            </div>
          ))}

          {!permissions.read && !permissions.write && !permissions.delete && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start space-x-2">
              <Shield size={18} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Warning: API key with no permissions will not be able to perform any actions
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPermissionsModal;
