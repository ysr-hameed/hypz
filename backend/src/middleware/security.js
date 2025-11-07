import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import { errorResponse } from '../utils/helpers.js';

// Smart rate limiter - only applies to API key usage, not JWT authenticated requests
export const apiLimiter = rateLimit({
  windowMs: config.API_RATE_WINDOW * 60 * 1000, // 15 minutes by default
  max: config.API_RATE_LIMIT, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for JWT authenticated users (dashboard usage)
  skip: (req) => {
    // Check if request has JWT token (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return true; // Skip rate limiting for JWT users
    }
    
    // Check if request has query token (for file access)
    if (req.query.token) {
      return true; // Skip rate limiting for authenticated file access
    }
    
    // Only apply rate limit to API key requests
    return false;
  }
});

// Strict rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 uploads per minute
  message: {
    success: false,
    message: 'Too many upload requests, please slow down.'
  }
});

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
  logger.debug({ origin, env: config.NODE_ENV }, 'CORS check - Origin');
    
    // In development, be very permissive
    if (config.NODE_ENV === 'development') {
      // Always allow in development
      return callback(null, true);
    }
    
    // Production whitelist
    const allowedOrigins = [
      config.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000'
    ];

    // Allow requests with no origin (mobile apps, Postman, curl, server-to-server, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check against whitelist
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
  // Log and reject
  logger.warn({ origin, allowedOrigins }, 'CORS blocked origin');
  callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'x-trusted-device'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Helmet security configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Compression configuration
export const compressionConfig = compression({
  level: 6,
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  // Mongoose/MongoDB errors
  if (err.name === 'ValidationError') {
    return errorResponse(res, 'Validation error', 400, Object.values(err.errors).map(e => e.message));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  // Duplicate key error
  if (err.code === '23505') { // PostgreSQL unique violation
    return errorResponse(res, 'Duplicate entry. Resource already exists.', 400);
  }

  // Default error
  const defaultMsg = err.message || 'Internal server error';
  const statusCode = err.statusCode || 500;
  if (config.NODE_ENV === 'development') {
    // Include stack in development
    return errorResponse(res, defaultMsg, statusCode, [{ detail: err.stack }]);
  }
  return errorResponse(res, defaultMsg, statusCode);
};

// Not found handler
export const notFound = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

// Request logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({ method: req.method, url: req.originalUrl, status: res.statusCode, duration }, 'Request completed');
  });
  
  next();
};

// Data sanitization
export const sanitizeData = [
  mongoSanitize(), // Prevent NoSQL injection
  xss() // Prevent XSS attacks
];

