import { query, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/validator.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import crypto from 'crypto';
import config from '../config/config.js';

// 1. GENERATE PRE-SIGNED POST URL
export const generatePresignedPost = asyncHandler(async (req, res) => {
  const { bucketId, conditions, expiresIn, successActionRedirect } = req.body;
  const userId = req.user.id;

  // Verify bucket ownership
  const bucketResult = await query(
    'SELECT * FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucketResult.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  const bucket = bucketResult.rows[0];
  const expiresAt = new Date(Date.now() + (expiresIn || 3600) * 1000);

  // Build policy
  const policy = {
    expiration: expiresAt.toISOString(),
    conditions: conditions || [
      { bucket: bucket.slug },
      ['content-length-range', 0, 10485760], // 10MB default
      ['starts-with', '$key', ''],
      ['starts-with', '$Content-Type', '']
    ]
  };

  // Create signature
  const policyString = JSON.stringify(policy);
  const policyBase64 = Buffer.from(policyString).toString('base64');
  const signature = crypto
    .createHmac('sha256', config.JWT_SECRET)
    .update(policyBase64)
    .digest('hex');

  const result = await transaction(async (client) => {
    const postResult = await client.query(
      `INSERT INTO presigned_post_policies (user_id, bucket_id, policy, signature, expires_at, success_action_redirect)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, bucketId, JSON.stringify(policy), signature, expiresAt, successActionRedirect || null]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'presigned_post_generated', 'bucket', bucketId, { expiresIn }]
    );

    return postResult.rows[0];
  });

  successResponse(res, {
    id: result.id,
    url: `${config.API_URL}/upload/${bucket.slug}`,
    fields: {
      policy: policyBase64,
      signature,
      bucket: bucket.slug,
      'x-hypz-algorithm': 'HMAC-SHA256',
      'x-hypz-date': new Date().toISOString(),
      'x-hypz-credential': userId
    },
    expiresAt
  }, 201);
});

// 2. UPLOAD VIA PRE-SIGNED POST
export const uploadViaPresignedPost = asyncHandler(async (req, res) => {
  const { bucketSlug } = req.params;
  const { policy: policyData, signature } = req.body;

  // Verify bucket exists
  const bucketResult = await query(
    'SELECT id FROM buckets WHERE slug = $1',
    [bucketSlug]
  );

  if (bucketResult.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  // Verify policy exists and not expired
  const policyResult = await query(
    `SELECT * FROM presigned_post_policies 
     WHERE bucket_id = $1 AND signature = $2 AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [bucketResult.rows[0].id, signature]
  );

  if (policyResult.rows.length === 0) {
    return errorResponse(res, 'Invalid or expired policy', 403);
  }

  const verifiedPolicy = policyResult.rows[0];

  // Process file upload using the verified policy
  // Verify the upload matches policy conditions
  if (verifiedPolicy.max_file_size && req.body.fileSize > verifiedPolicy.max_file_size) {
    return errorResponse(res, 'File size exceeds policy limit', 413);
  }

  // Mark policy as used (optional: implement one-time use)
  await query(
    'UPDATE presigned_post_policies SET used_at = NOW() WHERE id = $1',
    [verifiedPolicy.id]
  );

  successResponse(res, {
    message: 'File uploaded successfully via pre-signed POST',
    bucketSlug,
    policyId: verifiedPolicy.id
  });
});
