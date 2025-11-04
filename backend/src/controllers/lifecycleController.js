import { query, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/validator.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

// 1. PUT BUCKET LIFECYCLE
export const putBucketLifecycle = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const { name, rules, enabled } = req.body;
  const userId = req.user.id;

  // Verify bucket ownership
  const bucketResult = await query(
    'SELECT * FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucketResult.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  // Validate rules format
  if (!Array.isArray(rules) || rules.length === 0) {
    return errorResponse(res, 'Rules must be a non-empty array', 400);
  }

  for (const rule of rules) {
    if (!rule.id || !rule.status || (!rule.transitions && !rule.expiration)) {
      return errorResponse(res, 'Invalid rule format. Each rule must have id, status, and either transitions or expiration', 400);
    }
  }

  await transaction(async (client) => {
    // Upsert lifecycle policy
    await client.query(
      `INSERT INTO lifecycle_policies (bucket_id, name, rules, enabled)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (bucket_id, name)
       DO UPDATE SET rules = $3, enabled = $4, updated_at = NOW()`,
      [bucketId, name || 'default', JSON.stringify(rules), enabled !== false]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'lifecycle_policy_set', 'bucket', bucketId, { name, rulesCount: rules.length }]
    );
  });

  successResponse(res, {
    bucketId,
    name,
    rules,
    enabled: enabled !== false,
    message: 'Lifecycle policy configured successfully'
  });
});

// 2. GET BUCKET LIFECYCLE
export const getBucketLifecycle = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;

  // Verify bucket ownership
  const bucketResult = await query(
    'SELECT * FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucketResult.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  const result = await query(
    'SELECT * FROM lifecycle_policies WHERE bucket_id = $1',
    [bucketId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'No lifecycle policy configured', 404);
  }

  successResponse(res, {
    policies: result.rows.map(p => ({
      id: p.id,
      name: p.name,
      enabled: p.enabled,
      rules: p.rules,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }))
  });
});

// 3. DELETE BUCKET LIFECYCLE
export const deleteBucketLifecycle = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const { name } = req.query;
  const userId = req.user.id;

  // Verify bucket ownership
  const bucketResult = await query(
    'SELECT * FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucketResult.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  await transaction(async (client) => {
    const result = await client.query(
      'DELETE FROM lifecycle_policies WHERE bucket_id = $1 AND ($2::text IS NULL OR name = $2) RETURNING *',
      [bucketId, name || null]
    );

    if (result.rows.length === 0) {
      throw new Error('Lifecycle policy not found');
    }

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'lifecycle_policy_deleted', 'bucket', bucketId, { name: name || 'all' }]
    );
  });

  successResponse(res, {
    bucketId,
    message: name ? `Lifecycle policy '${name}' deleted` : 'All lifecycle policies deleted'
  });
});
