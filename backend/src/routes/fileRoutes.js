import express from 'express';
import {
  upload,
  uploadFile,
  getFiles,
  getFile,
  downloadFile,
  deleteFile,
  updateFile,
  publicDownloadFile
} from '../controllers/fileController.js';
import { authenticate, authenticateApiKey, requirePermission, requireOwnership } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/security.js';

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

// Public routes (no authentication required)
router.get('/public/:fileId/download', publicDownloadFile);

// Protected routes - All routes enforce ownership and permissions
router.post('/:bucketId/upload', authMiddleware, requirePermission('files:write'), requireOwnership('bucket'), uploadLimiter, upload.single('file'), uploadFile);
router.get('/:bucketId/files', authMiddleware, requirePermission('files:read'), requireOwnership('bucket'), getFiles);
router.get('/file/:fileId', authMiddleware, requirePermission('files:read'), requireOwnership('file'), getFile);
router.get('/file/:fileId/download', authMiddleware, requirePermission('files:read'), requireOwnership('file'), downloadFile);
router.delete('/file/:fileId', authMiddleware, requirePermission('files:delete'), requireOwnership('file'), deleteFile);
router.patch('/file/:fileId', authMiddleware, requirePermission('files:write'), requireOwnership('file'), updateFile);

export default router;
