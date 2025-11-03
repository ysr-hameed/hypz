import express from 'express';
import { body, query as queryValidator } from 'express-validator';
import {
  getSettings,
  getSetting,
  updateSetting,
  getUsers,
  updateUserStatus,
  getSystemStats,
  getActivityLogs
} from '../controllers/adminController.js';
import { authenticate, requireAdmin, blockApiKeyAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// All admin routes require authentication, admin role, and BLOCK API key access
router.use(authenticate);
router.use(blockApiKeyAccess); // Admin routes cannot be accessed via API keys
router.use(requireAdmin);

// Admin Settings
router.get('/settings', getSettings);
router.get('/settings/:key', getSetting);
router.put('/settings/:key', [
  body('value').notEmpty().withMessage('Value is required'),
  validate
], updateSetting);

// User Management
router.get('/users', [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  validate
], getUsers);

router.patch('/users/:userId/status', [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  validate
], updateUserStatus);

// System Stats
router.get('/stats', getSystemStats);

// Activity Logs
router.get('/logs', [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  validate
], getActivityLogs);

export default router;
