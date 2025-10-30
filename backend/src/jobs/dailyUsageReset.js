import { query } from '../utils/db.js';
import { Usage } from '../models/Usage.js';
import logger from '../utils/logger.js';

export const dailyUsageReset = async () => {
  try {
    logger.info('Starting daily usage reset...');

    // Get all users
    const result = await query('SELECT id FROM users WHERE is_active = true');
    const users = result.rows;

    let resetCount = 0;
    for (const user of users) {
      try {
        // Check if it's been a month since last reset
        const usage = await Usage.findByUser(user.id);
        if (usage && usage.period_start) {
          const daysSinceReset = Math.floor(
            (new Date() - new Date(usage.period_start)) / (1000 * 60 * 60 * 24)
          );

          // Reset if 30 days or more have passed
          if (daysSinceReset >= 30) {
            await Usage.resetMonthlyUsage(user.id);
            resetCount++;
            logger.info(`Reset usage for user ${user.id}`);
          }
        }
      } catch (error) {
        logger.error(`Error resetting usage for user ${user.id}`, error);
      }
    }

    logger.info(`Daily usage reset completed. Reset ${resetCount} users.`);
  } catch (error) {
    logger.error('Error in daily usage reset job', error);
  }
};

export default dailyUsageReset;
