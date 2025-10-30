import { User } from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.validatedBody;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user
    const user = await User.create(email, password, fullName);

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    logger.info('User registered successfully', { userId: user.id, email });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          plan: user.plan,
          apiKey: user.api_key,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Registration error', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact support.',
      });
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    logger.info('User logged in successfully', { userId: user.id, email });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          plan: user.plan,
          apiKey: user.api_key,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error', error);
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        plan: user.plan,
        apiKey: user.api_key,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    logger.error('Get profile error', error);
    next(error);
  }
};

export const regenerateApiKey = async (req, res, next) => {
  try {
    const newApiKey = await User.regenerateApiKey(req.user.id);

    logger.info('API key regenerated', { userId: req.user.id });

    res.json({
      success: true,
      message: 'API key regenerated successfully',
      data: {
        apiKey: newApiKey,
      },
    });
  } catch (error) {
    logger.error('Regenerate API key error', error);
    next(error);
  }
};

export default {
  register,
  login,
  getProfile,
  regenerateApiKey,
};
