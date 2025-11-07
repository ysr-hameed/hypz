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
  moveFileToBucket,
  bulkUploadFiles,
  initiatePresignedUpload,
  completePresignedUpload
} from '../controllers/fileController.js';
import { authenticate, authenticateApiKey, requirePermission, requireOwnership, authenticateFileToken } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/security.js';
import { body } from 'express-validator';
import { validate, validateFileUpload, validateIdArray, validatePagination } from '../middleware/validator.js';

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
  body('fileIds.*').isInt({ min: 1 }).withMessage('Each fileId must be a positive integer'),
  validate
];

const bulkUpdateValidation = [
  body('fileIds').isArray({ min: 1, max: 100 }).withMessage('fileIds must be an array with 1-100 items'),
  body('fileIds.*').isInt({ min: 1 }).withMessage('Each fileId must be a positive integer'),
  body('tags').optional().isArray().withMessage('tags must be an array'),
  body('metadata').optional().isObject().withMessage('metadata must be an object'),
  validate
];

const bulkDownloadValidation = [
  body('fileIds').isArray({ min: 1, max: 50 }).withMessage('fileIds must be an array with 1-50 items'),
  body('fileIds.*').isInt({ min: 1 }).withMessage('Each fileId must be a positive integer'),
  validate
];

const bulkMoveValidation = [
  body('fileIds').isArray({ min: 1, max: 100 }).withMessage('fileIds must be an array with 1-100 items'),
  body('fileIds.*').isInt({ min: 1 }).withMessage('Each fileId must be a positive integer'),
  body('targetBucketId').isInt({ min: 1 }).withMessage('targetBucketId must be a positive integer'),
  validate
];

// Public routes (no authentication required)
router.get('/public/:fileId/download', publicDownloadFile);
// Signed download (no auth header required)
router.get('/file/:fileId/download-signed', authenticateFileToken, downloadFileSigned);

// Protected routes - All routes enforce ownership and permissions
router.post('/:bucketId/upload', authMiddleware, requirePermission('files:write'), requireOwnership('bucket'), uploadLimiter, upload.single('file'), validateFileUpload, uploadFile);
router.post('/:bucketId/bulk-upload', authMiddleware, requirePermission('files:write'), requireOwnership('bucket'), uploadLimiter, upload.array('files', 20), validateFileUpload, bulkUploadFiles);

// Presigned upload routes (direct client to B2)
router.post('/:bucketId/files/presigned', authMiddleware, requirePermission('files:write'), requireOwnership('bucket'), [
  body('filename').notEmpty().withMessage('filename is required'),
  body('mimeType').notEmpty().withMessage('mimeType is required'),
  body('size').optional().isInt({ min: 0 }).withMessage('size must be a positive integer'),
  validate
], initiatePresignedUpload);
router.post('/file/:fileId/complete', authMiddleware, requirePermission('files:write'), requireOwnership('file'), [
  body('b2FileId').notEmpty().withMessage('b2FileId is required'),
  body('sha1').optional().isString(),
  body('url').optional().isURL(),
  body('tags').optional().isArray(),
  body('metadata').optional().isObject(),
  validate
], completePresignedUpload);

router.get('/:bucketId/files', authMiddleware, requirePermission('files:read'), requireOwnership('bucket'), validatePagination, getFiles);
router.get('/file/:fileId', authMiddleware, requirePermission('files:read'), requireOwnership('file'), getFile);
router.get('/file/:fileId/download', authMiddleware, requirePermission('files:read'), requireOwnership('file'), downloadFile);
router.post('/file/:fileId/signed-url', authMiddleware, requirePermission('files:read'), requireOwnership('file'), createSignedUrl);
router.delete('/file/:fileId', authMiddleware, requirePermission('files:delete'), requireOwnership('file'), deleteFile);
router.patch('/file/:fileId', authMiddleware, requirePermission('files:write'), requireOwnership('file'), validateFileUpload, updateFile);
// Move single file to another bucket
router.post('/file/:fileId/move', authMiddleware, requirePermission('files:write'), requireOwnership('file'), [ body('targetBucketId').isInt({ min: 1 }).withMessage('targetBucketId must be a positive integer'), validate ], moveFileToBucket);

// Bulk operations routes
router.post('/bulk/delete', authMiddleware, requirePermission('files:delete'), bulkDeleteValidation, bulkDeleteFiles);
router.post('/bulk/update', authMiddleware, requirePermission('files:write'), bulkUpdateValidation, validateFileUpload, bulkUpdateFiles);
router.post('/bulk/download', authMiddleware, requirePermission('files:read'), bulkDownloadValidation, bulkDownloadFiles);
router.post('/bulk/move', authMiddleware, requirePermission('files:write'), bulkMoveValidation, bulkMoveFiles);

export default router;


