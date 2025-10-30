import { query } from '../utils/db.js';
import logger from '../utils/logger.js';

export const healthCheck = async () => {
  try {
    // Check database connection
    await query('SELECT 1');

    // You can add more health checks here
    // - Check Backblaze connection
    // - Check disk space
    // - Check memory usage
    // etc.

    logger.debug('Health check passed');
  } catch (error) {
    logger.error('Health check failed', error);
    // You could send alerts here (email, Slack, etc.)
  }
};

export default healthCheck;
