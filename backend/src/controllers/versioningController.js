import crypto from 'crypto';
import { query, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/validator.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { deleteFromB2 } from '../services/b2Service.js';
import logger from '../utils/logger.js';

// 1. ENABLE/SUSPEND VERSIONING
export const putBucketVersioning = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;
  const { status, mfaDelete = false } = req.body;

  if (!['Enabled', 'Suspended'].includes(status)) {
    return errorResponse(res, 'Status must be "Enabled" or "Suspended"', 400);
  }

  // Check plan supports versioning
  const planResult = await query(
    `SELECT p.versioning_allowed FROM users u
     JOIN plans p ON u.plan_id = p.id
     WHERE u.id = $1`,
    [userId]
  );

  if (!planResult.rows[0]?.versioning_allowed && status === 'Enabled') {
    return errorResponse(
      res,
      'Versioning is not available in your plan. Please upgrade to Pro or Pay-As-You-Go.',
      403
    );
  }

  // Verify bucket ownership
  const bucketResult = await query(
    'SELECT id FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucketResult.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  // Update bucket
  const result = await query(
    `UPDATE buckets
     SET versioning_enabled = $2, versioning_mfa_delete = $3
     WHERE id = $1
     RETURNING *`,
    [bucketId, status === 'Enabled', mfaDelete]
  );

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
    [userId, 'versioning_changed', 'bucket', bucketId, JSON.stringify({ status, mfaDelete })]
  );

  successResponse(res, {
    bucketId: bucketId,
    versioningEnabled: result.rows[0].versioning_enabled,
    mfaDelete: result.rows[0].versioning_mfa_delete
  }, `Versioning ${status.toLowerCase()}`);
});

// 2. GET VERSIONING STATUS
export const getBucketVersioning = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;

  const result = await query(
    'SELECT versioning_enabled, versioning_mfa_delete FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  successResponse(res, {
    status: result.rows[0].versioning_enabled ? 'Enabled' : 'Suspended',
    mfaDelete: result.rows[0].versioning_mfa_delete || false
  });
});

