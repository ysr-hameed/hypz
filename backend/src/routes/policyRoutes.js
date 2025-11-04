import express from 'express';
import { putBucketPolicy, getBucketPolicy, deleteBucketPolicy } from '../controllers/policyController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { body, param } from 'express-validator';

const router = express.Router();
router.use(authenticate);

router.put(
  '/buckets/:bucketId/policy',
  requirePermission('bucket_policies'),
  param('bucketId').isUUID(),
  body('policy').isObject(),
  validate,
  putBucketPolicy
);

router.get(
  '/buckets/:bucketId/policy',
  param('bucketId').isUUID(),
  validate,
  getBucketPolicy
);

router.delete(
  '/buckets/:bucketId/policy',
  requirePermission('bucket_policies'),
  param('bucketId').isUUID(),
  validate,
  deleteBucketPolicy
);

export default router;
