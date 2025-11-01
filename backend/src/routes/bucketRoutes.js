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
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

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
  validate
];

// Routes
router.post('/', authenticate, createBucketValidation, createBucket);
router.get('/', authenticate, getBuckets);
router.get('/:bucketId', authenticate, getBucket);
router.put('/:bucketId', authenticate, updateBucketValidation, updateBucket);
router.delete('/:bucketId', authenticate, deleteBucket);
router.get('/:bucketId/stats', authenticate, getBucketStats);

export default router;
