import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { generateToken, hashToken } from '../utils/crypto.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import axios from 'axios';

// Register with email/password
export const register = async (request, reply) => {
  const { email, password, name } = request.body;

  if (!email || !password || !name) {
    return reply.status(400).send({ 
      success: false, 
      message: 'Email, password, and name are required' 
    });
  }

  try {
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return reply.status(409).send({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = generateToken();

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password, name, verification_token, plan_id) 
       VALUES ($1, $2, $3, $4, 1) 
       RETURNING id, email, name, is_verified, plan_id, created_at`,
      [email, hashedPassword, name, verificationToken]
    );

    const user = result.rows[0];

    // Send verification email
    await sendVerificationEmail(email, verificationToken, name);

    reply.status(201).send({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.is_verified,
        planId: user.plan_id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    reply.status(500).send({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
};

// Login with email/password
export const login = async (request, reply) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.status(400).send({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  try {
    const result = await pool.query(
      `SELECT u.*, p.name as plan_name, p.price as plan_price, p.features as plan_features
       FROM users u
       LEFT JOIN plans p ON u.plan_id = p.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return reply.status(401).send({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = result.rows[0];

    // Check if user registered with OAuth
    if (!user.password) {
      return reply.status(401).send({ 
        success: false, 
        message: 'Please login with your OAuth provider' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return reply.status(401).send({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      const tempToken = request.server.jwt.sign(
        { userId: user.id, temp2FA: true },
        { expiresIn: '10m' }
      );

      return reply.send({
        success: true,
        requiresTwoFactor: true,
        tempToken,
        message: 'Please enter your 2FA code'
      });
    }

    // Generate JWT token
    const token = request.server.jwt.sign(
      { userId: user.id, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Store session
    const tokenHash = hashToken(token);
    await pool.query(
      `INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
      [user.id, tokenHash, request.ip, request.headers['user-agent']]
    );

    reply.send({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isVerified: user.is_verified,
        twoFactorEnabled: user.two_factor_enabled,
        plan: {
          id: user.plan_id,
          name: user.plan_name,
          price: user.plan_price,
          features: user.plan_features
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    reply.status(500).send({ 
      success: false, 
      message: 'Login failed' 
    });
  }
};

// Verify 2FA
export const verifyTwoFactor = async (request, reply) => {
  const { code } = request.body;

  try {
    // Verify temp token
    const decoded = await request.jwtVerify();
    
    if (!decoded.temp2FA) {
      return reply.status(400).send({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    // Get user
    const result = await pool.query(
      `SELECT u.*, p.name as plan_name, p.price as plan_price, p.features as plan_features
       FROM users u
       LEFT JOIN plans p ON u.plan_id = p.id
       WHERE u.id = $1`,
      [decoded.userId]
    );

    const user = result.rows[0];

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return reply.status(401).send({ 
        success: false, 
        message: 'Invalid 2FA code' 
      });
    }

    // Generate JWT token
    const token = request.server.jwt.sign(
      { userId: user.id, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Store session
    const tokenHash = hashToken(token);
    await pool.query(
      `INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
      [user.id, tokenHash, request.ip, request.headers['user-agent']]
    );

    reply.send({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isVerified: user.is_verified,
        twoFactorEnabled: user.two_factor_enabled,
        plan: {
          id: user.plan_id,
          name: user.plan_name,
          price: user.plan_price,
          features: user.plan_features
        }
      }
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    reply.status(500).send({ 
      success: false, 
      message: '2FA verification failed' 
    });
  }
};

// Verify email
export const verifyEmail = async (request, reply) => {
  const { token } = request.query;

  if (!token) {
    return reply.status(400).send({ 
      success: false, 
      message: 'Verification token is required' 
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return reply.status(400).send({ 
        success: false, 
        message: 'Invalid or expired verification token' 
      });
    }

    await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1',
      [token]
    );

    reply.send({
      success: true,
      message: 'Email verified successfully! You can now login.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    reply.status(500).send({ 
      success: false, 
      message: 'Email verification failed' 
    });
  }
};

// Request password reset
export const forgotPassword = async (request, reply) => {
  const { email } = request.body;

  if (!email) {
    return reply.status(400).send({ 
      success: false, 
      message: 'Email is required' 
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if user exists
      return reply.send({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    const user = result.rows[0];
    const resetToken = generateToken();

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'1 hour\' WHERE email = $2',
      [resetToken, email]
    );

    await sendPasswordResetEmail(email, resetToken, user.name);

    reply.send({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    reply.status(500).send({ 
      success: false, 
      message: 'Password reset request failed' 
    });
  }
};

// Reset password
export const resetPassword = async (request, reply) => {
  const { token, newPassword } = request.body;

  if (!token || !newPassword) {
    return reply.status(400).send({ 
      success: false, 
      message: 'Token and new password are required' 
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return reply.status(400).send({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2',
      [hashedPassword, token]
    );

    // Invalidate all sessions
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [result.rows[0].id]);

    reply.send({
      success: true,
      message: 'Password reset successful! Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    reply.status(500).send({ 
      success: false, 
      message: 'Password reset failed' 
    });
  }
};

// Get current user
export const getMe = async (request, reply) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.avatar, u.is_verified, u.two_factor_enabled, u.plan_id,
              p.name as plan_name, p.price as plan_price, p.features as plan_features,
              s.status as subscription_status, s.end_date as subscription_end_date
       FROM users u
       LEFT JOIN plans p ON u.plan_id = p.id
       LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
       WHERE u.id = $1`,
      [request.user.userId]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = result.rows[0];

    reply.send({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isVerified: user.is_verified,
        twoFactorEnabled: user.two_factor_enabled,
        plan: {
          id: user.plan_id,
          name: user.plan_name,
          price: user.plan_price,
          features: user.plan_features
        },
        subscription: {
          status: user.subscription_status,
          endDate: user.subscription_end_date
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    reply.status(500).send({ 
      success: false, 
      message: 'Failed to fetch user data' 
    });
  }
};

// Logout
export const logout = async (request, reply) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const tokenHash = hashToken(token);
      await pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
    }

    reply.send({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    reply.status(500).send({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
};
