import express from 'express';
import { body } from 'express-validator';
import {
  createApiKey,
  getApiKeys,
  getApiKey,
  updateApiKey,
  deleteApiKey,
  regenerateApiKey
} from '../controllers/apiKeyController.js';
import { authenticate, blockApiKeyAccess, requireOwnership } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// Validation
const createApiKeyValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('API key name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('permissions').optional().isObject().withMessage('Permissions must be an object'),
  body('rateLimit').optional().isInt({ min: 1 }).withMessage('Rate limit must be a positive integer'),
  body('expiresIn').optional().isInt({ min: 1 }).withMessage('Expiration must be a positive integer (days)'),
  validate
];

const updateApiKeyValidation = [
  body('name').optional().trim().isLength({ min: 3, max: 100 }),
  body('permissions').optional().isObject(),
  body('rateLimit').optional().isInt({ min: 1 }),
  body('isActive').optional().isBoolean(),
  validate
];

// Routes - API keys can only be managed via dashboard (JWT), not via other API keys
router.post('/', authenticate, blockApiKeyAccess, createApiKeyValidation, createApiKey);
router.get('/', authenticate, blockApiKeyAccess, getApiKeys);
router.get('/:keyId', authenticate, blockApiKeyAccess, requireOwnership('apikey'), getApiKey);
router.put('/:keyId', authenticate, blockApiKeyAccess, requireOwnership('apikey'), updateApiKeyValidation, updateApiKey);
router.delete('/:keyId', authenticate, blockApiKeyAccess, requireOwnership('apikey'), deleteApiKey);
router.post('/:keyId/regenerate', authenticate, blockApiKeyAccess, requireOwnership('apikey'), regenerateApiKey);

export default router;
