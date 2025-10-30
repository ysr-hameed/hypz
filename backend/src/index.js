import app from './server.js';
import { config } from './config/env.js';
import { initializeDatabase } from './utils/db.js';
import logger from './utils/logger.js';
import cron from 'node-cron';

// Import background jobs
import { dailyUsageReset } from './jobs/dailyUsageReset.js';
import { fileCleanup } from './jobs/fileCleanup.js';
import { healthCheck } from './jobs/healthCheck.js';

const startServer = async () => {
  try {
    // Initialize database
    logger.info('Initializing database...');
    await initializeDatabase();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API Base URL: ${config.apiBaseUrl}`);
    });

    // Schedule background jobs
    logger.info('Scheduling background jobs...');

    // Daily usage reset (runs at midnight every day)
    cron.schedule('0 0 * * *', () => {
      logger.info('Running daily usage reset job...');
      dailyUsageReset();
    });

    // File cleanup (runs every 6 hours)
    cron.schedule('0 */6 * * *', () => {
      logger.info('Running file cleanup job...');
      fileCleanup();
    });

    // Health check (runs every 5 minutes)
    cron.schedule('*/5 * * * *', () => {
      healthCheck();
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Closing server gracefully...`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
