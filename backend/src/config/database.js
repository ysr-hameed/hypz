import pg from 'pg';
import config from '../config/config.js';

const { Pool } = pg;

// Simple in-memory cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

// Create PostgreSQL connection pool for better performance
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 50, // Increased for better concurrency
  min: 5, // Keep minimum connections alive
  idleTimeoutMillis: 60000, // 60 seconds before closing idle connection
  connectionTimeoutMillis: 15000, // 15 seconds connection timeout
  statement_timeout: 30000, // 30 second query timeout
  ssl: { rejectUnauthorized: false },
  // Performance optimizations
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // Retry logic
  allowExitOnIdle: false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Query helper with error handling and optional caching
export const query = async (text, params, options = {}) => {
  const { cache: useCache = false, cacheTTL = CACHE_TTL } = options;
  
  // Check cache if enabled
  if (useCache) {
    const cacheKey = JSON.stringify({ text, params });
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.result;
    }
  }
  
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Only log slow queries in production
    if (duration > 1000 || process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
    }
    
    // Cache result if enabled
    if (useCache) {
      const cacheKey = JSON.stringify({ text, params });
      cache.set(cacheKey, { result: res, timestamp: Date.now() });
      
      // Cleanup old cache entries
      if (cache.size > 1000) {
        const oldestKeys = Array.from(cache.keys()).slice(0, 100);
        oldestKeys.forEach(key => cache.delete(key));
      }
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

// Clear cache (useful for writes)
export const clearCache = (pattern) => {
  if (pattern) {
    Array.from(cache.keys()).forEach(key => {
      if (key.includes(pattern)) cache.delete(key);
    });
  } else {
    cache.clear();
  }
};

// Transaction helper
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get a client from pool
export const getClient = () => pool.connect();

// Export pool for direct access
export { pool };

export default pool;
