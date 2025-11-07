import express from 'express';
import {
  createEventSubscription,
  listEventSubscriptions,
  getEventSubscription,
  updateEventSubscription,
  deleteEventSubscription,
  listWebhookDeliveries
} from '../controllers/eventController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { validate, validateListQuery } from '../middleware/validator.js';
import { body, param, query } from 'express-validator';

const router = express.Router();
router.use(authenticate);

router.post(
  '/subscriptions',
  requirePermission('webhooks'),
  body('name').trim().notEmpty(),
  body('endpointUrl').isURL(),
  body('events').isArray().notEmpty(),
  body('bucketId').optional().isUUID(),
  body('filters').optional().isObject(),
  validate,
  createEventSubscription
);

router.get(
  '/subscriptions',
  query('bucketId').optional().isUUID(),
  validate,
  listEventSubscriptions
);

router.get(
  '/subscriptions/:subscriptionId',
  param('subscriptionId').isUUID(),
  validate,
  getEventSubscription
);

router.put(
  '/subscriptions/:subscriptionId',
  requirePermission('webhooks'),
  param('subscriptionId').isUUID(),
  body('name').optional().isString(),
  body('endpointUrl').optional().isURL(),
  body('events').optional().isArray(),
  body('enabled').optional().isBoolean(),
  validate,
  updateEventSubscription
);

router.delete(
  '/subscriptions/:subscriptionId',
  requirePermission('webhooks'),
  param('subscriptionId').isUUID(),
  validate,
  deleteEventSubscription
);

router.get(
  '/subscriptions/:subscriptionId/deliveries',
  param('subscriptionId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
  validateListQuery,
  listWebhookDeliveries
);

export default router;
