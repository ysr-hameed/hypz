import { Usage } from '../models/Usage.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

export const checkStorageLimit = async (req, res, next) => {
  try {
    const user = req.user;
    const fileSize = req.file ? req.file.size : 0;

    // Get user's current usage
    const usage = await Usage.findByUser(user.id);
    const planLimits = config.plans[user.plan];

    if (!usage || !planLimits) {
      return res.status(500).json({
        success: false,
        message: 'Unable to verify storage limits',
      });
    }

    // Check if file size exceeds max file size for plan
    if (fileSize > planLimits.maxFileSize) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds maximum allowed size of ${planLimits.maxFileSize / (1024 * 1024)}MB for ${user.plan} plan`,
      });
    }

    // Check if adding this file would exceed storage limit
    const newTotalStorage = usage.storage_used + fileSize;
    if (newTotalStorage > planLimits.storage) {
      return res.status(403).json({
        success: false,
        message: 'Storage limit exceeded. Please upgrade your plan or delete some files.',
        usage: {
          current: usage.storage_used,
          limit: planLimits.storage,
          available: planLimits.storage - usage.storage_used,
        },
      });
    }

    // Check API calls limit
    if (usage.api_calls >= planLimits.apiCalls) {
      return res.status(429).json({
        success: false,
        message: 'API calls limit exceeded for this billing period. Please upgrade your plan.',
      });
    }

    req.usage = usage;
    req.planLimits = planLimits;
    next();
  } catch (error) {
    logger.error('Error checking storage limit', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify storage limits',
    });
  }
};

export const checkBandwidthLimit = async (req, res, next) => {
  try {
    const user = req.user;
    const usage = await Usage.findByUser(user.id);
    const planLimits = config.plans[user.plan];

    if (!usage || !planLimits) {
      return res.status(500).json({
        success: false,
        message: 'Unable to verify bandwidth limits',
      });
    }

    // Check bandwidth limit
    if (usage.bandwidth_used >= planLimits.bandwidth) {
      return res.status(403).json({
        success: false,
        message: 'Bandwidth limit exceeded for this billing period. Please upgrade your plan.',
        usage: {
          current: usage.bandwidth_used,
          limit: planLimits.bandwidth,
        },
      });
    }

    req.usage = usage;
    req.planLimits = planLimits;
    next();
  } catch (error) {
    logger.error('Error checking bandwidth limit', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify bandwidth limits',
    });
  }
};

export const checkApiCallLimit = async (req, res, next) => {
  try {
    const user = req.user;
    const usage = await Usage.findByUser(user.id);
    const planLimits = config.plans[user.plan];

    if (!usage || !planLimits) {
      return next();
    }

    // Increment API call counter
    await Usage.incrementApiCalls(user.id);

    // Check if limit exceeded (soft check, already incremented)
    if (usage.api_calls >= planLimits.apiCalls) {
      logger.warn('User exceeded API call limit', { userId: user.id, plan: user.plan });
    }

    next();
  } catch (error) {
    logger.error('Error checking API call limit', error);
    next(); // Don't block request on error
  }
};

export default {
  checkStorageLimit,
  checkBandwidthLimit,
  checkApiCallLimit,
};
