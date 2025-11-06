import { query } from '../config/database.js';
import logger from '../utils/logger.js';
import { asyncHandler } from '../middleware/validator.js';
import {
  generateToken,
  successResponse,
  errorResponse,
  generateRandomToken
} from '../utils/helpers.js';
import bcrypt from 'bcryptjs';
import {
  sendOTPEmail,
  send2FAEmail,
  sendWelcomeEmail
} from '../utils/email.js';
import {
  generateOTP,
  generate2FASecret,
  generateQRCode,
  verify2FAToken,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode
} from '../utils/otp.js';

// Send OTP for email verification
export const sendVerificationOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const result = await query(
    'SELECT id, email, first_name, email_verified, otp_attempts FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const user = result.rows[0];

  if (user.email_verified) {
    return errorResponse(res, 'Email already verified', 400);
  }

  // Check OTP attempts (prevent spam)
  if (user.otp_attempts >= 5) {
    return errorResponse(res, 'Too many OTP requests. Please try again in 1 hour.', 429);
  }

  // Generate 6-digit OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP in database
  await query(
    `UPDATE users 
     SET otp_code = $1, 
         otp_expires = $2,
         otp_attempts = otp_attempts + 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [otp, otpExpires, user.id]
  );

  // Send OTP email
  try {
    await sendOTPEmail(user.email, otp, user.first_name);
  } catch (error) {
    logger.error({ err: error }, 'Failed to send OTP email');
    return errorResponse(res, 'Failed to send OTP. Please try again.', 500);
  }

  successResponse(res, null, 'OTP sent to your email');
});

// Verify OTP for email verification
export const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Get user with OTP
  const result = await query(
    `SELECT id, email, first_name, otp_code, otp_expires, email_verified 
     FROM users 
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const user = result.rows[0];

  if (user.email_verified) {
    return errorResponse(res, 'Email already verified', 400);
  }

  if (!user.otp_code || !user.otp_expires) {
    return errorResponse(res, 'No OTP found. Please request a new one.', 400);
  }

  // Check if OTP expired
  if (new Date() > new Date(user.otp_expires)) {
    return errorResponse(res, 'OTP has expired. Please request a new one.', 400);
  }

  // Verify OTP
  if (user.otp_code !== otp) {
    return errorResponse(res, 'Invalid OTP', 400);
  }

  // Mark email as verified and clear OTP
  await query(
    `UPDATE users 
     SET email_verified = true,
         otp_code = NULL,
         otp_expires = NULL,
         otp_attempts = 0,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [user.id]
  );

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.first_name);
  } catch (error) {
    logger.error({ err: error }, 'Failed to send welcome email');
    // Don't fail the verification if welcome email fails
  }

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)`,
    [user.id, 'email_verified']
  );

  successResponse(res, null, 'Email verified successfully');
});

// Send 2FA code via email (fallback for lost phone)
export const send2FAEmailFallback = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await query(
    'SELECT id, email, first_name, two_factor_enabled FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const user = result.rows[0];

  if (!user.two_factor_enabled) {
    return errorResponse(res, '2FA is not enabled for this account', 400);
  }

  // Generate 6-digit code for email fallback
  const code = generateOTP();
  const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for fallback

  // Store code
  await query(
    `UPDATE users 
     SET otp_code = $1, 
         otp_expires = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [code, codeExpires, user.id]
  );

  // Send email with recovery code
  try {
    await send2FAEmail(user.email, code, user.first_name);
  } catch (error) {
    logger.error({ err: error }, 'Failed to send email fallback code');
    return errorResponse(res, 'Failed to send verification code. Please try again.', 500);
  }

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action, details) 
     VALUES ($1, $2, $3)`,
    [user.id, '2fa_email_fallback_requested', JSON.stringify({ ip: req.ip })]
  );

  successResponse(res, null, 'Verification code sent to your email. Use this if you lost access to your authenticator app.');
});

