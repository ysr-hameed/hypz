import express from 'express';
import {
  upload,
  uploadFile,
  getFiles,
  getFile,
  downloadFile,
  deleteFile,
  updateFile
} from '../controllers/fileController.js';
import { authenticate, authenticateApiKey } from '../middleware/auth.js';
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

// Routes
router.post('/:bucketId/upload', authMiddleware, uploadLimiter, upload.single('file'), uploadFile);
router.get('/:bucketId/files', authMiddleware, getFiles);
router.get('/file/:fileId', authMiddleware, getFile);
router.get('/file/:fileId/download', authMiddleware, downloadFile);
router.delete('/file/:fileId', authMiddleware, deleteFile);
router.patch('/file/:fileId', authMiddleware, updateFile);

export default router;
