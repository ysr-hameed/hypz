import express from 'express';
import multer from 'multer';
import {
  uploadFileHandler,
  getFiles,
  getFile,
  downloadFileHandler,
  deleteFileHandler,
  getFileStats,
} from '../controllers/fileController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';
import { uploadLimiter } from '../middlewares/limiter.js';
import { checkStorageLimit, checkBandwidthLimit, checkApiCallLimit } from '../middlewares/planCheck.js';
import { config } from '../config/env.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.storage.maxFileSize,
  },
});

// File upload
router.post(
  '/upload',
  authenticate,
  uploadLimiter,
  checkApiCallLimit,
  upload.single('file'),
  checkStorageLimit,
  uploadFileHandler
);

// Get user's files
router.get('/', authenticate, checkApiCallLimit, getFiles);

// Get specific file info
router.get('/:fileId', authenticate, checkApiCallLimit, getFile);

// Download file
router.get('/:fileId/download', optionalAuth, checkBandwidthLimit, downloadFileHandler);

// Delete file
router.delete('/:fileId', authenticate, checkApiCallLimit, deleteFileHandler);

// Get file statistics
router.get('/stats/summary', authenticate, getFileStats);

export default router;