// Legacy: Send 2FA code via email (deprecated - authenticator is primary now)
export const send2FACode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await query(
    'SELECT id, email, first_name, two_factor_enabled FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const user = result.rows[0];

  if (!user.two_factor_enabled) {
    return errorResponse(res, '2FA is not enabled for this account', 400);
  }

  // Generate 6-digit code
  const code = generateOTP();
  const codeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Store code
  await query(
    `UPDATE users 
     SET otp_code = $1, 
         otp_expires = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [code, codeExpires, user.id]
  );

  // Send 2FA email
  try {
    await send2FAEmail(user.email, code, user.first_name);
  } catch (error) {
    logger.error('Failed to send 2FA email:', error);
    return errorResponse(res, 'Failed to send 2FA code. Please try again.', 500);
  }

  successResponse(res, { requiresTwoFactor: true }, '2FA code sent to your email');
});

// Verify 2FA code during login
export const verify2FALogin = asyncHandler(async (req, res) => {
  const { email, code, useBackupCode, useEmailFallback, trustDevice, deviceName } = req.body;

  const result = await query(
    `SELECT id, email, first_name, last_name, otp_code, otp_expires, 
     two_factor_enabled, two_factor_secret, two_factor_backup_codes, plan_id, role 
     FROM users 
     WHERE email = $1 AND two_factor_enabled = true`,
    [email]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  const user = result.rows[0];

  let isValid = false;
  let verificationType = 'authenticator';

  if (useBackupCode) {
    // Verify backup code
    verificationType = 'backup_code';
    if (user.two_factor_backup_codes && user.two_factor_backup_codes.length > 0) {
      isValid = verifyBackupCode(code, user.two_factor_backup_codes);
      
      if (isValid) {
        // Remove used backup code
        const hashedCode = hashBackupCode(code);
        const updatedCodes = user.two_factor_backup_codes.filter(c => c !== hashedCode);
        
        await query(
          'UPDATE users SET two_factor_backup_codes = $1 WHERE id = $2',
          [updatedCodes, user.id]
        );
      }
    }
  } else if (useEmailFallback) {
    // Email fallback for lost phone
    verificationType = 'email_fallback';
    if (!user.otp_code || !user.otp_expires) {
      return errorResponse(res, 'No email verification code found. Please request one.', 400);
    }

    if (new Date() > new Date(user.otp_expires)) {
      return errorResponse(res, 'Email verification code has expired. Please request a new one.', 400);
    }

    isValid = user.otp_code === code;
  } else {
    // Primary method: Authenticator app (TOTP)
    verificationType = 'authenticator';
    if (!user.two_factor_secret) {
      return errorResponse(res, '2FA secret not found. Please contact support.', 500);
    }

    // Verify TOTP token from authenticator app
    isValid = verify2FAToken(code, user.two_factor_secret);
  }

  if (!isValid) {
    return errorResponse(res, 'Invalid verification code', 401);
  }

  // Clear email OTP if used
  if (useEmailFallback) {
    await query(
      'UPDATE users SET otp_code = NULL, otp_expires = NULL WHERE id = $1',
      [user.id]
    );
  }

  // Update last login
  const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
  await query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP, last_login_ip = $1 WHERE id = $2',
    [clientIp, user.id]
  );

  // Generate tokens
  const token = generateToken(user.id);

  // Optionally create a trusted device entry
  let deviceTokenPlain = null;
  if (trustDevice) {
    try {
      deviceTokenPlain = generateRandomToken();
      const deviceTokenHash = await bcrypt.hash(deviceTokenPlain, 10);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      // Get user agent and IP
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ipAddress = clientIp;

      await query(
        `INSERT INTO trusted_devices (user_id, device_name, device_token_hash, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, deviceName || null, deviceTokenHash, ipAddress, userAgent, expiresAt]
      );
    } catch (err) {
      logger.error({ err }, 'Failed to create trusted device');
      // don't fail login if trusted device creation fails
      deviceTokenPlain = null;
    }
  }

  successResponse(res, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      planId: user.plan_id,
      role: user.role,
      twoFactorEnabled: user.two_factor_enabled
    },
    token,
    deviceToken: deviceTokenPlain
  }, 'Login successful');
});

