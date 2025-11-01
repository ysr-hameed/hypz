import express from 'express';
import {
  getCurrentUsage,
  getUsageHistory,
  getUsageAnalytics
} from '../controllers/usageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.get('/current', authenticate, getCurrentUsage);
router.get('/history', authenticate, getUsageHistory);
router.get('/analytics', authenticate, getUsageAnalytics);

export default router;
