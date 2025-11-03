import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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

    console.log('🔑 API Key authentication attempt');

    if (!apiKey) {
      console.log('❌ No API key provided');
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    console.log('🔍 API Key received:', apiKey.substring(0, 15) + '...');
    
    // Get all active API keys (in production, optimize this)
    const result = await query(
      `SELECT ak.*, u.id as user_id, u.email, u.plan_id, u.role, u.is_active as user_is_active
       FROM api_keys ak 
       JOIN users u ON ak.user_id = u.id 
       WHERE ak.is_active = true 
       AND u.is_active = true
       AND (ak.expires_at IS NULL OR ak.expires_at > NOW())`
    );

    console.log(`📊 Found ${result.rows.length} active API keys in database`);

    let matchedKey = null;
    for (const key of result.rows) {
      console.log(`🔍 Comparing with key: ${key.key_prefix}`);
      try {
        const isMatch = await bcrypt.compare(apiKey, key.key_hash);
        console.log(`  Match result: ${isMatch}`);
        if (isMatch) {
          matchedKey = key;
          break;
        }
      } catch (compareError) {
        console.error('  Bcrypt compare error:', compareError.message);
      }
    }

    if (!matchedKey) {
      console.log('❌ API Key authentication failed - Invalid or expired key');
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired API key'
      });
    }

    // Security: Block admin/platform operations via API key
    if (matchedKey.role === 'admin') {
      console.warn('⚠️  Admin attempted API key access:', matchedKey.email);
    }

    console.log('✅ API Key authenticated successfully for user:', matchedKey.email);

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
    console.error('❌ API Key authentication error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      console.log('❌ Permission check failed - API key missing permissions');
      return res.status(403).json({
        success: false,
        message: 'API key missing permissions'
      });
    }

    // Parse permissions if it's a string (from DB)
    let permissions = req.apiKey.permissions;
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions);
      } catch (e) {
        console.error('Error parsing permissions:', e);
        return res.status(403).json({
          success: false,
          message: 'Invalid API key permissions format'
        });
      }
    }

    console.log('🔍 Checking permission:', requiredPermission, 'against:', permissions);

    // Handle array-based permissions (e.g., ['files:write', 'buckets:read', '*'])
    if (Array.isArray(permissions)) {
      if (permissions.includes(requiredPermission) || permissions.includes('*')) {
        console.log('✅ Permission granted (array-based)');
        return next();
      }
      console.log('❌ Permission denied (array-based)');
      return res.status(403).json({
        success: false,
        message: `API key missing required permission: ${requiredPermission}`,
        required: requiredPermission,
        available: permissions
      });
    }

    // Handle object-based permissions (e.g., { read: true, write: true, delete: false })
    if (typeof permissions === 'object' && permissions !== null) {
      // Extract action from permission string (e.g., 'files:write' -> 'write', 'buckets:read' -> 'read')
      const action = requiredPermission.split(':')[1] || requiredPermission;
      
      console.log('🔍 Extracted action:', action, 'from permission:', requiredPermission);
      
      // Check if the action is allowed
      if (permissions[action] === true || permissions['*'] === true) {
        console.log('✅ Permission granted (object-based)');
        return next();
      }

      console.log('❌ Permission denied (object-based)');
      return res.status(403).json({
        success: false,
        message: `API key missing required permission: ${requiredPermission}`,
        required: requiredPermission,
        available: permissions
      });
    }

    console.log('❌ Invalid permissions format');
    return res.status(403).json({
      success: false,
      message: 'Invalid API key permissions format',
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
