import express from 'express';
import { putBucketLifecycle, getBucketLifecycle, deleteBucketLifecycle } from '../controllers/lifecycleController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { body, param, query } from 'express-validator';

const router = express.Router();
router.use(authenticate);

router.put(
  '/buckets/:bucketId/lifecycle',
  requirePermission('lifecycle_policies'),
  param('bucketId').isUUID(),
  body('name').optional().isString(),
  body('rules').isArray().notEmpty(),
  body('enabled').optional().isBoolean(),
  validate,
  putBucketLifecycle
);

router.get(
  '/buckets/:bucketId/lifecycle',
  param('bucketId').isUUID(),
  validate,
  getBucketLifecycle
);

router.delete(
  '/buckets/:bucketId/lifecycle',
  requirePermission('lifecycle_policies'),
  param('bucketId').isUUID(),
  query('name').optional().isString(),
  validate,
  deleteBucketLifecycle
);

export default router;
