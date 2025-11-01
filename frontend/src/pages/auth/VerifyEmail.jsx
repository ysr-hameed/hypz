import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Shield, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import axios from 'axios';
import config from '../../config/env';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [sendingOtp, setSendingOtp] = useState(false);
  
  const inputRefs = useRef([]);
  const hasSentOtp = useRef(false); // Prevent duplicate OTP sending

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0 && resendDisabled) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  // Auto-send OTP on component mount (only once)
  useEffect(() => {
    // Prevent duplicate sends in React StrictMode
    if (hasSentOtp.current) return;
    
    if (email) {
      hasSentOtp.current = true;
      handleSendOtp();
    } else {
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setError('');
    
    try {
      await axios.post(`${config.API_URL}/auth/otp/send`, { email });
      setResendDisabled(true);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (value && index === 5 && newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        if (digits.length === 6) {
          inputRefs.current[5]?.focus();
          handleVerify(newOtp.join(''));
        }
      });
    }
  };

  const handleVerify = async (otpCode = otp.join('')) => {
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${config.API_URL}/auth/otp/verify`, { 
        email, 
        otp: otpCode 
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { 
          replace: true,
          state: { message: 'Email verified successfully! Please login.' }
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    handleSendOtp();
  };

  if (!email) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 animate-slideIn max-w-md w-full">
      <div className="text-center mb-8">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Hypz
          </span>
        </div>

        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
          {success ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <Shield className="w-8 h-8 text-primary-600" />
          )}
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {success ? 'Email Verified!' : 'Verify Your Email'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {success 
            ? 'Redirecting you to dashboard...' 
            : `We've sent a 6-digit code to`
          }
        </p>
        {!success && (
          <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mt-1">
            {email}
          </p>
        )}
      </div>

      {!success && (
        <>
          {/* OTP Input */}
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading || sendingOtp}
                  className={`w-12 h-14 text-center text-xl font-bold bg-gray-50 dark:bg-gray-800 border-2 rounded-lg transition-all
                    ${error 
                      ? 'border-red-500 dark:border-red-500' 
                      : digit 
                        ? 'border-primary-600 dark:border-primary-500' 
                        : 'border-gray-300 dark:border-gray-700'
                    }
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || otp.some(digit => !digit) || sendingOtp}
            className="w-full py-3 px-4 text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-lg font-medium transition shadow-lg shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Shield size={18} />
                <span>Verify Email</span>
              </>
            )}
          </button>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resendDisabled || sendingOtp}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              {sendingOtp ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : resendDisabled ? (
                <span>Resend code in {countdown}s</span>
              ) : (
                <>
                  <Mail size={16} />
                  <span>Resend Code</span>
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
              💡 <strong>Tip:</strong> Check your spam folder if you don't see the email
            </p>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </>
      )}

      {/* Success State */}
      {success && (
        <div className="text-center">
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-300 font-medium">
              Your email has been successfully verified!
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Taking you to dashboard...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
