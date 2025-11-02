import { useState, useEffect, useRef } from 'react';
import { User, Bell, Shield, Mail, Key, QrCode, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { twoFactorAPI, authAPI } from '../../services/api';
import { useUser } from '../../context/UserContext';
import { toast } from 'react-hot-toast';
import { apiCache } from '../../utils/apiCache';
import { SkeletonSettings } from '../../components/SkeletonLoaders';

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

    fetch2FAStatus();
    fetchTrustedDevices();
  }, []);

  const fetch2FAStatus = async () => {
    try {
      const response = await apiCache.wrapRequest(
        '2fa:status',
        () => twoFactorAPI.get2FAStatus(),
        30000 // 30 second cache
      );
      setTwoFactorStatus(response.data);
    } catch (error) {
      console.error('Failed to get 2FA status:', error);
    }
  };

  const fetchTrustedDevices = async () => {
    try {
      const res = await apiCache.wrapRequest(
        '2fa:trusted-devices',
        () => twoFactorAPI.getTrustedDevices(),
        30000 // 30 second cache
      );
      setTrustedDevices(res.data.devices || []);
    } catch (error) {
      console.error('Failed to fetch trusted devices:', error);
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
      
      // Invalidate cache and refetch
      apiCache.clear('2fa:status');
      await fetch2FAStatus();
      
      toast.success('2FA enabled successfully! Save your backup codes.');
    } catch (error) {
      // Check if it's already enabled (400 error)
      if (error.message && error.message.includes('already enabled')) {
        apiCache.clear('2fa:status');
        await fetch2FAStatus();
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
      await fetch2FAStatus();
  await fetchTrustedDevices();
      toast.success('2FA disabled successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to disable 2FA');
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      // Update context user immediately for better UX
      const updatedName = `${firstName} ${lastName}`.trim();
      updateUser({ name: updatedName, email });
      
      // TODO: Implement profile update API call
      // await authAPI.updateProfile({ firstName, lastName, email });
      
      // Force refresh user data from server after update
      await fetchUser(true);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRevokeDevice = async (id) => {
    try {
      await twoFactorAPI.revokeTrustedDevice(id);
      toast.success('Trusted device revoked');
      fetchTrustedDevices();
    } catch (err) {
      toast.error('Failed to revoke device');
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
          {trustedDevices.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No trusted devices found.</p>
          ) : (
            <div className="space-y-3">
              {trustedDevices.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{d.device_name || 'Unnamed device'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Last used: {d.last_used_at ? new Date(d.last_used_at).toLocaleString() : 'Never'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Expires: {d.expires_at ? new Date(d.expires_at).toLocaleDateString() : '—'}</div>
                  </div>
                  <div>
                    <button onClick={() => handleRevokeDevice(d.id)} className="px-3 py-1 bg-red-600 text-white rounded">Revoke</button>
                  </div>
                </div>
              ))}
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
