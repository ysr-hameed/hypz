import express from 'express';
import { body, query as queryValidator } from 'express-validator';
import {
  getSettings,
  getSetting,
  updateSetting,
  getUsers,
  updateUserStatus,
  getSystemStats,
  getActivityLogs,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getAllWebhooks,
  getWebhookDeliveries,
  disableWebhook,
  getAllApiKeys,
  revokeApiKey,
  getAllFiles,
  deleteFileAdmin
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

// Plan Management
router.get('/plans', getAllPlans);
router.post('/plans', [
  body('id').notEmpty().withMessage('Plan ID is required'),
  body('name').notEmpty().withMessage('Plan name is required'),
  body('type').isIn(['free', 'subscription', 'payg']).withMessage('Invalid plan type'),
  body('price_usd').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('storage_gb').isInt({ min: 0 }).withMessage('Storage must be a positive integer'),
  body('bandwidth_gb').isInt({ min: 0 }).withMessage('Bandwidth must be a positive integer'),
  body('api_calls').isInt({ min: 0 }).withMessage('API calls must be a positive integer'),
  validate
], createPlan);
router.put('/plans/:planId', [
  body('name').notEmpty().withMessage('Plan name is required'),
  body('type').isIn(['free', 'subscription', 'payg']).withMessage('Invalid plan type'),
  body('price_usd').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  validate
], updatePlan);
router.delete('/plans/:planId', deletePlan);

// Webhook Management
router.get('/webhooks', [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  validate
], getAllWebhooks);
router.get('/webhooks/:subscriptionId/deliveries', [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 200 }),
  validate
], getWebhookDeliveries);
router.patch('/webhooks/:subscriptionId/disable', disableWebhook);

// API Key Management
router.get('/api-keys', [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('status').optional().isIn(['active', 'inactive']),
  validate
], getAllApiKeys);
router.patch('/api-keys/:keyId/revoke', revokeApiKey);

// File Management
router.get('/files', [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('search').optional().isString(),
  validate
], getAllFiles);
router.delete('/files/:fileId', deleteFileAdmin);

export default router;
