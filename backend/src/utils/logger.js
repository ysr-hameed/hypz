import pino from 'pino';
import config from '../config/config.js';

const isDev = config.NODE_ENV !== 'production';

const logger = pino({
  level: config.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true }
      }
    : undefined
});

export default logger;
