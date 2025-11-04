import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  inviteTeamMember,
  getTeamMembers,
  acceptTeamInvite,
  updateTeamMember,
  removeTeamMember,
  getPendingInvites,
  resendInvite
} from '../controllers/teamController.js';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Invite team member
router.post(
  '/invite',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').isIn(['admin', 'member', 'viewer']).withMessage('Invalid role'),
    body('permissions').optional().isObject().withMessage('Permissions must be an object'),
    validate
  ],
  inviteTeamMember
);

// Get team members
router.get('/', getTeamMembers);

// Get pending invitations for current user
router.get('/invites/pending', getPendingInvites);

// Accept team invitation
router.post(
  '/invites/:token/accept',
  [
    param('token').isLength({ min: 32 }).withMessage('Invalid invitation token'),
    validate
  ],
  acceptTeamInvite
);

// Resend invitation
router.post(
  '/:memberId/resend',
  [
    param('memberId').isUUID().withMessage('Invalid member ID'),
    validate
  ],
  resendInvite
);

// Update team member
router.put(
  '/:memberId',
  [
    param('memberId').isUUID().withMessage('Invalid member ID'),
    body('role').optional().isIn(['admin', 'member', 'viewer']).withMessage('Invalid role'),
    body('permissions').optional().isObject().withMessage('Permissions must be an object'),
    validate
  ],
  updateTeamMember
);

// Remove team member
router.delete(
  '/:memberId',
  [
    param('memberId').isUUID().withMessage('Invalid member ID'),
    validate
  ],
  removeTeamMember
);

export default router;
