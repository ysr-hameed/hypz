import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import logger from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    let token = null;
    let apiKey = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check for API key in header
    apiKey = req.headers['x-api-key'];

    // Authenticate with JWT token
    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user || !user.is_active) {
          return res.status(401).json({
            success: false,
            message: 'User not found or inactive',
          });
        }

        req.user = user;
        return next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }
    }

    // Authenticate with API key
    if (apiKey) {
      const user = await User.findByApiKey(apiKey);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid API key',
        });
      }

      req.user = user;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication required. Provide a valid token or API key.',
    });
  } catch (error) {
    logger.error('Authentication error', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);
        if (user && user.is_active) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but that's okay for optional auth
      }
    } else if (apiKey) {
      const user = await User.findByApiKey(apiKey);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

export default { authenticate, optionalAuth };
