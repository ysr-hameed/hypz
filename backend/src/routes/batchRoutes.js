import express from 'express';
import {
  createBatchJob,
  getBatchJob,
  listBatchJobs,
  cancelBatchJob,
  listBatchOperations
} from '../controllers/batchController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { body, param, query } from 'express-validator';

const router = express.Router();
router.use(authenticate);

router.post(
  '/jobs',
  requirePermission('batch_operations'),
  body('jobType').isIn(['delete', 'copy', 'restore', 'change_storage_class', 'tag']),
  body('bucketId').optional().isUUID(),
  body('filters').optional().isObject(),
  body('priority').optional().isInt({ min: 0, max: 10 }),
  validate,
  createBatchJob
);

router.get(
  '/jobs/:jobId',
  param('jobId').isUUID(),
  validate,
  getBatchJob
);

router.get(
  '/jobs',
  query('status').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
  listBatchJobs
);

router.delete(
  '/jobs/:jobId',
  requirePermission('batch_operations'),
  param('jobId').isUUID(),
  validate,
  cancelBatchJob
);

router.get(
  '/jobs/:jobId/operations',
  param('jobId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
  listBatchOperations
);

export default router;
