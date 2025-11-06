import { query, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/validator.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import crypto from 'crypto';
import axios from 'axios';
import logger from '../utils/logger.js';

// 1. CREATE EVENT SUBSCRIPTION
export const createEventSubscription = asyncHandler(async (req, res) => {
  const { bucketId, name, endpointUrl, events, filters } = req.body;
  const userId = req.user.id;

  // Verify bucket ownership if bucketId provided
  if (bucketId) {
    const bucketResult = await query(
      'SELECT * FROM buckets WHERE id = $1 AND user_id = $2',
      [bucketId, userId]
    );

    if (bucketResult.rows.length === 0) {
      return errorResponse(res, 'Bucket not found', 404);
    }
  }

  // Generate webhook secret
  const secret = crypto.randomBytes(32).toString('hex');

  const result = await transaction(async (client) => {
    const subResult = await client.query(
      `INSERT INTO event_subscriptions (user_id, bucket_id, name, endpoint_url, events, filters, secret)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, bucketId || null, name, endpointUrl, events, JSON.stringify(filters || {}), secret]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'webhook_created', 'event_subscription', subResult.rows[0].id, { name, events }]
    );

    return subResult.rows[0];
  });

  successResponse(res, {
    id: result.id,
    name: result.name,
    endpointUrl: result.endpoint_url,
    events: result.events,
    secret: result.secret,
    enabled: result.enabled,
    message: 'Event subscription created successfully'
  }, 201);
});

// 2. LIST EVENT SUBSCRIPTIONS
export const listEventSubscriptions = asyncHandler(async (req, res) => {
  const { bucketId } = req.query;
  const userId = req.user.id;
  
  let queryStr = 'SELECT * FROM event_subscriptions WHERE user_id = $1';
  const params = [userId];

  if (bucketId) {
    queryStr += ' AND bucket_id = $2';
    params.push(bucketId);
  }

  queryStr += ' ORDER BY created_at DESC';

  const result = await query(queryStr, params);

  successResponse(res, {
    subscriptions: result.rows.map(s => ({
      id: s.id,
      name: s.name,
      bucketId: s.bucket_id,
      endpointUrl: s.endpoint_url,
      events: s.events,
      enabled: s.enabled,
      createdAt: s.created_at
    })),
    count: result.rows.length
  });
});

// 3. GET EVENT SUBSCRIPTION
export const getEventSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const userId = req.user.id;

  const result = await query(
    'SELECT * FROM event_subscriptions WHERE id = $1 AND user_id = $2',
    [subscriptionId, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Subscription not found', 404);
  }

  const sub = result.rows[0];
  
  successResponse(res, {
    id: sub.id,
    name: sub.name,
    bucketId: sub.bucket_id,
    endpointUrl: sub.endpoint_url,
    events: sub.events,
    filters: sub.filters,
    secret: sub.secret,
    enabled: sub.enabled,
    createdAt: sub.created_at,
    updatedAt: sub.updated_at
  });
});

// 4. UPDATE EVENT SUBSCRIPTION
export const updateEventSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const { name, endpointUrl, events, filters, enabled } = req.body;
  const userId = req.user.id;

  const result = await transaction(async (client) => {
    const updateResult = await client.query(
      `UPDATE event_subscriptions
       SET name = COALESCE($3, name),
           endpoint_url = COALESCE($4, endpoint_url),
           events = COALESCE($5, events),
           filters = COALESCE($6, filters),
           enabled = COALESCE($7, enabled),
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [subscriptionId, userId, name, endpointUrl, events, filters ? JSON.stringify(filters) : null, enabled]
    );

    if (updateResult.rows.length === 0) {
      throw new Error('Subscription not found');
    }

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'webhook_updated', 'event_subscription', subscriptionId, { name }]
    );

    return updateResult.rows[0];
  });

  successResponse(res, {
    id: result.id,
    name: result.name,
    enabled: result.enabled,
    message: 'Event subscription updated successfully'
  });
});

// 5. DELETE EVENT SUBSCRIPTION
export const deleteEventSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const userId = req.user.id;

  await transaction(async (client) => {
    const result = await client.query(
      'DELETE FROM event_subscriptions WHERE id = $1 AND user_id = $2 RETURNING *',
      [subscriptionId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Subscription not found');
    }

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'webhook_deleted', 'event_subscription', subscriptionId, { name: result.rows[0].name }]
    );
  });

  successResponse(res, {
    subscriptionId,
    message: 'Event subscription deleted successfully'
  });
});

// 6. LIST WEBHOOK DELIVERIES
export const listWebhookDeliveries = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  // Verify subscription ownership
  const subResult = await query(
    'SELECT id FROM event_subscriptions WHERE id = $1 AND user_id = $2',
    [subscriptionId, userId]
  );

  if (subResult.rows.length === 0) {
    return errorResponse(res, 'Subscription not found', 404);
  }

  const result = await query(
    `SELECT id, event_type, status, response_code, attempts, delivered_at, created_at
     FROM webhook_deliveries
     WHERE subscription_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [subscriptionId, limit, offset]
  );

  successResponse(res, {
    deliveries: result.rows,
    count: result.rows.length,
    limit,
    offset
  });
});

// 7. TRIGGER EVENT (internal function - called from other controllers)
export const triggerEvent = async (eventType, payload) => {
  try {
    // Get all active subscriptions for this event
    const subscriptions = await query(
      `SELECT * FROM event_subscriptions 
       WHERE enabled = true 
       AND $1 = ANY(events)
       AND ($2::uuid IS NULL OR bucket_id = $2 OR bucket_id IS NULL)`,
      [eventType, payload.bucketId || null]
    );

    for (const sub of subscriptions.rows) {
      // Create webhook delivery record
      const deliveryResult = await query(
        `INSERT INTO webhook_deliveries (subscription_id, event_type, payload, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [sub.id, eventType, JSON.stringify(payload), 'pending']
      );

      // Attempt delivery (non-blocking)
      deliverWebhook(deliveryResult.rows[0].id, sub, eventType, payload).catch(err => {
        logger.error('Webhook delivery error:', err);
      });
    }
  } catch (error) {
    logger.error('Error triggering event:', error);
  }
};

// Helper function to deliver webhook
const deliverWebhook = async (deliveryId, subscription, eventType, payload) => {
  try {
    // Create signature
    const signature = crypto
      .createHmac('sha256', subscription.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Send webhook
    const response = await axios.post(subscription.endpoint_url, {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payload
    }, {
      headers: {
        'X-Hypz-Signature': signature,
        'X-Hypz-Event': eventType,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Update delivery status
    await query(
      `UPDATE webhook_deliveries
       SET status = $1, response_code = $2, response_body = $3, delivered_at = NOW()
       WHERE id = $4`,
      ['delivered', response.status, response.data ? JSON.stringify(response.data).substring(0, 1000) : null, deliveryId]
    );
  } catch (error) {
    // Update failure status
    await query(
      `UPDATE webhook_deliveries
       SET status = $1, response_code = $2, response_body = $3, attempts = attempts + 1, next_retry_at = NOW() + INTERVAL '5 minutes'
       WHERE id = $4`,
      ['failed', error.response?.status || 0, error.message.substring(0, 1000), deliveryId]
    );
  }
};
