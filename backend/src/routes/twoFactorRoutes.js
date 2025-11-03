import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';
import {
  sendVerificationOTP,
  verifyEmailOTP,
  send2FACode,
  send2FAEmailFallback,
  verify2FALogin,
  setup2FA,
  enable2FA,
  disable2FA,
  get2FAStatus
} from '../controllers/twoFactorController.js';
import { getTrustedDevices, revokeTrustedDevice } from '../controllers/twoFactorController.js';

const router = express.Router();

// Validation rules
const emailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const otpValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
];

const verify2FAValidation = [
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('code')
    .isLength({ min: 6, max: 8 })
    .withMessage('Invalid verification code'),
  body('useBackupCode')
    .optional()
    .isBoolean()
  ,
  body('trustDevice')
    .optional()
    .isBoolean()
];

const enable2FAValidation = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Token must be a 6-digit number')
];

const disable2FAValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// OTP Email Verification routes
router.post('/otp/send', emailValidation, validate, sendVerificationOTP);
router.post('/otp/verify', otpValidation, validate, verifyEmailOTP);

// 2FA Login routes (public)
router.post('/2fa/send-code', emailValidation, validate, send2FACode); // Legacy
router.post('/2fa/send-email-fallback', emailValidation, validate, send2FAEmailFallback); // New: Email fallback for lost phone
router.post('/2fa/verify-login', verify2FAValidation, validate, verify2FALogin);

// 2FA Management routes (protected)
router.get('/2fa/status', authenticate, get2FAStatus);
router.post('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/enable', authenticate, enable2FAValidation, validate, enable2FA);
router.post('/2fa/disable', authenticate, disable2FAValidation, validate, disable2FA);
// Trusted devices
router.get('/2fa/trusted', authenticate, getTrustedDevices);
router.delete('/2fa/trusted/:id', authenticate, revokeTrustedDevice);

export default router;