// Setup 2FA (generate secret and QR code)
export const setup2FA = asyncHandler(async (req, res) => {
  const userId = req.user.id; // From auth middleware

  // Get user email
  const result = await query(
    'SELECT email, two_factor_enabled FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const user = result.rows[0];

  if (user.two_factor_enabled) {
    return errorResponse(res, '2FA is already enabled', 400);
  }

  // Generate secret
  const secret = generate2FASecret(user.email);
  
  // Generate QR code
  const qrCode = await generateQRCode(secret.otpauth_url);

  // Store secret temporarily (will be confirmed when user verifies)
  await query(
    'UPDATE users SET two_factor_secret = $1 WHERE id = $2',
    [secret.base32, userId]
  );

  successResponse(res, {
    secret: secret.base32,
    qrCode: qrCode,
    otpauth_url: secret.otpauth_url
  }, '2FA setup initiated. Please scan the QR code with your authenticator app.');
});

// Enable 2FA (verify TOTP token)
export const enable2FA = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;

  // Get user's secret
  const result = await query(
    'SELECT two_factor_secret, two_factor_enabled FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const user = result.rows[0];

  if (user.two_factor_enabled) {
    return errorResponse(res, '2FA is already enabled', 400);
  }

  if (!user.two_factor_secret) {
    return errorResponse(res, 'Please setup 2FA first', 400);
  }

  // Verify token
  const isValid = verify2FAToken(token, user.two_factor_secret);

  if (!isValid) {
    return errorResponse(res, 'Invalid verification code', 400);
  }

  // Generate backup codes
  const backupCodes = generateBackupCodes(10);
  const hashedBackupCodes = backupCodes.map(code => hashBackupCode(code));

  // Enable 2FA
  await query(
    `UPDATE users 
     SET two_factor_enabled = true,
         two_factor_backup_codes = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [hashedBackupCodes, userId]
  );

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)`,
    [userId, '2fa_enabled']
  );

  successResponse(res, {
    backupCodes: backupCodes
  }, '2FA enabled successfully. Please save your backup codes in a safe place.');
});

// Get trusted devices for current user
export const getTrustedDevices = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT id, device_name, ip_address, user_agent, last_used_at, expires_at, revoked, created_at
     FROM trusted_devices WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );

  successResponse(res, { devices: result.rows });
});

// Revoke a trusted device
export const revokeTrustedDevice = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await query(
    `UPDATE trusted_devices SET revoked = true WHERE id = $1 AND user_id = $2 RETURNING id, revoked`,
    [id, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Trusted device not found', 404);
  }

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)`,
    [userId, 'trusted_device_revoked', 'trusted_devices', id]
  );

  successResponse(res, null, 'Trusted device revoked');
});

// Disable 2FA
export const disable2FA = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;

  // Verify password
  const result = await query(
    'SELECT password, two_factor_enabled FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const user = result.rows[0];

  if (!user.two_factor_enabled) {
    return errorResponse(res, '2FA is not enabled', 400);
  }

  // Verify password
  const { comparePassword } = await import('../utils/helpers.js');
  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    return errorResponse(res, 'Invalid password', 401);
  }

  // Disable 2FA
  await query(
    `UPDATE users 
     SET two_factor_enabled = false,
         two_factor_secret = NULL,
         two_factor_backup_codes = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [userId]
  );

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)`,
    [userId, '2fa_disabled']
  );

  successResponse(res, null, '2FA disabled successfully');
});

// Get 2FA status
export const get2FAStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    'SELECT two_factor_enabled, two_factor_backup_codes FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const user = result.rows[0];

  successResponse(res, {
    enabled: user.two_factor_enabled,
    backupCodesCount: user.two_factor_backup_codes ? user.two_factor_backup_codes.length : 0
  });
});
