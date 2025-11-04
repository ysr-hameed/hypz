import express from 'express';
import {
  initiateMultipartUpload,
  getUploadPartUrl,
  completePartUpload,
  completeMultipartUpload,
  abortMultipartUpload,
  listParts,
  listMultipartUploads
} from '../controllers/multipartController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// 1. INITIATE multipart upload
router.post(
  '/uploads',
  requirePermission('multipart_upload'),
  body('bucketId').isUUID().withMessage('Invalid bucket ID'),
  body('filename').trim().notEmpty().withMessage('Filename is required'),
  body('mimeType').optional().isString(),
  body('storageClass')
    .optional()
    .isIn(['STANDARD', 'INFREQUENT_ACCESS', 'GLACIER', 'DEEP_ARCHIVE'])
    .withMessage('Invalid storage class'),
  body('metadata').optional().isObject(),
  validate,
  initiateMultipartUpload
);

// 2. GET upload URL for a specific part
router.get(
  '/uploads/:uploadId/part-url',
  requirePermission('multipart_upload'),
  param('uploadId').isUUID().withMessage('Invalid upload ID'),
  query('partNumber').isInt({ min: 1, max: 10000 }).withMessage('Part number must be 1-10000'),
  validate,
  getUploadPartUrl
);

// 3. MARK part as uploaded
router.post(
  '/uploads/:uploadId/parts',
  requirePermission('multipart_upload'),
  param('uploadId').isUUID().withMessage('Invalid upload ID'),
  body('partNumber').isInt({ min: 1, max: 10000 }).withMessage('Part number must be 1-10000'),
  body('size').isInt({ min: 1 }).withMessage('Size must be positive'),
  body('sha1').isString().withMessage('SHA1 hash is required'),
  body('etag').optional().isString(),
  validate,
  completePartUpload
);

// 4. COMPLETE multipart upload
router.post(
  '/uploads/:uploadId/complete',
  requirePermission('multipart_upload'),
  param('uploadId').isUUID().withMessage('Invalid upload ID'),
  validate,
  completeMultipartUpload
);

// 5. ABORT multipart upload
router.delete(
  '/uploads/:uploadId',
  requirePermission('multipart_upload'),
  param('uploadId').isUUID().withMessage('Invalid upload ID'),
  validate,
  abortMultipartUpload
);

// 6. LIST parts of an upload
router.get(
  '/uploads/:uploadId/parts',
  requirePermission('multipart_upload'),
  param('uploadId').isUUID().withMessage('Invalid upload ID'),
  validate,
  listParts
);

// 7. LIST all multipart uploads
router.get(
  '/uploads',
  requirePermission('multipart_upload'),
  query('bucketId').optional().isUUID().withMessage('Invalid bucket ID'),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
  listMultipartUploads
);

export default router;
