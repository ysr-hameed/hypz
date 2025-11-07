/**
 * Frontend Logger Utility
 * 
 * Provides consistent logging interface across the frontend application.
 * - Development: Full logging to console
 * - Production: Only errors logged (can integrate with Sentry, LogRocket, etc.)
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isTest = import.meta.env.MODE === 'test';

/**
 * Logger utility for frontend
 */
export const logger = {
  /**
   * Log informational messages (dev only)
   */
  log: (...args) => {
    if (isDevelopment && !isTest) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always logged)
   */
  error: (...args) => {
    console.error(...args);
    
    // TODO: In production, send to error tracking service
    // Example: Sentry.captureException(args[1]);
  },

  /**
   * Log warnings (dev only)
   */
  warn: (...args) => {
    if (isDevelopment && !isTest) {
      console.warn(...args);
    }
  },

  /**
   * Log info messages (dev only)
   */
  info: (...args) => {
    if (isDevelopment && !isTest) {
      console.info(...args);
    }
  },

  /**
   * Log debug messages (dev only)
   */
  debug: (...args) => {
    if (isDevelopment && !isTest) {
      console.debug(...args);
    }
  }
};

/**
 * Performance timing utility
 */
export const performance = {
  start: (label) => {
    if (isDevelopment) {
      console.time(label);
    }
  },
  
  end: (label) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
};

export default logger;
