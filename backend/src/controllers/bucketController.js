import { query, transaction } from '../config/database.js';
import { slugify, successResponse, errorResponse, paginate, getPaginationMeta } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';

// Create bucket
export const createBucket = asyncHandler(async (req, res) => {
  const { name, visibility = 'private', description, region = 'us-east-1' } = req.body;
  const userId = req.user.id;

  // Generate slug
  const slug = slugify(name) + '-' + Date.now().toString(36);

  // Check if bucket name already exists for this user
  const existing = await query(
    'SELECT id FROM buckets WHERE user_id = $1 AND name = $2',
    [userId, name]
  );

  if (existing.rows.length > 0) {
    return errorResponse(res, 'A bucket with this name already exists', 400);
  }

  // Create bucket
  const result = await query(
    `INSERT INTO buckets (user_id, name, slug, visibility, description, region)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, name, slug, visibility, description, region]
  );

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
    [userId, 'bucket_created', 'bucket', result.rows[0].id]
  );

  successResponse(res, result.rows[0], 'Bucket created successfully', 201);
});

// Get all buckets for user
export const getBuckets = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, search = '' } = req.query;
  const { limit: limitNum, offset } = paginate(page, limit);

  let queryText = `
    SELECT b.*, 
           COUNT(f.id) as file_count,
           COALESCE(SUM(f.size), 0) as total_size
    FROM buckets b
    LEFT JOIN files f ON b.id = f.bucket_id AND f.deleted_at IS NULL
    WHERE b.user_id = $1
  `;

  const params = [userId];

  if (search) {
    queryText += ' AND (b.name ILIKE $2 OR b.description ILIKE $2)';
    params.push(`%${search}%`);
  }

  queryText += `
    GROUP BY b.id
    ORDER BY b.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(limitNum, offset);

  const result = await query(queryText, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM buckets WHERE user_id = $1';
  const countParams = [userId];

  if (search) {
    countQuery += ' AND (name ILIKE $2 OR description ILIKE $2)';
    countParams.push(`%${search}%`);
  }

  const countResult = await query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);

  successResponse(res, {
    buckets: result.rows,
    pagination: getPaginationMeta(total, page, limit)
  });
});

// Get single bucket
export const getBucket = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;

  const result = await query(
    `SELECT b.*, 
            COUNT(f.id) as file_count,
            COALESCE(SUM(f.size), 0) as total_size
     FROM buckets b
     LEFT JOIN files f ON b.id = f.bucket_id AND f.deleted_at IS NULL
     WHERE b.id = $1 AND b.user_id = $2
     GROUP BY b.id`,
    [bucketId, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  successResponse(res, result.rows[0]);
});

// Update bucket
export const updateBucket = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;
  const { name, visibility, description, corsEnabled, corsOrigins } = req.body;

  // Check if bucket exists and belongs to user
  const existing = await query(
    'SELECT * FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (existing.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  // Build update query dynamically
  const updates = [];
  const params = [bucketId, userId];
  let paramIndex = 3;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    params.push(name);
  }
  if (visibility !== undefined) {
    updates.push(`visibility = $${paramIndex++}`);
    params.push(visibility);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    params.push(description);
  }
  if (corsEnabled !== undefined) {
    updates.push(`cors_enabled = $${paramIndex++}`);
    params.push(corsEnabled);
  }
  if (corsOrigins !== undefined) {
    updates.push(`cors_origins = $${paramIndex++}`);
    params.push(corsOrigins);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  const result = await query(
    `UPDATE buckets SET ${updates.join(', ')} 
     WHERE id = $1 AND user_id = $2 
     RETURNING *`,
    params
  );

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
    [userId, 'bucket_updated', 'bucket', bucketId]
  );

  successResponse(res, result.rows[0], 'Bucket updated successfully');
});

// Delete bucket (only if empty - safety check)
export const deleteBucket = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;
  const { force = false } = req.query; // Optional force parameter

  await transaction(async (client) => {
    // Check if bucket exists
    const bucketResult = await client.query(
      'SELECT * FROM buckets WHERE id = $1 AND user_id = $2',
      [bucketId, userId]
    );

    if (bucketResult.rows.length === 0) {
      throw new Error('Bucket not found');
    }

    // Safety check: Count active files in bucket
    const fileCountResult = await client.query(
      'SELECT COUNT(*) as count FROM files WHERE bucket_id = $1 AND deleted_at IS NULL',
      [bucketId]
    );

    const fileCount = parseInt(fileCountResult.rows[0].count);

    // If bucket has files and force is not true, reject the deletion
    if (fileCount > 0 && force !== 'true') {
      throw new Error(`Cannot delete bucket with ${fileCount} file(s). Please delete all files first or use force=true parameter.`);
    }

    // If force is true, soft delete all files in bucket first
    if (force === 'true' && fileCount > 0) {
      await client.query(
        'UPDATE files SET deleted_at = CURRENT_TIMESTAMP WHERE bucket_id = $1',
        [bucketId]
      );
    }

    // Delete bucket
    await client.query('DELETE FROM buckets WHERE id = $1', [bucketId]);

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'bucket_deleted', 'bucket', bucketId, { force, fileCount }]
    );
  });

  successResponse(res, null, 'Bucket deleted successfully');
});

// Get bucket statistics
export const getBucketStats = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;

  // Verify bucket ownership
  const bucket = await query(
    'SELECT id FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucket.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  // Get statistics
  const stats = await query(
    `SELECT 
       COUNT(*) as total_files,
       COALESCE(SUM(size), 0) as total_size,
       COALESCE(SUM(downloads), 0) as total_downloads,
       COUNT(DISTINCT DATE(created_at)) as active_days
     FROM files 
     WHERE bucket_id = $1 AND deleted_at IS NULL`,
    [bucketId]
  );

  // Get file type distribution
  const typeDistribution = await query(
    `SELECT 
       mime_type,
       COUNT(*) as count,
       SUM(size) as size
     FROM files 
     WHERE bucket_id = $1 AND deleted_at IS NULL
     GROUP BY mime_type
     ORDER BY count DESC
     LIMIT 10`,
    [bucketId]
  );

  successResponse(res, {
    ...stats.rows[0],
    typeDistribution: typeDistribution.rows
  });
});
