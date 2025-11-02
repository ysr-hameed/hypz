import { useState, useEffect, useRef } from 'react';
import { User, Bell, Shield, Mail, Key, QrCode, Copy, Check, AlertTriangle, Loader2, Lock } from 'lucide-react';
import { twoFactorAPI, authAPI, userAPI } from '../../services/api';
import { useUser } from '../../context/UserContext';
import { toast } from 'react-hot-toast';
import { apiCache } from '../../utils/apiCache';
import { SkeletonSettings } from '../../components/SkeletonLoaders';

// Helper function to parse user agent string
const parseUserAgent = (userAgent) => {
  if (!userAgent) return 'Unknown Device';
  
  // Detect browser
  let browser = 'Unknown Browser';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown OS';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  
  return `${browser} on ${os}`;
};

const Settings = () => {
  const { user: contextUser, updateUser, fetchUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [backupCodes, setBackupCodes] = useState(null);
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    usageAlerts: true,
    billingReminders: true,
    securityUpdates: true,
    marketingEmails: false,
    productUpdates: true
  });
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Initialize from context user
    if (contextUser) {
      // Use firstName/lastName from API, or parse from name field as fallback
      if (contextUser.firstName || contextUser.lastName) {
        setFirstName(contextUser.firstName || '');
        setLastName(contextUser.lastName || '');
      } else if (contextUser.name) {
        const nameParts = contextUser.name.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
      }
      setEmail(contextUser.email || '');
      setLoading(false);
    }
  }, [contextUser]);

  useEffect(() => {
    // Prevent double fetch in React StrictMode
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Force refresh on component mount to get latest 2FA status
    fetch2FAStatus(true);
    fetchTrustedDevices(true);
    fetchNotificationPreferences();
  }, []);

  const fetch2FAStatus = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        apiCache.clear('2fa:status');
      }
      const response = await apiCache.wrapRequest(
        '2fa:status',
        () => twoFactorAPI.get2FAStatus(),
        30000 // 30 second cache
      );
      console.log('2FA Status fetched:', response.data);
      setTwoFactorStatus(response.data);
    } catch (error) {
      console.error('Failed to get 2FA status:', error);
      setTwoFactorStatus({ enabled: false, backupCodesCount: 0 });
    }
  };

  const fetchTrustedDevices = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        apiCache.clear('2fa:trusted-devices');
      }
      const res = await apiCache.wrapRequest(
        '2fa:trusted-devices',
        () => twoFactorAPI.getTrustedDevices(),
        30000 // 30 second cache
      );
      setTrustedDevices(res.data.devices || []);
    } catch (error) {
      console.error('Failed to fetch trusted devices:', error);
      setTrustedDevices([]);
    }
  };

  const handleSetup2FA = async () => {
    try {
      const response = await twoFactorAPI.setup2FA();
      setSecret(response.data.secret);
      setQrCode(response.data.qrCode);
      setShow2FASetup(true);
      toast.success('Scan the QR code with your authenticator app');
    } catch (error) {
      toast.error(error.message || 'Failed to setup 2FA');
    }
  };

  const handleEnable2FA = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      const response = await twoFactorAPI.enable2FA(verificationToken);
      setBackupCodes(response.data.backupCodes);
      setShow2FASetup(false);
      setVerificationToken('');
      
      // Clear cache and force refresh
      apiCache.clear('2fa:status');
      await fetch2FAStatus(true);
      
      toast.success('2FA enabled successfully! Save your backup codes.');
    } catch (error) {
      // Check if it's already enabled (400 error)
      if (error.message && error.message.includes('already enabled')) {
        apiCache.clear('2fa:status');
        await fetch2FAStatus(true);
        toast.info('2FA is already enabled');
      } else {
        toast.error(error.message || 'Invalid verification code');
      }
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast.error('Please enter your password');
      return;
    }

    try {
      await twoFactorAPI.disable2FA(disablePassword);
      setDisablePassword('');
      setBackupCodes(null);
      
      // Clear cache and force refresh
      apiCache.clear('2fa:status');
      await fetch2FAStatus(true);
      await fetchTrustedDevices(true);
      
      toast.success('2FA disabled successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to disable 2FA');
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    setSavingProfile(true);
    try {
      await userAPI.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });
      
      // Update context user
      const updatedName = `${firstName} ${lastName}`.trim();
      updateUser({ name: updatedName, firstName, lastName });
      
      // Force refresh user data from server after update
      await fetchUser(true);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const response = await userAPI.getNotificationPreferences();
      setNotifications({
        emailNotifications: response.data.email_notifications,
        usageAlerts: response.data.usage_alerts,
        billingReminders: response.data.billing_reminders,
        securityUpdates: response.data.security_updates,
        marketingEmails: response.data.marketing_emails || false,
        productUpdates: response.data.product_updates
      });
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      await userAPI.updateNotificationPreferences(notifications);
      toast.success('Notification preferences updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update notification preferences');
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await userAPI.changePassword({
        currentPassword,
        newPassword
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
      
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevokeDevice = async (id) => {
    // Confirm before revoking
    if (!window.confirm('Are you sure you want to revoke this trusted device? You will need to verify with 2FA on your next login from this device.')) {
      return;
    }
    
    try {
      await twoFactorAPI.revokeTrustedDevice(id);
      toast.success('Trusted device revoked successfully');
      
      // Clear cache and force refresh
      apiCache.clear('2fa:trusted-devices');
      fetchTrustedDevices(true);
    } catch (err) {
      toast.error(err.message || 'Failed to revoke device');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return <SkeletonSettings />;
  }

  return (
    <div className="space-y-6 content-wrapper content-loaded">
      <div className="animate-slideIn">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account preferences and security</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-slideIn">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              disabled
              className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed" 
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <button 
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50 disabled:opacity-50 flex items-center gap-2"
          >
            {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
          </div>
          {!showChangePassword && (
            <button
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition text-sm"
            >
              Change Password
            </button>
          )}
        </div>

        {showChangePassword && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white" 
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white" 
                placeholder="Enter new password (min. 8 characters)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white" 
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowChangePassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
              >
                {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Preferences Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive all notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailNotifications}
                onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Usage Alerts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when you reach usage limits</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.usageAlerts}
                onChange={(e) => setNotifications({ ...notifications, usageAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Billing Reminders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive reminders about upcoming payments</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.billingReminders}
                onChange={(e) => setNotifications({ ...notifications, billingReminders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Security Updates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Important security alerts and updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.securityUpdates}
                onChange={(e) => setNotifications({ ...notifications, securityUpdates: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Marketing Emails</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Promotions and special offers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.marketingEmails}
                onChange={(e) => setNotifications({ ...notifications, marketingEmails: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Product Updates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">New features and product announcements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.productUpdates}
                onChange={(e) => setNotifications({ ...notifications, productUpdates: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <button 
            onClick={handleSaveNotifications}
            disabled={savingNotifications}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {savingNotifications && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Notification Preferences
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
        </div>

        {twoFactorStatus?.enabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">2FA is Enabled</p>
                <p className="text-sm text-green-700 dark:text-green-300">Your account is protected with two-factor authentication</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter password to disable 2FA</label>
              <input 
                type="password" 
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white" 
                placeholder="Your password"
              />
            </div>

            <button 
              onClick={handleDisable2FA}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              Disable 2FA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">2FA is Disabled</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Enable 2FA to add an extra layer of security to your account</p>
              </div>
            </div>

            {!show2FASetup ? (
              <button 
                onClick={handleSetup2FA}
                className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50 flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Enable 2FA
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  {qrCode && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Or enter this code manually:</p>
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-lg">
                          <code className="text-sm font-mono text-gray-900 dark:text-white">{secret}</code>
                          <button
                            onClick={() => copyToClipboard(secret)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                          >
                            {copiedCode ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter 6-digit code from your app
                  </label>
                  <input 
                    type="text" 
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white text-center text-2xl font-mono tracking-widest" 
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleEnable2FA}
                    disabled={verificationToken.length !== 6}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50 disabled:opacity-50"
                  >
                    Verify & Enable
                  </button>
                  <button 
                    onClick={() => {
                      setShow2FASetup(false);
                      setQrCode(null);
                      setSecret(null);
                      setVerificationToken('');
                    }}
                    className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Backup Codes Display */}
        {backupCodes && backupCodes.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900 dark:text-red-100">Save Your Backup Codes</p>
                <p className="text-sm text-red-700 dark:text-red-300">Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 px-3 py-2 rounded font-mono text-sm text-gray-900 dark:text-white">
                  {code}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const codesText = backupCodes.join('\n');
                copyToClipboard(codesText);
              }}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition text-sm flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy All Codes
            </button>
          </div>
        )}

        {/* Trusted Devices */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Trusted Devices</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Devices that can skip 2FA verification for 30 days
          </p>
          {trustedDevices.length === 0 ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">No trusted devices found.</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Enable "Trust this device" during 2FA login to add devices here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trustedDevices.map((d) => {
                // Parse user agent to get device info
                const deviceInfo = d.device_name || parseUserAgent(d.user_agent);
                const isRevoked = d.revoked;
                const isExpired = d.expires_at && new Date(d.expires_at) < new Date();
                
                return (
                  <div 
                    key={d.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isRevoked || isExpired 
                        ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {deviceInfo}
                        </div>
                        {isRevoked && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded">
                            Revoked
                          </span>
                        )}
                        {isExpired && !isRevoked && (
                          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded">
                            Expired
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        IP: {d.ip_address || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last used: {d.last_used_at ? new Date(d.last_used_at).toLocaleString() : 'Never'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Expires: {d.expires_at ? new Date(d.expires_at).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    <div>
                      {!isRevoked && !isExpired && (
                        <button 
                          onClick={() => handleRevokeDevice(d.id)} 
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Notifications - Placeholder for now */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          {['Email notifications', 'Usage alerts', 'Billing reminders', 'Security updates'].map((item) => (
            <label key={item} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <span className="text-gray-900 dark:text-white">{item}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
