import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';
import { errorResponse } from '../utils/helpers.js';

// Simple in-memory cache for user lookups
const userCache = new Map();
const USER_CACHE_TTL = 300000; // 5 minutes

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

      // Check cache first
      const cacheKey = `user:${decoded.id}`;
      const cached = userCache.get(cacheKey);
      let user;
      
      if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL) {
        user = cached.user;
      } else {
        // Get user from database
        const result = await query(
          'SELECT id, email, first_name, last_name, role, plan_id, is_active FROM users WHERE id = $1',
          [decoded.id],
          { cache: true, cacheTTL: USER_CACHE_TTL }
        );

        if (result.rows.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'User not found or token invalid'
          });
        }

        user = result.rows[0];
        userCache.set(cacheKey, { user, timestamp: Date.now() });
      }

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
      logger.error({ err: error }, 'Authentication error');
      return errorResponse(res, 'Authentication failed', 500);
    }
};

// API Key cache
const apiKeyCache = new Map();
const API_KEY_CACHE_TTL = 600000; // 10 minutes

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
    
    // Extract key prefix for faster lookup (must match database format)
    const keyPrefix = apiKey.substring(0, 12) + '...';
    const cacheKey = `apikey:${keyPrefix}`;
    const cached = apiKeyCache.get(cacheKey);
    
    let matchedKey = null;
    
    // Check cache first
    if (cached && Date.now() - cached.timestamp < API_KEY_CACHE_TTL) {
      try {
        const isMatch = await bcrypt.compare(apiKey, cached.key_hash);
        if (isMatch) {
          matchedKey = cached.data;
        }
          } catch (err) {
        // Cache miss, continue to DB lookup
        logger.error({ err: err }, 'Bcrypt compare error during API key cache check');
      }
    }
    
    // If not in cache, query database
    if (!matchedKey) {
      // Optimized query with prefix filter
      const result = await query(
        `SELECT ak.*, u.id as user_id, u.email, u.plan_id, u.role, u.is_active as user_is_active
         FROM api_keys ak 
         JOIN users u ON ak.user_id = u.id 
         WHERE ak.key_prefix = $1
         AND ak.is_active = true 
         AND u.is_active = true
         AND (ak.expires_at IS NULL OR ak.expires_at > NOW())`,
        [keyPrefix],
        { cache: true }
      );

      for (const key of result.rows) {
        try {
          const isMatch = await bcrypt.compare(apiKey, key.key_hash);
          if (isMatch) {
            matchedKey = key;
            // Cache the matched key
            apiKeyCache.set(cacheKey, {
              key_hash: key.key_hash,
              data: key,
              timestamp: Date.now()
            });
            break;
          }
        } catch (compareError) {
          logger.error({ err: compareError }, 'Bcrypt compare error while matching API key');
        }
      }
    }

    if (!matchedKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired API key'
      });
    }

    // Update last used (non-blocking, no await)
    query(
      'UPDATE api_keys SET last_used_at = NOW(), last_used_ip = $1 WHERE id = $2',
      [req.ip, matchedKey.id]
    ).catch(err => logger.warn({ err }, 'Failed to update API key last_used'));

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
    logger.error({ err: error }, 'API Key authentication error');
    return errorResponse(res, process.env.NODE_ENV === 'development' ? error.message : 'Authentication failed', 500);
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
      logger.warn('Permission check failed - API key missing permissions');
      return errorResponse(res, 'API key missing permissions', 403);
    }

    // Parse permissions if it's a string (from DB)
    let permissions = req.apiKey.permissions;
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions);
      } catch (e) {
        logger.error({ err: e }, 'Error parsing API key permissions');
        return errorResponse(res, 'Invalid API key permissions format', 403);
      }
    }

    logger.debug({ requiredPermission, permissions }, 'Checking API key permissions');

    // Handle array-based permissions (e.g., ['files:write', 'buckets:read', '*'])
    if (Array.isArray(permissions)) {
      if (permissions.includes(requiredPermission)) {
        logger.debug('Permission granted (array-based)');
        return next();
      }
      logger.warn({ requiredPermission, permissions }, 'Permission denied (array-based)');
      return errorResponse(res, `Permission denied. Required: ${requiredPermission}`, 403);
    }

    // Handle object-based permissions (e.g., { read: true, write: true, delete: false })
    if (typeof permissions === 'object' && permissions !== null) {
      // Extract action from permission string (e.g., 'files:write' -> 'write', 'buckets:read' -> 'read')
      const action = requiredPermission.split(':')[1] || requiredPermission;
      
      logger.debug({ action, requiredPermission }, 'Extracted action from permission');
      
      // Check if the action is allowed
      if (permissions[action] === true || permissions['*'] === true) {
        logger.debug('Permission granted (object-based)');
        return next();
      }

      logger.warn({ action, requiredPermission, permissions }, 'Permission denied (object-based)');
      return res.status(403).json({
        success: false,
        message: `API key missing required permission: ${requiredPermission}`,
        required: requiredPermission,
        available: permissions
      });
    }

    logger.warn('Invalid permissions format for API key');
    return errorResponse(res, 'Invalid API key permissions format', 403, permissions);
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
        return errorResponse(res, `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`, 404);
      }

      if (result.rows[0].user_id !== userId) {
        logger.warn({ userId, resourceType, resourceId }, 'Unauthorized access attempt');
        return errorResponse(res, `You don't have permission to access this ${resourceType}`, 403);
      }

      next();
    } catch (error) {
      logger.error({ err: error }, 'Ownership check error');
      return errorResponse(res, 'Authorization failed', 500);
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

// Signed file token verifier (query token)
export const authenticateFileToken = (req, res, next) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing token' });
  }
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.t !== 'file' || !decoded.fid) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    req.fileToken = decoded; // { t: 'file', fid, uid, iat, exp }
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
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
