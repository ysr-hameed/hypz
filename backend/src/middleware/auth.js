import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { query } from '../config/database.js';

// JWT authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // Get user from database
      const result = await query(
        'SELECT id, email, first_name, last_name, role, plan_id, is_active FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found or token invalid'
        });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated'
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// API Key authentication middleware
export const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    // Hash the API key (assuming it's stored hashed in DB)
    const bcrypt = await import('bcryptjs');
    
    // Get all active API keys (in production, optimize this)
    const result = await query(
      `SELECT ak.*, u.id as user_id, u.email, u.plan_id 
       FROM api_keys ak 
       JOIN users u ON ak.user_id = u.id 
       WHERE ak.is_active = true 
       AND (ak.expires_at IS NULL OR ak.expires_at > NOW())`
    );

    let matchedKey = null;
    for (const key of result.rows) {
      if (await bcrypt.compare(apiKey, key.key_hash)) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    // Update last used
    await query(
      'UPDATE api_keys SET last_used_at = NOW(), last_used_ip = $1 WHERE id = $2',
      [req.ip, matchedKey.id]
    );

    // Attach user info to request
    req.user = {
      id: matchedKey.user_id,
      email: matchedKey.email,
      plan_id: matchedKey.plan_id
    };
    req.apiKey = matchedKey;

    next();
  } catch (error) {
    console.error('API Key authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const result = await query(
          'SELECT id, email, first_name, last_name, role, plan_id FROM users WHERE id = $1',
          [decoded.id]
        );

        if (result.rows.length > 0) {
          req.user = result.rows[0];
        }
      } catch (error) {
        // Token invalid, but we don't fail - just continue without user
      }
    }

    next();
  } catch (error) {
    next();
  }
};
