import { query, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/validator.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

// 1. PUT CORS RULES
export const putBucketCors = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const { allowedOrigins, allowedMethods, allowedHeaders, exposeHeaders, maxAgeSeconds } = req.body;
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
    // Delete existing CORS rules
    await client.query('DELETE FROM cors_rules WHERE bucket_id = $1', [bucketId]);

    // Insert new rule
    await client.query(
      `INSERT INTO cors_rules (bucket_id, allowed_origins, allowed_methods, allowed_headers, expose_headers, max_age_seconds)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [bucketId, allowedOrigins, allowedMethods, allowedHeaders || [], exposeHeaders || [], maxAgeSeconds || 3600]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'cors_configured', 'bucket', bucketId, { origins: allowedOrigins.length }]
    );
  });

  successResponse(res, {
    bucketId,
    message: 'CORS rules configured successfully'
  });
});

// 2. GET CORS RULES
export const getBucketCors = asyncHandler(async (req, res) => {
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
    'SELECT * FROM cors_rules WHERE bucket_id = $1',
    [bucketId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'No CORS rules configured', 404);
  }

  const rule = result.rows[0];
  successResponse(res, {
    allowedOrigins: rule.allowed_origins,
    allowedMethods: rule.allowed_methods,
    allowedHeaders: rule.allowed_headers,
    exposeHeaders: rule.expose_headers,
    maxAgeSeconds: rule.max_age_seconds
  });
});

// 3. DELETE CORS RULES
export const deleteBucketCors = asyncHandler(async (req, res) => {
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

  await transaction(async (client) => {
    const result = await client.query(
      'DELETE FROM cors_rules WHERE bucket_id = $1 RETURNING *',
      [bucketId]
    );

    if (result.rows.length === 0) {
      throw new Error('No CORS rules found');
    }

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'cors_deleted', 'bucket', bucketId, {}]
    );
  });

  successResponse(res, {
    bucketId,
    message: 'CORS rules deleted successfully'
  });
});
