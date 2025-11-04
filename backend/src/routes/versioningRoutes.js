import express from 'express';
import { authenticate, requirePermission, requireOwnership } from '../middleware/auth.js';
import { body, query as queryValidator } from 'express-validator';
import { validate } from '../middleware/validator.js';
import {
  putBucketVersioning,
  getBucketVersioning,
  listObjectVersions,
  getObjectVersion,
  deleteObjectVersion,
  restoreObjectVersion
} from '../controllers/versioningController.js';

const router = express.Router();

// Validation
const versioningValidation = [
  body('status').isIn(['Enabled', 'Suspended']).withMessage('Status must be Enabled or Suspended'),
  body('mfaDelete').optional().isBoolean(),
  validate
];

const restoreValidation = [
  body('versionId').trim().notEmpty().withMessage('versionId is required'),
  validate
];

// Support both JWT and API key authentication
const authMiddleware = (req, res, next) => {
  if (req.headers['x-api-key'] || req.query.api_key) {
    return authenticateApiKey(req, res, next);
  }
  return authenticate(req, res, next);
};

// Bucket-level versioning
router.put(
  '/buckets/:bucketId/versioning',
  authenticate,
  requirePermission('buckets:write'),
  requireOwnership('bucket'),
  versioningValidation,
  putBucketVersioning
);

router.get(
  '/buckets/:bucketId/versioning',
  authenticate,
  requirePermission('buckets:read'),
  requireOwnership('bucket'),
  getBucketVersioning
);

// Object versions
router.get(
  '/buckets/:bucketId/versions',
  authenticate,
  requirePermission('files:read'),
  requireOwnership('bucket'),
  listObjectVersions
);

router.get(
  '/files/:fileId/version',
  authenticate,
  requirePermission('files:read'),
  getObjectVersion
);

router.delete(
  '/files/:fileId/version',
  authenticate,
  requirePermission('files:delete'),
  deleteObjectVersion
);

router.post(
  '/files/:fileId/restore',
  authenticate,
  requirePermission('files:write'),
  restoreValidation,
  restoreObjectVersion
);

export default router;
