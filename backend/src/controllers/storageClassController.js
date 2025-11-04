import { query, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/validator.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

// 1. GET ALL STORAGE CLASSES
export const getStorageClasses = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, name, display_name, description, cost_per_gb_month, 
            retrieval_cost_per_gb, retrieval_time, minimum_storage_days
     FROM storage_classes
     WHERE is_active = true
     ORDER BY cost_per_gb_month DESC`
  );

  successResponse(res, {
    storageClasses: result.rows,
    count: result.rows.length
  });
});

// 2. CHANGE FILE STORAGE CLASS
export const changeFileStorageClass = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { storageClass } = req.body;
  const userId = req.user.id;

  // Validate storage class exists
  const classResult = await query(
    'SELECT name FROM storage_classes WHERE name = $1 AND is_active = true',
    [storageClass]
  );

  if (classResult.rows.length === 0) {
    return errorResponse(res, `Invalid storage class: ${storageClass}`, 400);
  }

  await transaction(async (client) => {
    // Get file and verify ownership
    const fileResult = await client.query(
      `SELECT f.*, b.user_id
       FROM files f
       JOIN buckets b ON f.bucket_id = b.id
       WHERE f.id = $1 AND b.user_id = $2 AND f.deleted_at IS NULL`,
      [fileId, userId]
    );

    if (fileResult.rows.length === 0) {
      throw new Error('File not found');
    }

    const file = fileResult.rows[0];
    const oldClass = file.storage_class || 'STANDARD';

    if (oldClass === storageClass) {
      throw new Error(`File is already in ${storageClass} storage class`);
    }

    // Update file storage class
    await client.query(
      'UPDATE files SET storage_class = $2, updated_at = NOW() WHERE id = $1',
      [fileId, storageClass]
    );

    // Log transition
    await client.query(
      `INSERT INTO storage_class_transitions (file_id, from_class, to_class, reason)
       VALUES ($1, $2, $3, $4)`,
      [fileId, oldClass, storageClass, 'manual']
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'storage_class_changed', 'file', fileId, { from: oldClass, to: storageClass }]
    );
  });

  successResponse(res, {
    fileId,
    storageClass,
    message: `Storage class changed to ${storageClass}`
  });
});

// 3. GET BUCKET DEFAULT STORAGE CLASS
export const getBucketStorageClass = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;

  const result = await query(
    'SELECT default_storage_class FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  successResponse(res, {
    bucketId,
    defaultStorageClass: result.rows[0].default_storage_class || 'STANDARD'
  });
});

// 4. SET BUCKET DEFAULT STORAGE CLASS
export const setBucketStorageClass = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const { storageClass } = req.body;
  const userId = req.user.id;

  // Validate storage class
  const classResult = await query(
    'SELECT name FROM storage_classes WHERE name = $1 AND is_active = true',
    [storageClass]
  );

  if (classResult.rows.length === 0) {
    return errorResponse(res, `Invalid storage class: ${storageClass}`, 400);
  }

  // Verify bucket ownership and update
  const result = await query(
    `UPDATE buckets
     SET default_storage_class = $2, updated_at = NOW()
     WHERE id = $1 AND user_id = $3
     RETURNING *`,
    [bucketId, storageClass, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
    [userId, 'bucket_storage_class_changed', 'bucket', bucketId, { storageClass }]
  );

  successResponse(res, {
    bucketId,
    defaultStorageClass: storageClass,
    message: `Bucket default storage class set to ${storageClass}`
  });
});

// 5. GET FILE STORAGE CLASS HISTORY
export const getFileStorageClassHistory = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.id;

  // Verify file ownership
  const fileResult = await query(
    `SELECT f.id FROM files f
     JOIN buckets b ON f.bucket_id = b.id
     WHERE f.id = $1 AND b.user_id = $2`,
    [fileId, userId]
  );

  if (fileResult.rows.length === 0) {
    return errorResponse(res, 'File not found', 404);
  }

  // Get transition history
  const result = await query(
    `SELECT from_class, to_class, reason, transitioned_at
     FROM storage_class_transitions
     WHERE file_id = $1
     ORDER BY transitioned_at DESC`,
    [fileId]
  );

  successResponse(res, {
    fileId,
    transitions: result.rows,
    count: result.rows.length
  });
});

// 6. GET STORAGE CLASS ANALYTICS (for a bucket)
export const getStorageClassAnalytics = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;

  // Verify bucket ownership
  const bucketResult = await query(
    'SELECT id FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucketResult.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  // Get analytics
  const result = await query(
    `SELECT 
       storage_class,
       COUNT(*) as file_count,
       SUM(size) as total_size,
       AVG(size) as avg_size,
       MAX(size) as max_size,
       MIN(size) as min_size
     FROM files
     WHERE bucket_id = $1 AND deleted_at IS NULL
     GROUP BY storage_class
     ORDER BY total_size DESC`,
    [bucketId]
  );

  // Calculate costs
  const analytics = await Promise.all(result.rows.map(async (row) => {
    const classInfo = await query(
      'SELECT cost_per_gb_month, retrieval_cost_per_gb FROM storage_classes WHERE name = $1',
      [row.storage_class || 'STANDARD']
    );

    const sizeGB = parseInt(row.total_size) / (1024 * 1024 * 1024);
    const monthlyCost = sizeGB * parseFloat(classInfo.rows[0]?.cost_per_gb_month || 0.01);

    return {
      storageClass: row.storage_class || 'STANDARD',
      fileCount: parseInt(row.file_count),
      totalSize: parseInt(row.total_size),
      totalSizeGB: sizeGB.toFixed(2),
      avgSize: parseInt(row.avg_size),
      maxSize: parseInt(row.max_size),
      minSize: parseInt(row.min_size),
      estimatedMonthlyCost: monthlyCost.toFixed(4)
    };
  }));

  successResponse(res, {
    bucketId,
    analytics,
    totalFiles: analytics.reduce((sum, a) => sum + a.fileCount, 0),
    totalCost: analytics.reduce((sum, a) => sum + parseFloat(a.estimatedMonthlyCost), 0).toFixed(4)
  });
});