// 3. LIST OBJECT VERSIONS
export const listObjectVersions = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;
  const { prefix = '', maxKeys = 1000, keyMarker, versionIdMarker } = req.query;

  // Verify bucket ownership
  const bucketResult = await query(
    'SELECT id FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucketResult.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  let queryText = `
    SELECT 
      id, filename, version_id, size, mime_type, is_latest, is_delete_marker,
      created_at, updated_at, metadata, tags, storage_class
    FROM files
    WHERE bucket_id = $1 AND deleted_at IS NULL
  `;

  const params = [bucketId];
  let paramCount = 1;

  if (prefix) {
    paramCount++;
    queryText += ` AND filename LIKE $${paramCount}`;
    params.push(prefix + '%');
  }

  if (keyMarker && versionIdMarker) {
    paramCount += 2;
    queryText += ` AND (filename, version_id) > ($${paramCount - 1}, $${paramCount})`;
    params.push(keyMarker, versionIdMarker);
  }

  queryText += ` ORDER BY filename, created_at DESC LIMIT $${paramCount + 1}`;
  params.push(parseInt(maxKeys));

  const result = await query(queryText, params);

  // Group by filename
  const versions = {};
  const deleteMarkers = [];

  result.rows.forEach(row => {
    if (row.is_delete_marker) {
      deleteMarkers.push({
        key: row.filename,
        versionId: row.version_id,
        isLatest: row.is_latest,
        lastModified: row.created_at
      });
    } else {
      if (!versions[row.filename]) {
        versions[row.filename] = [];
      }
      versions[row.filename].push({
        id: row.id,
        versionId: row.version_id,
        isLatest: row.is_latest,
        size: row.size,
        mimeType: row.mime_type,
        storageClass: row.storage_class || 'STANDARD',
        metadata: row.metadata,
        tags: row.tags,
        lastModified: row.created_at
      });
    }
  });

  successResponse(res, {
    bucketId: bucketId,
    prefix,
    versions,
    deleteMarkers,
    isTruncated: result.rows.length >= maxKeys,
    nextKeyMarker: result.rows.length > 0 ? result.rows[result.rows.length - 1].filename : null,
    nextVersionIdMarker: result.rows.length > 0 ? result.rows[result.rows.length - 1].version_id : null
  });
});

// 4. GET SPECIFIC VERSION
export const getObjectVersion = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { versionId } = req.query;
  const userId = req.user.id;

  let queryText = `
    SELECT f.*, b.user_id
    FROM files f
    JOIN buckets b ON f.bucket_id = b.id
    WHERE f.id = $1 AND b.user_id = $2 AND f.deleted_at IS NULL
  `;

  const params = [fileId, userId];

  if (versionId) {
    queryText += ' AND f.version_id = $3';
    params.push(versionId);
  }

  const result = await query(queryText, params);

  if (result.rows.length === 0) {
    return errorResponse(res, 'Version not found', 404);
  }

  successResponse(res, result.rows[0]);
});

// 5. DELETE SPECIFIC VERSION
export const deleteObjectVersion = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { versionId } = req.query;
  const userId = req.user.id;

  if (!versionId) {
    return errorResponse(res, 'versionId query parameter is required', 400);
  }

  await transaction(async (client) => {
    // Get file
    const fileResult = await client.query(
      `SELECT f.*, b.versioning_enabled, b.user_id
       FROM files f
       JOIN buckets b ON f.bucket_id = b.id
       WHERE f.id = $1 AND f.version_id = $2 AND b.user_id = $3 AND f.deleted_at IS NULL`,
      [fileId, versionId, userId]
    );

    if (fileResult.rows.length === 0) {
      throw new Error('Version not found');
    }

    const file = fileResult.rows[0];

    // Delete from B2
      if (file.b2_file_id) {
      try {
        await deleteFromB2(file.b2_file_id, file.file_path);
      } catch (error) {
        logger.error('Error deleting from B2:', error);
        // Continue anyway - might already be deleted
      }
    }

    // Permanently delete this version
    await client.query(
      'UPDATE files SET deleted_at = NOW() WHERE id = $1 AND version_id = $2',
      [fileId, versionId]
    );

    // If this was the latest version, mark the next version as latest
    if (file.is_latest) {
      const nextVersionResult = await client.query(
        `UPDATE files
         SET is_latest = true
         WHERE bucket_id = $1 AND filename = $2 AND version_id != $3 AND deleted_at IS NULL
         AND id = (
           SELECT id FROM files
           WHERE bucket_id = $1 AND filename = $2 AND version_id != $3 AND deleted_at IS NULL
           ORDER BY created_at DESC
           LIMIT 1
         )
         RETURNING id`,
        [file.bucket_id, file.filename, versionId]
      );
    }

    // Update usage
    await client.query(
      `UPDATE usage
       SET storage_used = GREATEST(0, storage_used - $2),
           files_count = GREATEST(0, files_count - 1)
       WHERE user_id = $1`,
      [userId, file.size]
    );
  });

  successResponse(res, { deleted: true, versionId }, 'Version deleted permanently');
});

// 6. RESTORE OBJECT VERSION
export const restoreObjectVersion = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { versionId } = req.body;
  const userId = req.user.id;

  if (!versionId) {
    return errorResponse(res, 'versionId is required in request body', 400);
  }

  const result = await transaction(async (client) => {
    // Get the version to restore
    const versionResult = await client.query(
      `SELECT f.*, b.versioning_enabled
       FROM files f
       JOIN buckets b ON f.bucket_id = b.id
       WHERE f.id = $1 AND f.version_id = $2 AND b.user_id = $3 AND f.deleted_at IS NULL`,
      [fileId, versionId, userId]
    );

    if (versionResult.rows.length === 0) {
      throw new Error('Version not found');
    }

    const oldVersion = versionResult.rows[0];

    if (!oldVersion.versioning_enabled) {
      throw new Error('Versioning is not enabled for this bucket');
    }

    // Mark current latest as not latest
    await client.query(
      `UPDATE files
       SET is_latest = false
       WHERE bucket_id = $1 AND filename = $2 AND is_latest = true AND deleted_at IS NULL`,
      [oldVersion.bucket_id, oldVersion.filename]
    );

    // Create new version (copy of old version)
    const newVersionId = crypto.randomUUID();

    const newFileResult = await client.query(
      `INSERT INTO files
       (user_id, bucket_id, filename, original_filename, file_path, size, mime_type,
        is_public, url, cdn_url, metadata, tags, version_id, is_latest, b2_file_id, storage_class)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, $15)
       RETURNING *`,
      [
        userId, oldVersion.bucket_id, oldVersion.filename, oldVersion.original_filename,
        oldVersion.file_path, oldVersion.size, oldVersion.mime_type, oldVersion.is_public,
        oldVersion.url, oldVersion.cdn_url, oldVersion.metadata, oldVersion.tags,
        newVersionId, oldVersion.b2_file_id, oldVersion.storage_class || 'STANDARD'
      ]
    );

    // Update usage (add new version)
    await client.query(
      `INSERT INTO usage (user_id, storage_used, files_count)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id)
       DO UPDATE SET
         storage_used = usage.storage_used + $2,
         files_count = usage.files_count + 1`,
      [userId, oldVersion.size]
    );

    return newFileResult.rows[0];
  });

  successResponse(res, result, 'Version restored successfully');
});

// HELPER: Create new version on upload (called from fileController)
export const createNewVersion = async (client, bucketId, filename) => {
  // Check if versioning enabled
  const bucketResult = await client.query(
    'SELECT versioning_enabled FROM buckets WHERE id = $1',
    [bucketId]
  );

  const versioningEnabled = bucketResult.rows[0]?.versioning_enabled;

  if (versioningEnabled) {
    // Mark existing file as not latest
    await client.query(
      `UPDATE files
       SET is_latest = false
       WHERE bucket_id = $1 AND filename = $2 AND is_latest = true AND deleted_at IS NULL`,
      [bucketId, filename]
    );

    // New file will have new version_id
    return crypto.randomUUID();
  }

  // If versioning not enabled, overwrite (version_id = 'null')
  return 'null';
};
