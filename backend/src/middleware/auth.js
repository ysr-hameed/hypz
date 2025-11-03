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
    
    // Also check for token in query params (for file access)
    if (!token && req.query.token) {
      token = req.query.token;
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
      req.authMethod = 'jwt'; // Track authentication method
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
      `SELECT ak.*, u.id as user_id, u.email, u.plan_id, u.role, u.is_active as user_is_active
       FROM api_keys ak 
       JOIN users u ON ak.user_id = u.id 
       WHERE ak.is_active = true 
       AND u.is_active = true
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
        message: 'Invalid or expired API key'
      });
    }

    // Security: Block admin/platform operations via API key
    if (matchedKey.role === 'admin') {
      console.warn('⚠️  Admin attempted API key access:', matchedKey.email);
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
      plan_id: matchedKey.plan_id,
      role: matchedKey.role || 'user'
    };
    req.apiKey = matchedKey;
    req.authMethod = 'api_key'; // Track authentication method

    next();
  } catch (error) {
    console.error('API Key authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Check API key permissions
export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    // JWT users (dashboard) have all permissions
    if (req.authMethod !== 'api_key') {
      return next();
    }

    // Check if API key has the required permission
    if (!req.apiKey || !req.apiKey.permissions) {
      return res.status(403).json({
        success: false,
        message: 'API key missing permissions'
      });
    }

    const permissions = Array.isArray(req.apiKey.permissions) 
      ? req.apiKey.permissions 
      : [];

    // Check for specific permission or wildcard
    if (permissions.includes(requiredPermission) || permissions.includes('*')) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `API key missing required permission: ${requiredPermission}`,
      required: requiredPermission,
      available: permissions
    });
  };
};

// Ensure user can only access their own resources
export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      let resourceId;
      let checkQuery;

      // Get resource ID from params
      switch (resourceType) {
        case 'bucket':
          resourceId = req.params.bucketId || req.params.id;
          checkQuery = 'SELECT user_id FROM buckets WHERE id = $1';
          break;
        
        case 'file':
          resourceId = req.params.fileId || req.params.id;
          checkQuery = 'SELECT user_id FROM files WHERE id = $1';
          break;
        
        case 'apikey':
          resourceId = req.params.keyId || req.params.id;
          checkQuery = 'SELECT user_id FROM api_keys WHERE id = $1';
          break;
        
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid resource type'
          });
      }

      if (!resourceId) {
        return next(); // No resource ID to check (e.g., listing resources)
      }

      // Check ownership
      const result = await query(checkQuery, [resourceId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`
        });
      }

      if (result.rows[0].user_id !== userId) {
        console.warn(`⚠️  Unauthorized access attempt: User ${userId} tried to access ${resourceType} ${resourceId}`);
        return res.status(403).json({
          success: false,
          message: `You don't have permission to access this ${resourceType}`
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

// Block API key access to admin/platform routes
export const blockApiKeyAccess = (req, res, next) => {
  if (req.authMethod === 'api_key') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint cannot be accessed with API keys. Please use dashboard authentication.'
    });
  }
  next();
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
