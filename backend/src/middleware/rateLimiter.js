import { query } from '../config/database.js';
import logger from '../utils/logger.js';

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map();
const WINDOW_MS = 1000; // 1 second window

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 60000) {
      requestCounts.delete(key);
    }
  }
}, 60000);

/**
 * Plan-based rate limiting middleware
 * Limits requests per second based on user's plan
 */
export const planBasedRateLimit = async (req, res, next) => {
  try {
    // Skip rate limiting for public routes
    if (!req.user || !req.user.id) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const key = `ratelimit:${userId}`;

    // Get user's plan rate limit (cached in user object from auth middleware)
    let rateLimit = 5; // Default to Free plan limit

    if (!req.user.plan_id) {
      // Fetch plan if not in user object
      const planResult = await query(
        `SELECT p.rate_limit FROM users u 
         JOIN plans p ON u.plan_id = p.id 
         WHERE u.id = $1`,
        [userId]
      );
      
      if (planResult.rows.length > 0) {
        rateLimit = planResult.rows[0].rate_limit || 5;
      }
    } else {
      // Get from cache or database
      const planCache = requestCounts.get(`plan:${req.user.plan_id}`);
      if (planCache && now - planCache.timestamp < 300000) {
        rateLimit = planCache.limit;
      } else {
        const planResult = await query(
          'SELECT rate_limit FROM plans WHERE id = $1',
          [req.user.plan_id]
        );
        if (planResult.rows.length > 0) {
          rateLimit = planResult.rows[0].rate_limit || 5;
          requestCounts.set(`plan:${req.user.plan_id}`, {
            limit: rateLimit,
            timestamp: now
          });
        }
      }
    }

    // Get or create request count for this user
    let userData = requestCounts.get(key);
    
    if (!userData || now - userData.resetTime >= WINDOW_MS) {
      // New window
      userData = {
        count: 1,
        resetTime: now,
        limit: rateLimit
      };
      requestCounts.set(key, userData);
      return next();
    }

    // Within the same window
    userData.count++;

    if (userData.count > rateLimit) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((WINDOW_MS - (now - userData.resetTime)) / 1000);
      
      res.set({
        'X-RateLimit-Limit': rateLimit,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(userData.resetTime + WINDOW_MS).toISOString(),
        'Retry-After': retryAfter
      });

      return errorResponse(res, `Rate limit exceeded. Your plan allows ${rateLimit} requests per second. Please upgrade your plan for higher limits.`, 429, {
        error: 'RATE_LIMIT_EXCEEDED',
        limit: rateLimit,
        retryAfter,
        upgrade: {
          message: 'Upgrade to Pro for 50 req/s or PAYG for 200 req/s',
          plans: {
            pro: { limit: 50, price: '$9.99/month' },
            payg: { limit: 200, price: '$29.99/month' }
          }
        }
      });
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': rateLimit,
      'X-RateLimit-Remaining': Math.max(0, rateLimit - userData.count),
      'X-RateLimit-Reset': new Date(userData.resetTime + WINDOW_MS).toISOString()
    });

    next();
  } catch (error) {
    logger.error({ err: error }, 'Rate limiting error');
    // Don't block request on rate limit error
    next();
  }
};

/**
 * Global rate limiter for unauthenticated routes (IP-based)
 */
const ipRequestCounts = new Map();

export const globalRateLimit = (maxRequests = 10) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const key = `ip:${ip}`;

    let ipData = ipRequestCounts.get(key);

    if (!ipData || now - ipData.resetTime >= WINDOW_MS) {
      ipData = {
        count: 1,
        resetTime: now
      };
      ipRequestCounts.set(key, ipData);
      return next();
    }

    ipData.count++;

    if (ipData.count > maxRequests) {
      const retryAfter = Math.ceil((WINDOW_MS - (now - ipData.resetTime)) / 1000);
      
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(ipData.resetTime + WINDOW_MS).toISOString(),
        'Retry-After': retryAfter
      });

      return errorResponse(res, `Too many requests. Please try again in ${retryAfter} second(s).`, 429, { error: 'RATE_LIMIT_EXCEEDED' });
    }

    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - ipData.count),
      'X-RateLimit-Reset': new Date(ipData.resetTime + WINDOW_MS).toISOString()
    });

    next();
  };
};

// Clean up IP counts every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of ipRequestCounts.entries()) {
    if (now - data.resetTime > 300000) {
      ipRequestCounts.delete(key);
    }
  }
}, 300000);
