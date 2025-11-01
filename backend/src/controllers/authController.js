import { body } from 'express-validator';
import { query } from '../config/database.js';
import {
  generateToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
  generateRandomToken,
  successResponse,
  errorResponse
} from '../utils/helpers.js';
import bcrypt from 'bcryptjs';
import {
  sendPasswordResetEmail,
  sendWelcomeEmail
} from '../utils/email.js';
import { asyncHandler } from '../middleware/validator.js';

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  
  if (existingUser.rows.length > 0) {
    return errorResponse(res, 'User with this email already exists', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user (no email verification token needed with OTP system)
  const result = await query(
    `INSERT INTO users (
      email, password, first_name, last_name
    ) VALUES ($1, $2, $3, $4) 
    RETURNING id, email, first_name, last_name, created_at`,
    [email, hashedPassword, firstName, lastName]
  );

  const user = result.rows[0];

  // Generate tokens
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)]
  );

  successResponse(res, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      emailVerified: false
    },
    token,
    refreshToken
  }, 'Registration successful. Please verify your email with OTP.', 201);
});

// Login user - Check for admin forced 2FA
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Get user with 2FA status
  const result = await query(
    `SELECT id, email, password, first_name, last_name, email_verified, 
     plan_id, role, is_active, two_factor_enabled 
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  const user = result.rows[0];

  // Check if account is active
  if (!user.is_active) {
    return errorResponse(res, 'Your account has been deactivated. Please contact support.', 403);
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  // Check for admin forced 2FA setting
  const adminSettingsResult = await query(
    `SELECT value FROM admin_settings WHERE key = 'force_2fa'`
  );
  
  const force2FA = adminSettingsResult.rows.length > 0 && 
                   adminSettingsResult.rows[0].value?.enabled === true;

  // Check trusted device header - if present and valid skip 2FA
  const trustedDeviceToken = req.headers['x-trusted-device'] || req.body.trustedDeviceToken;
  if (trustedDeviceToken) {
    try {
      const devicesRes = await query(
        `SELECT id, device_token_hash, expires_at, revoked FROM trusted_devices WHERE user_id = $1 AND revoked = false`,
        [user.id]
      );

      for (const d of devicesRes.rows) {
        if (d.expires_at && new Date() > new Date(d.expires_at)) continue;
        if (await bcrypt.compare(trustedDeviceToken, d.device_token_hash)) {
          // Trusted device matched; continue to issue tokens
          const token = generateToken(user.id);
          const refreshToken = generateRefreshToken(user.id);

          // Store refresh token
          await query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, refreshToken, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)]
          );

          // Update last login
          const clientIp = req.ip || req.connection.remoteAddress;
          await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP, last_login_ip = $1 WHERE id = $2',
            [clientIp, user.id]
          );

          // Log activity
          await query(
            `INSERT INTO activity_logs (user_id, action, ip_address, user_agent) 
             VALUES ($1, $2, $3, $4)`,
            [user.id, 'login_trusted_device', req.ip, req.headers['user-agent']]
          );

          return successResponse(res, {
            user: {
              id: user.id,
              email: user.email,
              firstName: user.first_name,
              lastName: user.last_name,
              emailVerified: user.email_verified,
              planId: user.plan_id,
              role: user.role,
              twoFactorEnabled: user.two_factor_enabled
            },
            token,
            refreshToken
          }, 'Login successful (trusted device)');
        }
      }
    } catch (err) {
      console.error('Trusted device check failed:', err);
      // proceed to normal 2FA flow if anything fails
    }
  }

  // Require 2FA if either user enabled it OR admin forced it
  if (user.two_factor_enabled || force2FA) {
    return successResponse(res, {
      requiresTwoFactor: true,
      email: user.email,
      forced: force2FA && !user.two_factor_enabled
    }, '2FA verification required');
  }

  // Generate tokens
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)]
  );

  // Update last login
  const clientIp = req.ip || req.connection.remoteAddress;
  await query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP, last_login_ip = $1 WHERE id = $2',
    [clientIp, user.id]
  );

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action, ip_address, user_agent) 
     VALUES ($1, $2, $3, $4)`,
    [user.id, 'login', req.ip, req.headers['user-agent']]
  );

  successResponse(res, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      emailVerified: user.email_verified,
      planId: user.plan_id,
      role: user.role,
      twoFactorEnabled: user.two_factor_enabled
    },
    token,
    refreshToken
  }, 'Login successful');
});

// Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await query(
    'SELECT id, email, first_name FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    // Don't reveal that user doesn't exist
    return successResponse(res, null, 'If an account exists with this email, you will receive password reset instructions.');
  }

  const user = result.rows[0];

  // Generate reset token
  const resetToken = generateRandomToken();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await query(
    `UPDATE users 
     SET reset_password_token = $1, 
         reset_password_expires = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [resetToken, resetExpires, user.id]
  );

  // Send reset email
  try {
    await sendPasswordResetEmail(user.email, resetToken, user.first_name);
  } catch (error) {
    console.error('Failed to send reset email:', error);
  }

  successResponse(res, null, 'If an account exists with this email, you will receive password reset instructions.');
});

// Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const result = await query(
    `SELECT id, reset_password_expires 
     FROM users 
     WHERE reset_password_token = $1`,
    [token]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Invalid or expired reset token', 400);
  }

  const user = result.rows[0];

  // Check if token expired
  if (new Date() > new Date(user.reset_password_expires)) {
    return errorResponse(res, 'Reset token has expired. Please request a new one.', 400);
  }

  // Hash new password
  const hashedPassword = await hashPassword(password);

  // Update password
  await query(
    `UPDATE users 
     SET password = $1, 
         reset_password_token = NULL, 
         reset_password_expires = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [hashedPassword, user.id]
  );

  // Revoke all refresh tokens for security
  await query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1', [user.id]);

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)`,
    [user.id, 'password_reset']
  );

  successResponse(res, null, 'Password reset successful. Please login with your new password.');
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, email, first_name, last_name, email_verified, 
     plan_id, avatar_url, role, created_at 
     FROM users WHERE id = $1`,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const user = result.rows[0];

  successResponse(res, {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    emailVerified: user.email_verified,
    planId: user.plan_id,
    avatarUrl: user.avatar_url,
    role: user.role,
    createdAt: user.created_at
  });
});

// Logout (revoke refresh token)
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await query(
      'UPDATE refresh_tokens SET revoked = true WHERE token = $1 AND user_id = $2',
      [refreshToken, req.user.id]
    );
  }

  successResponse(res, null, 'Logout successful');
});
