import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
  deleteAccount
} from '../controllers/userController.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 100 }),
  body('avatarUrl').optional().isURL(),
  validate
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validate
];

const notificationPreferencesValidation = [
  body('emailNotifications').optional().isBoolean(),
  body('usageAlerts').optional().isBoolean(),
  body('billingReminders').optional().isBoolean(),
  body('securityUpdates').optional().isBoolean(),
  body('marketingEmails').optional().isBoolean(),
  body('productUpdates').optional().isBoolean(),
  validate
];

const deleteAccountValidation = [
  body('password').notEmpty().withMessage('Password is required'),
  body('confirmation').equals('DELETE').withMessage('Please type DELETE to confirm'),
  validate
];

// Routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);
router.get('/notifications', authenticate, getNotificationPreferences);
router.put('/notifications', authenticate, notificationPreferencesValidation, updateNotificationPreferences);
router.delete('/account', authenticate, deleteAccountValidation, deleteAccount);

export default router;
