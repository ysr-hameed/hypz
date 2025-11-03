import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, CheckCircle2, Smartphone, Mail } from 'lucide-react';
import axios from 'axios';
import config from '../config/env';
import { validate2FAToken } from '../utils/validation';

const TwoFactorVerify = ({ email, onBack, onSuccess }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [useEmailFallback, setUseEmailFallback] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const hasSentCode = useRef(false); // Prevent duplicate 2FA code sending

  // Don't auto-send code anymore since we're using authenticator app
  // Only send if user requests email fallback
  useEffect(() => {
    // No automatic code sending for authenticator app
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendEmailFallback = async () => {
    setSendingCode(true);
    setError('');
    
    try {
      await axios.post(`${config.API_URL}/auth/2fa/send-email-fallback`, { email });
      setUseEmailFallback(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email verification code');
    } finally {
      setSendingCode(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5 && newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeValue = code.join('')) => {
    if (!useBackup && !useEmailFallback) {
      // Authenticator app code validation
      const validationErrors = validate2FAToken(codeValue);
      if (validationErrors.length > 0) {
        setError(validationErrors[0]);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${config.API_URL}/auth/2fa/verify-login`, {
        email,
        code: useBackup ? backupCode : codeValue,
        useBackupCode: useBackup,
        useEmailFallback: useEmailFallback,
        trustDevice: trustDevice,
        deviceName: deviceName || undefined
      });

      const { token, user } = response.data.data;
      const deviceToken = response.data.data.deviceToken;

      // If a new device token is issued, store it locally so future logins can skip 2FA
      if (deviceToken) {
        try {
          localStorage.setItem('trustedDeviceToken', deviceToken);
        } catch (err) {
          console.warn('Failed to store trusted device token locally:', err);
        }
      }

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      onSuccess?.();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
      if (!useBackup) {
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCodeSubmit = (e) => {
    e.preventDefault();
    handleVerify(backupCode);
  };

  return (
    <div className="w-full max-w-md">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
            {useEmailFallback ? (
              <Mail className="w-8 h-8 text-primary-600" />
            ) : (
              <Shield className="w-8 h-8 text-primary-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Two-Factor Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {useBackup 
              ? 'Enter one of your backup codes'
              : useEmailFallback
              ? `Enter the 6-digit code sent to ${email}`
              : 'Enter the 6-digit code from your authenticator app'
            }
          </p>
        </div>

        {!useBackup ? (
          <>
            <div className="flex justify-center gap-2 mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 transition"
                />
              ))}
            </div>

            <div className="flex items-center gap-3 mb-4 px-4">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={trustDevice} onChange={(e) => setTrustDevice(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Trust this device for 30 days</span>
              </label>
              {trustDevice && (
                <input
                  type="text"
                  placeholder="Device name (optional)"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="ml-auto px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm"
                />
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
              </div>
            )}

            <button
              onClick={() => handleVerify()}
              disabled={loading || code.some(d => !d)}
              className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Verify
                </>
              )}
            </button>

            {useEmailFallback && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleSendEmailFallback}
                  disabled={sendingCode}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
                >
                  {sendingCode ? 'Sending...' : 'Resend code'}
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
              {!useEmailFallback && (
                <button
                  onClick={handleSendEmailFallback}
                  disabled={sendingCode}
                  type="button"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {sendingCode ? 'Sending...' : 'Lost phone? Use email instead'}
                </button>
              )}
              {useEmailFallback && (
                <button
                  onClick={() => {
                    setUseEmailFallback(false);
                    setCode(['', '', '', '', '', '']);
                    setError('');
                  }}
                  type="button"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  Use authenticator app
                </button>
              )}
              <button
                onClick={() => setUseBackup(true)}
                type="button"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
              >
                Use backup code instead
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleBackupCodeSubmit}>
            <div className="mb-6">
              <input
                type="text"
                value={backupCode}
                onChange={(e) => {
                  setBackupCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="XXXXXXXX"
                maxLength={8}
                className="w-full px-4 py-3 text-center text-xl font-mono tracking-wider border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || backupCode.length !== 8}
              className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Verify Backup Code
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setUseBackup(false);
                  setBackupCode('');
                  setError('');
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
              >
                Use email code instead
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TwoFactorVerify;
