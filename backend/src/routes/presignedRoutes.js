import express from 'express';
import { generatePresignedPost, uploadViaPresignedPost } from '../controllers/presignedController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { body, param } from 'express-validator';

const router = express.Router();

router.post(
  '/generate',
  authenticate,
  requirePermission('presigned_post'),
  body('bucketId').isUUID(),
  body('conditions').optional().isArray(),
  body('expiresIn').optional().isInt({ min: 60, max: 604800 }),
  body('successActionRedirect').optional().isURL(),
  validate,
  generatePresignedPost
);

router.post(
  '/upload/:bucketSlug',
  body('policy').notEmpty(),
  body('signature').notEmpty(),
  validate,
  uploadViaPresignedPost
);

export default router;
