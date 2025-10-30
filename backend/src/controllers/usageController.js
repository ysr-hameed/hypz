import { Usage } from '../models/Usage.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

export const getCurrentUsage = async (req, res, next) => {
  try {
    const usage = await Usage.findByUser(req.user.id);
    const planLimits = config.plans[req.user.plan];

    res.json({
      success: true,
      data: {
        current: {
          storage: usage.storage_used,
          bandwidth: usage.bandwidth_used,
          apiCalls: usage.api_calls,
        },
        limits: {
          storage: planLimits.storage,
          bandwidth: planLimits.bandwidth,
          apiCalls: planLimits.apiCalls,
          maxFileSize: planLimits.maxFileSize,
        },
        percentage: {
          storage: ((usage.storage_used / planLimits.storage) * 100).toFixed(2),
          bandwidth: ((usage.bandwidth_used / planLimits.bandwidth) * 100).toFixed(2),
          apiCalls: ((usage.api_calls / planLimits.apiCalls) * 100).toFixed(2),
        },
        periodStart: usage.period_start,
        periodEnd: usage.period_end,
      },
    });
  } catch (error) {
    logger.error('Get usage error', error);
    next(error);
  }
};

export const getUsageHistory = async (req, res, next) => {
  try {
    const { limit = 12 } = req.query;
    const history = await Usage.getHistory(req.user.id, parseInt(limit));

    res.json({
      success: true,
      data: history.map(record => ({
        storage: record.storage_used,
        bandwidth: record.bandwidth_used,
        apiCalls: record.api_calls,
        periodStart: record.period_start,
        periodEnd: record.period_end,
      })),
    });
  } catch (error) {
    logger.error('Get usage history error', error);
    next(error);
  }
};

export default {
  getCurrentUsage,
  getUsageHistory,
};
