import { query, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/validator.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

// 1. PUT BUCKET POLICY
export const putBucketPolicy = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const { policy } = req.body;
  const userId = req.user.id;

  // Verify bucket ownership
  const bucketResult = await query(
    'SELECT * FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucketResult.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  // Validate policy structure
  if (!policy.Version || !policy.Statement || !Array.isArray(policy.Statement)) {
    return errorResponse(res, 'Invalid policy format. Must include Version and Statement array', 400);
  }

  await transaction(async (client) => {
    await client.query(
      `INSERT INTO bucket_policies (bucket_id, policy)
       VALUES ($1, $2)
       ON CONFLICT (bucket_id)
       DO UPDATE SET policy = $2, updated_at = NOW()`,
      [bucketId, JSON.stringify(policy)]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'bucket_policy_set', 'bucket', bucketId, { statementsCount: policy.Statement.length }]
    );
  });

  successResponse(res, {
    bucketId,
    message: 'Bucket policy configured successfully'
  });
});

// 2. GET BUCKET POLICY
export const getBucketPolicy = asyncHandler(async (req, res) => {
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
    'SELECT policy FROM bucket_policies WHERE bucket_id = $1',
    [bucketId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'No bucket policy configured', 404);
  }

  successResponse(res, {
    policy: result.rows[0].policy
  });
});

// 3. DELETE BUCKET POLICY
export const deleteBucketPolicy = asyncHandler(async (req, res) => {
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
      'DELETE FROM bucket_policies WHERE bucket_id = $1 RETURNING *',
      [bucketId]
    );

    if (result.rows.length === 0) {
      throw new Error('No bucket policy found');
    }

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'bucket_policy_deleted', 'bucket', bucketId, {}]
    );
  });

  successResponse(res, {
    bucketId,
    message: 'Bucket policy deleted successfully'
  });
});
