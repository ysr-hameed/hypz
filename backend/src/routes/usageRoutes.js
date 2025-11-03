import express from 'express';
import {
  getCurrentUsage,
  getUsageHistory,
  getUsageAnalytics
} from '../controllers/usageController.js';
import { authenticate, authenticateApiKey, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Support both JWT and API key authentication
const authMiddleware = (req, res, next) => {
  if (req.headers['x-api-key'] || req.query.api_key) {
    return authenticateApiKey(req, res, next);
  }
  return authenticate(req, res, next);
};

// Routes - Usage is read-only for API keys
router.get('/current', authMiddleware, requirePermission('usage:read'), getCurrentUsage);
router.get('/history', authMiddleware, requirePermission('usage:read'), getUsageHistory);
router.get('/analytics', authMiddleware, requirePermission('usage:read'), getUsageAnalytics);

export default router;
