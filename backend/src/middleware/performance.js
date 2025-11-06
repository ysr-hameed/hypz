/**
 * Performance monitoring middleware
 * Tracks API response times and logs slow requests
 */

import logger from '../utils/logger.js';

export const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();

  // Use finish event to log duration without mutating response methods
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = (diff[0] * 1e9 + diff[1]) / 1e6; // ms

    // NOTE: Do not set headers here; headers are already sent at 'finish'
    if (time > 500) {
      logger.warn({ method: req.method, url: req.originalUrl, duration: time }, 'Slow request detected');
    }
  });

  next();
};

/**
 * Request caching middleware for GET requests
 */
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

export const cacheMiddleware = (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }
  
  const key = req.originalUrl || req.url;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached.data);
  }
  
  // Store original json function
  const originalJson = res.json.bind(res);
  
  // Override json function to cache response
  res.json = function(data) {
    if (res.statusCode === 200) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      
      // Clean up old cache entries
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
    }
    
    res.setHeader('X-Cache', 'MISS');
    return originalJson(data);
  };
  
  next();
};
