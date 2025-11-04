import express from 'express';
import { putBucketCors, getBucketCors, deleteBucketCors } from '../controllers/corsController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { body, param } from 'express-validator';

const router = express.Router();
router.use(authenticate);

router.put(
  '/buckets/:bucketId/cors',
  requirePermission('cors'),
  param('bucketId').isUUID(),
  body('allowedOrigins').isArray().notEmpty(),
  body('allowedMethods').isArray().notEmpty(),
  body('allowedHeaders').optional().isArray(),
  body('exposeHeaders').optional().isArray(),
  body('maxAgeSeconds').optional().isInt({ min: 0 }),
  validate,
  putBucketCors
);

router.get(
  '/buckets/:bucketId/cors',
  param('bucketId').isUUID(),
  validate,
  getBucketCors
);

router.delete(
  '/buckets/:bucketId/cors',
  requirePermission('cors'),
  param('bucketId').isUUID(),
  validate,
  deleteBucketCors
);

export default router;
