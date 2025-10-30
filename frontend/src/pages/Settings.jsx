import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FiShield, FiSmartphone, FiMonitor, FiTrash2 } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [twoFASetup, setTwoFASetup] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/user/sessions');
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to fetch sessions');
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const response = await api.post('/user/2fa/setup');
      setTwoFASetup(response.data);
      toast.success('Scan the QR code with your authenticator app');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/user/2fa/enable', { code: verificationCode });
      const response = await api.get('/auth/me');
      updateUser(response.data.user);
      setTwoFASetup(null);
      setVerificationCode('');
      toast.success('2FA enabled successfully');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const code = prompt('Enter your 2FA code to disable:');
    if (!code) return;

    setLoading(true);
    try {
      await api.post('/user/2fa/disable', { code });
      const response = await api.get('/auth/me');
      updateUser(response.data.user);
      toast.success('2FA disabled successfully');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!confirm('Are you sure you want to revoke this session?')) return;

    try {
      await api.delete(`/user/sessions/${sessionId}`);
      toast.success('Session revoked');
      fetchSessions();
    } catch (error) {
      // Error handled by interceptor
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Security Settings</h1>
          <p className="text-gray-600">Manage your account security</p>
        </div>

        {/* 2FA Section */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FiShield className="text-3xl text-primary-500" />
              <div>
                <h3 className="text-xl font-bold">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full ${user?.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          {!user?.twoFactorEnabled && !twoFASetup && (
            <div>
              <p className="text-gray-600 mb-4">
                Protect your account with an authenticator app like Google Authenticator or Authy.
              </p>
              <button
                onClick={handleSetup2FA}
                disabled={loading}
                className="btn btn-primary"
              >
                <FiSmartphone className="inline mr-2" />
                {loading ? 'Setting up...' : 'Setup 2FA'}
              </button>
            </div>
          )}

          {twoFASetup && (
            <div className="border-t pt-4">
              <p className="text-gray-600 mb-4">
                Scan this QR code with your authenticator app:
              </p>
              <div className="flex justify-center mb-4">
                <QRCodeSVG value={twoFASetup.qrCode} size={200} />
              </div>
              <p className="text-sm text-gray-600 mb-2 text-center">
                Or enter this code manually: <code className="bg-gray-100 px-2 py-1 rounded">{twoFASetup.secret}</code>
              </p>
              
              <form onSubmit={handleEnable2FA} className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit code from your app:
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-2xl tracking-widest mb-4"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="btn btn-primary w-full"
                >
                  {loading ? 'Verifying...' : 'Enable 2FA'}
                </button>
              </form>
            </div>
          )}

          {user?.twoFactorEnabled && (
            <button
              onClick={handleDisable2FA}
              disabled={loading}
              className="btn btn-danger"
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </button>
          )}
        </div>

        {/* Active Sessions */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiMonitor className="text-3xl text-primary-500" />
            <div>
              <h3 className="text-xl font-bold">Active Sessions</h3>
              <p className="text-sm text-gray-600">Manage devices where you're logged in</p>
            </div>
          </div>

          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-gray-600">No active sessions</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{session.user_agent || 'Unknown Device'}</p>
                    <p className="text-sm text-gray-600">IP: {session.ip_address}</p>
                    <p className="text-xs text-gray-500">
                      Last active: {new Date(session.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
