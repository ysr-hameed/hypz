import express from 'express';
import { getCurrentUsage, getUsageHistory } from '../controllers/usageController.js';
import { authenticate } from '../middlewares/auth.js';
import { checkApiCallLimit } from '../middlewares/planCheck.js';

const router = express.Router();

// Get current usage
router.get('/current', authenticate, checkApiCallLimit, getCurrentUsage);

// Get usage history
router.get('/history', authenticate, checkApiCallLimit, getUsageHistory);

export default router;
