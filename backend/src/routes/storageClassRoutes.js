import express from 'express';
import {
  getStorageClasses,
  changeFileStorageClass,
  getBucketStorageClass,
  setBucketStorageClass,
  getFileStorageClassHistory,
  getStorageClassAnalytics
} from '../controllers/storageClassController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { body, param } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// 1. GET all available storage classes
router.get(
  '/classes',
  getStorageClasses
);

// 2. CHANGE file storage class
router.put(
  '/files/:fileId/storage-class',
  requirePermission('storage_classes'),
  param('fileId').isUUID().withMessage('Invalid file ID'),
  body('storageClass')
    .isIn(['STANDARD', 'INFREQUENT_ACCESS', 'GLACIER', 'DEEP_ARCHIVE'])
    .withMessage('Invalid storage class'),
  validate,
  changeFileStorageClass
);

// 3. GET file storage class transition history
router.get(
  '/files/:fileId/history',
  requirePermission('storage_classes'),
  param('fileId').isUUID().withMessage('Invalid file ID'),
  validate,
  getFileStorageClassHistory
);

// 4. GET bucket default storage class
router.get(
  '/buckets/:bucketId/storage-class',
  param('bucketId').isUUID().withMessage('Invalid bucket ID'),
  validate,
  getBucketStorageClass
);

// 5. SET bucket default storage class
router.put(
  '/buckets/:bucketId/storage-class',
  requirePermission('storage_classes'),
  param('bucketId').isUUID().withMessage('Invalid bucket ID'),
  body('storageClass')
    .isIn(['STANDARD', 'INFREQUENT_ACCESS', 'GLACIER', 'DEEP_ARCHIVE'])
    .withMessage('Invalid storage class'),
  validate,
  setBucketStorageClass
);

// 6. GET storage class analytics for bucket
router.get(
  '/buckets/:bucketId/analytics',
  requirePermission('storage_classes'),
  param('bucketId').isUUID().withMessage('Invalid bucket ID'),
  validate,
  getStorageClassAnalytics
);

export default router;
