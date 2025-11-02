import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createNotification,
  sendBulkNotification,
  getAllNotifications,
  deleteNotificationAdmin,
  getNotificationStats
} from '../controllers/notificationController.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// Validation rules
const createNotificationValidation = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('message').notEmpty().withMessage('Message is required').trim(),
  body('type').optional().isIn(['info', 'success', 'warning', 'error', 'announcement']).withMessage('Invalid notification type'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
  body('isGlobal').optional().isBoolean(),
  body('userId').optional().isUUID(),
  body('expiresIn').optional().isInt({ min: 1 }).withMessage('Expires in must be a positive number'),
  validate
];

const bulkNotificationValidation = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('message').notEmpty().withMessage('Message is required').trim(),
  body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
  body('userIds.*').isUUID().withMessage('Invalid user ID'),
  validate
];

// User routes (authenticated users)
router.get('/', authenticate, getUserNotifications);
router.put('/:notificationId/read', authenticate, markNotificationRead);
router.put('/read-all', authenticate, markAllNotificationsRead);
router.delete('/:notificationId', authenticate, deleteNotification);

// Admin routes (admin only)
router.post('/', authenticate, requireAdmin, createNotificationValidation, createNotification);
router.post('/bulk', authenticate, requireAdmin, bulkNotificationValidation, sendBulkNotification);
router.get('/admin/all', authenticate, requireAdmin, getAllNotifications);
router.get('/admin/stats', authenticate, requireAdmin, getNotificationStats);
router.delete('/admin/:notificationId', authenticate, requireAdmin, deleteNotificationAdmin);

export default router;
