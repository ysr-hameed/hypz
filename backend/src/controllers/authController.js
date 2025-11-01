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
import {
  sendVerificationEmail,
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

  // Generate verification token
  const verificationToken = generateRandomToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const result = await query(
    `INSERT INTO users (
      email, password, first_name, last_name, 
      email_verification_token, email_verification_expires
    ) VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING id, email, first_name, last_name, created_at`,
    [email, hashedPassword, firstName, lastName, verificationToken, verificationExpires]
  );

  const user = result.rows[0];

  // Send verification email
  try {
    await sendVerificationEmail(email, verificationToken, firstName);
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }

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
  }, 'Registration successful. Please check your email to verify your account.', 201);
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Get user
  const result = await query(
    `SELECT id, email, password, first_name, last_name, email_verified, 
     plan_id, role, is_active 
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

  // Generate tokens
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)]
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
      role: user.role
    },
    token,
    refreshToken
  }, 'Login successful');
});

// Verify email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  // Find user with this token
  const result = await query(
    `SELECT id, email, first_name, email_verification_expires 
     FROM users 
     WHERE email_verification_token = $1 
     AND email_verified = false`,
    [token]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Invalid or expired verification token', 400);
  }

  const user = result.rows[0];

  // Check if token expired
  if (new Date() > new Date(user.email_verification_expires)) {
    return errorResponse(res, 'Verification token has expired. Please request a new one.', 400);
  }

  // Update user as verified
  await query(
    `UPDATE users 
     SET email_verified = true, 
         email_verification_token = NULL, 
         email_verification_expires = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [user.id]
  );

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.first_name);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)`,
    [user.id, 'email_verified']
  );

  successResponse(res, null, 'Email verified successfully');
});

// Resend verification email
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await query(
    'SELECT id, email, first_name, email_verified FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  const user = result.rows[0];

  if (user.email_verified) {
    return errorResponse(res, 'Email already verified', 400);
  }

  // Generate new token
  const verificationToken = generateRandomToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await query(
    `UPDATE users 
     SET email_verification_token = $1, 
         email_verification_expires = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [verificationToken, verificationExpires, user.id]
  );

  // Send verification email
  await sendVerificationEmail(user.email, verificationToken, user.first_name);

  successResponse(res, null, 'Verification email sent successfully');
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
