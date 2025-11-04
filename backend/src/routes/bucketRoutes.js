import express from 'express';
import { body } from 'express-validator';
import {
  createBucket,
  getBuckets,
  getBucket,
  updateBucket,
  deleteBucket,
  getBucketStats
} from '../controllers/bucketController.js';
import { authenticate, authenticateApiKey, requirePermission, requireOwnership } from '../middleware/auth.js';
import { validate, validateBucketName, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// Support both JWT and API key authentication
const authMiddleware = (req, res, next) => {
  // Check if API key is provided
  if (req.headers['x-api-key'] || req.query.api_key) {
    return authenticateApiKey(req, res, next);
  }
  // Otherwise use JWT
  return authenticate(req, res, next);
};

// Validation
const createBucketValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Bucket name is required')
    .isLength({ min: 3, max: 63 })
    .withMessage('Bucket name must be between 3 and 63 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Bucket name can only contain lowercase letters, numbers, and hyphens'),
  body('visibility')
    .optional()
    .isIn(['private', 'public'])
    .withMessage('Visibility must be either private or public'),
  body('description').optional().isString(),
  body('region').optional().isString(),
  validate
];

const updateBucketValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 63 })
    .withMessage('Bucket name must be between 3 and 63 characters'),
  body('visibility')
    .optional()
    .isIn(['private', 'public'])
    .withMessage('Visibility must be either private or public'),
  body('description').optional().isString(),
  body('corsEnabled').optional().isBoolean(),
  body('corsOrigins').optional().isArray(),
  validateBucketName,
  validate
];

// Routes - Support both JWT and API key authentication
router.post('/', authMiddleware, requirePermission('buckets:write'), createBucketValidation, createBucket);
router.get('/', authMiddleware, requirePermission('buckets:read'), validatePagination, getBuckets);
router.get('/:bucketId', authMiddleware, requirePermission('buckets:read'), requireOwnership('bucket'), getBucket);
router.put('/:bucketId', authMiddleware, requirePermission('buckets:write'), requireOwnership('bucket'), updateBucketValidation, updateBucket);
router.delete('/:bucketId', authMiddleware, requirePermission('buckets:write'), requireOwnership('bucket'), deleteBucket);
router.get('/:bucketId/stats', authMiddleware, requirePermission('buckets:read'), requireOwnership('bucket'), getBucketStats);

export default router;

