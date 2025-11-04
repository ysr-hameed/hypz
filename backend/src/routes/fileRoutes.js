import express from 'express';
import {
  upload,
  uploadFile,
  getFiles,
  getFile,
  downloadFile,
  deleteFile,
  updateFile,
  publicDownloadFile,
  createSignedUrl,
  downloadFileSigned,
  bulkDeleteFiles,
  bulkUpdateFiles,
  bulkDownloadFiles,
  bulkMoveFiles,
  bulkUploadFiles
} from '../controllers/fileController.js';
import { authenticate, authenticateApiKey, requirePermission, requireOwnership, authenticateFileToken } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/security.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

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

// Validation for bulk operations
const bulkDeleteValidation = [
  body('fileIds').isArray({ min: 1, max: 100 }).withMessage('fileIds must be an array with 1-100 items'),
  body('fileIds.*').isUUID().withMessage('Each fileId must be a valid UUID'),
  validate
];

const bulkUpdateValidation = [
  body('fileIds').isArray({ min: 1, max: 100 }).withMessage('fileIds must be an array with 1-100 items'),
  body('fileIds.*').isUUID().withMessage('Each fileId must be a valid UUID'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('tags').optional().isArray().withMessage('tags must be an array'),
  body('metadata').optional().isObject().withMessage('metadata must be an object'),
  validate
];

const bulkDownloadValidation = [
  body('fileIds').isArray({ min: 1, max: 50 }).withMessage('fileIds must be an array with 1-50 items'),
  body('fileIds.*').isUUID().withMessage('Each fileId must be a valid UUID'),
  validate
];

const bulkMoveValidation = [
  body('fileIds').isArray({ min: 1, max: 100 }).withMessage('fileIds must be an array with 1-100 items'),
  body('fileIds.*').isUUID().withMessage('Each fileId must be a valid UUID'),
  body('targetBucketId').isUUID().withMessage('targetBucketId must be a valid UUID'),
  validate
];

// Public routes (no authentication required)
router.get('/public/:fileId/download', publicDownloadFile);
// Signed download (no auth header required)
router.get('/file/:fileId/download-signed', authenticateFileToken, downloadFileSigned);

// Protected routes - All routes enforce ownership and permissions
router.post('/:bucketId/upload', authMiddleware, requirePermission('files:write'), requireOwnership('bucket'), uploadLimiter, upload.single('file'), uploadFile);
router.post('/:bucketId/bulk-upload', authMiddleware, requirePermission('files:write'), requireOwnership('bucket'), uploadLimiter, upload.array('files', 20), bulkUploadFiles);
router.get('/:bucketId/files', authMiddleware, requirePermission('files:read'), requireOwnership('bucket'), getFiles);
router.get('/file/:fileId', authMiddleware, requirePermission('files:read'), requireOwnership('file'), getFile);
router.get('/file/:fileId/download', authMiddleware, requirePermission('files:read'), requireOwnership('file'), downloadFile);
router.post('/file/:fileId/signed-url', authMiddleware, requirePermission('files:read'), requireOwnership('file'), createSignedUrl);
router.delete('/file/:fileId', authMiddleware, requirePermission('files:delete'), requireOwnership('file'), deleteFile);
router.patch('/file/:fileId', authMiddleware, requirePermission('files:write'), requireOwnership('file'), updateFile);

// Bulk operations routes
router.post('/bulk/delete', authMiddleware, requirePermission('files:delete'), bulkDeleteValidation, bulkDeleteFiles);
router.post('/bulk/update', authMiddleware, requirePermission('files:write'), bulkUpdateValidation, bulkUpdateFiles);
router.post('/bulk/download', authMiddleware, requirePermission('files:read'), bulkDownloadValidation, bulkDownloadFiles);
router.post('/bulk/move', authMiddleware, requirePermission('files:write'), bulkMoveValidation, bulkMoveFiles);

export default router;

