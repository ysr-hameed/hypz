import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { generateUniqueFilename, formatBytes, successResponse, errorResponse, paginate, getPaginationMeta } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';
import { uploadToB2, deleteFromB2, isB2Available } from '../services/b2Service.js';
import config from '../config/config.js';

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage for B2

export const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    // Add custom file validation here if needed
    cb(null, true);
  }
});

// Upload file
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No file uploaded', 400);
  }

  const { bucketId } = req.params;
  const userId = req.user.id;
  const { tags = [], metadata = {} } = req.body;

  // Reject if isPublic parameter is sent
  if (req.body.isPublic !== undefined) {
    return errorResponse(
      res, 
      'The isPublic parameter is not supported. File visibility is automatically inherited from the bucket. Upload to a public bucket to make files public.', 
      400
    );
  }

  // Get user's plan to check file size limit
  const userPlanResult = await query(
    `SELECT p.* FROM users u
     JOIN plans p ON u.plan_id = p.id
     WHERE u.id = $1`,
    [userId]
  );

  if (userPlanResult.rows.length === 0) {
    return errorResponse(res, 'User plan not found', 404);
  }

  const plan = userPlanResult.rows[0];

  // Check file size limit (0 or null means unlimited)
  if (plan.max_file_size_mb > 0) {
    const fileSizeMB = req.file.size / (1024 * 1024);
    if (fileSizeMB > plan.max_file_size_mb) {
      return errorResponse(
        res,
        `File size (${fileSizeMB.toFixed(2)}MB) exceeds your plan limit of ${plan.max_file_size_mb}MB. Please upgrade your plan to upload larger files.`,
        413
      );
    }
  }

  // Verify bucket ownership
  const bucket = await query(
    'SELECT id, name, visibility FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucket.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  const bucketVisibility = bucket.rows[0].visibility;
  const isPublicBucket = bucketVisibility === 'public';
  
  // File's isPublic flag MUST match bucket visibility
  // This ensures consistency between B2 storage location and database
  const isPublic = isPublicBucket;

  let fileUrl, cdnUrl, filePath, b2FileId;

  try {
    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(req.file.originalname);

    if (isB2Available()) {
      // Upload to Backblaze B2 (public or private bucket based on bucket visibility)
      const b2Path = `${userId}/${bucketId}/${uniqueFilename}`;
      const uploadResult = await uploadToB2(req.file.buffer, b2Path, req.file.mimetype, isPublicBucket);
      
      fileUrl = uploadResult.url;
      cdnUrl = uploadResult.url;
      filePath = b2Path;
      b2FileId = uploadResult.fileId;
    } else {
      // Fallback to local storage
      const uploadDir = path.join(config.UPLOAD_DIR, userId);
      await fs.mkdir(uploadDir, { recursive: true });
      
      filePath = path.join(uploadDir, uniqueFilename);
      await fs.writeFile(filePath, req.file.buffer);
      
      fileUrl = `/uploads/${userId}/${uniqueFilename}`;
      cdnUrl = `${config.FRONTEND_URL}/cdn${fileUrl}`;
    }

    // Use a transaction for database operations to speed things up
    // const client = await query('BEGIN');  // Removed broken transaction
    
    // try {
      // Store file info in database
      const result = await query(
        `INSERT INTO files (
          bucket_id, user_id, filename, original_name, path, size,
          mime_type, extension, url, cdn_url, is_public, tags, metadata, b2_file_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          bucketId,
          userId,
          uniqueFilename,
          req.file.originalname,
          filePath,
          req.file.size,
          req.file.mimetype,
          path.extname(req.file.originalname),
          fileUrl,
          cdnUrl,
          isPublic,
          Array.isArray(tags) ? tags : [],
          typeof metadata === 'object' ? metadata : {},
          b2FileId || null
        ]
      );

      // Update usage
      await query(
        `INSERT INTO usage_records (user_id, date, storage_bytes, upload_bytes, upload_calls, api_calls)
         VALUES ($1, CURRENT_DATE, $2, $2, 1, 1)
         ON CONFLICT (user_id, date)
         DO UPDATE SET 
           storage_bytes = usage_records.storage_bytes + $2,
           upload_bytes = usage_records.upload_bytes + $2,
           upload_calls = usage_records.upload_calls + 1,
           api_calls = usage_records.api_calls + 1,
           bandwidth_bytes = usage_records.bandwidth_bytes + $2,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, req.file.size]
      );

      // Log activity (non-blocking - we can make this async)
      query(
        'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
        [userId, 'file_uploaded', 'file', result.rows[0].id, { filename: req.file.originalname, size: req.file.size }]
      ).catch(err => console.error('Activity log error:', err));

      // await query('COMMIT');  // Removed broken transaction

      successResponse(res, {
        ...result.rows[0],
        formattedSize: formatBytes(result.rows[0].size)
      }, 'File uploaded successfully', 201);
    // } catch (dbError) {
    //   await query('ROLLBACK');
    //   throw dbError;
    // }
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse(res, 'Failed to upload file: ' + error.message, 500);
  }
});

// Get files in bucket
export const getFiles = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;
  const { page = 1, limit = 20, search = '', sortBy = 'created_at', order = 'DESC' } = req.query;
  const { limit: limitNum, offset } = paginate(page, limit);

  // Verify bucket ownership
  const bucket = await query(
    'SELECT id FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucket.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  let queryText = `
    SELECT * FROM files
    WHERE bucket_id = $1 AND deleted_at IS NULL
  `;
  const params = [bucketId];

  if (search) {
    queryText += ' AND (filename ILIKE $2 OR original_name ILIKE $2)';
    params.push(`%${search}%`);
  }

  // Validate sortBy to prevent SQL injection
  const validSortColumns = ['created_at', 'filename', 'size', 'downloads'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  queryText += `
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(limitNum, offset);

  const result = await query(queryText, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM files WHERE bucket_id = $1 AND deleted_at IS NULL';
  const countParams = [bucketId];

  if (search) {
    countQuery += ' AND (filename ILIKE $2 OR original_name ILIKE $2)';
    countParams.push(`%${search}%`);
  }

  const countResult = await query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);

  // Track list API call
  await query(
    `INSERT INTO usage_records (user_id, date, list_calls, api_calls)
     VALUES ($1, CURRENT_DATE, 1, 1)
     ON CONFLICT (user_id, date)
     DO UPDATE SET 
       list_calls = usage_records.list_calls + 1,
       api_calls = usage_records.api_calls + 1,
       updated_at = CURRENT_TIMESTAMP`,
    [userId]
  );

  successResponse(res, {
    files: result.rows.map(file => ({
      ...file,
      formattedSize: formatBytes(file.size)
    })),
    pagination: getPaginationMeta(total, page, limit)
  });
});

// Get single file
export const getFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.id;

  const result = await query(
    `SELECT f.*, b.name as bucket_name 
     FROM files f
     JOIN buckets b ON f.bucket_id = b.id
     WHERE f.id = $1 AND f.user_id = $2 AND f.deleted_at IS NULL`,
    [fileId, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'File not found', 404);
  }

  successResponse(res, {
    ...result.rows[0],
    formattedSize: formatBytes(result.rows[0].size)
  });
});

// Download file
export const downloadFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.id;

  const result = await query(
    `SELECT f.*, b.visibility as bucket_visibility
     FROM files f
     JOIN buckets b ON f.bucket_id = b.id
     WHERE f.id = $1 AND f.user_id = $2 AND f.deleted_at IS NULL`,
    [fileId, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'File not found', 404);
  }

  const file = result.rows[0];
  console.log('Download request for file:', {
    id: file.id,
    path: file.path,
    url: file.url,
    b2_file_id: file.b2_file_id,
    is_public: file.is_public
  });

  // Increment download counter (non-blocking)
  query('UPDATE files SET downloads = downloads + 1 WHERE id = $1', [fileId])
    .catch(err => console.error('Failed to update download count:', err));

  // Update bandwidth usage (non-blocking; conservative if size unknown later)
  query(
    `INSERT INTO usage_records (user_id, date, bandwidth_bytes, download_bytes, download_calls, api_calls)
     VALUES ($1, $2, $3, $3, 1, 1)
     ON CONFLICT (user_id, date)
     DO UPDATE SET 
       bandwidth_bytes = usage_records.bandwidth_bytes + EXCLUDED.bandwidth_bytes,
       download_bytes = usage_records.download_bytes + EXCLUDED.download_bytes,
       download_calls = usage_records.download_calls + 1,
       api_calls = usage_records.api_calls + 1,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, new Date().toISOString().slice(0, 10), file.size || 0]
  ).catch(err => console.error('Failed to update usage:', err));

  // If stored in Backblaze B2, stream or redirect appropriately
  if (file.b2_file_id || (file.url && file.url.includes('/file/'))) {
    try {
      // Determine bucket name from bucket visibility
      const { downloadFromB2 } = await import('../services/b2Service.js');
      const bucketName = file.bucket_visibility === 'public' ? config.B2_PUBLIC_BUCKET_NAME : config.B2_PRIVATE_BUCKET_NAME;
      const data = await downloadFromB2(file.path, bucketName);

      // Set headers and send
      res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);

      if (data && typeof data.pipe === 'function') {
        return data.pipe(res);
      }
      return res.send(data);
    } catch (err) {
      console.error('B2 download failed, falling back:', err);
      // If B2 streaming fails but URL exists, try redirect as last resort
      if (file.url) {
        return res.redirect(file.url);
      }
      return errorResponse(res, 'File not available', 404);
    }
  }

  // Local storage path
  try {
    await fs.access(file.path);
    return res.download(file.path, file.original_name);
  } catch (error) {
    console.error('Local download failed:', error?.message || error);
    return errorResponse(res, 'File not found on server', 404);
  }
});

// Generate time-limited signed download URL for private files (max 7 days)
export const createSignedUrl = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.id;
  const MAX_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days (604800 seconds)
  const DEFAULT_EXPIRY_SECONDS = 3600; // 1 hour
  
  // Check if user's plan allows signed URLs
  const userPlanResult = await query(
    `SELECT p.* FROM users u
     JOIN plans p ON u.plan_id = p.id
     WHERE u.id = $1`,
    [userId]
  );

  if (userPlanResult.rows.length === 0) {
    return errorResponse(res, 'User plan not found', 404);
  }

  const plan = userPlanResult.rows[0];

  if (!plan.signed_urls_enabled) {
    return errorResponse(
      res,
      `Signed URLs are not available on your plan (${plan.name}). Please upgrade to Pro or Pay-As-You-Go plan to use this feature.`,
      403
    );
  }
  
  let { expiresIn } = req.body;
  let seconds = parseInt(expiresIn || DEFAULT_EXPIRY_SECONDS, 10);
  
  // Validate expiry time
  if (Number.isNaN(seconds) || seconds <= 0) {
    seconds = DEFAULT_EXPIRY_SECONDS;
  }
  
  // Enforce max 7-day limit
  if (seconds > MAX_EXPIRY_SECONDS) {
    seconds = MAX_EXPIRY_SECONDS;
  }

  const result = await query(
    `SELECT f.id, f.user_id, f.is_public, b.visibility as bucket_visibility
     FROM files f
     JOIN buckets b ON f.bucket_id = b.id
     WHERE f.id = $1 AND f.user_id = $2 AND f.deleted_at IS NULL`,
    [fileId, userId],
    { cache: true, cacheTTL: 30000 }
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'File not found', 404);
  }

  const file = result.rows[0];
  
  // Generate signed URL
  const payload = { t: 'file', fid: fileId, uid: userId };
  const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: seconds });
  const origin = `${req.protocol}://${req.get('host')}`;
  const url = `${origin}/api/${config.API_VERSION}/files/file/${fileId}/download-signed?token=${token}`;
  const expiresAt = new Date(Date.now() + seconds * 1000).toISOString();

  return successResponse(res, { 
    url, 
    expiresAt, 
    expiresIn: seconds,
    maxExpiresIn: MAX_EXPIRY_SECONDS,
    isPrivate: !file.is_public,
    note: seconds === MAX_EXPIRY_SECONDS ? 'Maximum expiry time (7 days) applied' : null
  }, 'Signed URL generated successfully');
});

// Download via signed token (no auth header required)
export const downloadFileSigned = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { fileToken } = req; // set by authenticateFileToken
  if (!fileToken || fileToken.fid !== fileId) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }

  // Ensure file still exists and belongs to token user
  const result = await query(
    `SELECT f.*, b.visibility as bucket_visibility
     FROM files f
     JOIN buckets b ON f.bucket_id = b.id
     WHERE f.id = $1 AND f.user_id = $2 AND f.deleted_at IS NULL`,
    [fileId, fileToken.uid]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'File not found', 404);
  }

  const file = result.rows[0];

  // Non-blocking metrics
  query('UPDATE files SET downloads = downloads + 1 WHERE id = $1', [fileId])
    .catch(err => console.error('Failed to update download count:', err));
  query(
    `INSERT INTO usage_records (user_id, date, bandwidth_bytes, download_bytes, download_calls, api_calls)
     VALUES ($1, CURRENT_DATE, $2, $2, 1, 1)
     ON CONFLICT (user_id, date)
     DO UPDATE SET 
       bandwidth_bytes = usage_records.bandwidth_bytes + $2,
       download_bytes = usage_records.download_bytes + $2,
       download_calls = usage_records.download_calls + 1,
       api_calls = usage_records.api_calls + 1,
       updated_at = CURRENT_TIMESTAMP`,
    [file.user_id, file.size || 0]
  ).catch(err => console.error('Failed to update usage:', err));

  // B2 or local
  if (file.b2_file_id || (file.url && file.url.includes('/file/'))) {
    try {
      const { downloadFromB2 } = await import('../services/b2Service.js');
      const bucketName = file.bucket_visibility === 'public' ? config.B2_PUBLIC_BUCKET_NAME : config.B2_PRIVATE_BUCKET_NAME;
      const data = await downloadFromB2(file.path, bucketName);
      res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
      if (data && typeof data.pipe === 'function') {
        return data.pipe(res);
      }
      return res.send(data);
    } catch (err) {
      console.error('B2 download-signed failed:', err);
      if (file.url) return res.redirect(file.url);
      return errorResponse(res, 'File not available', 404);
    }
  }

  try {
    await fs.access(file.path);
    return res.download(file.path, file.original_name);
  } catch (e) {
    return errorResponse(res, 'File not found on server', 404);
  }
});

// Delete file
export const deleteFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.id;

  const result = await query(
    'SELECT * FROM files WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [fileId, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'File not found', 404);
  }

  const file = result.rows[0];

  // Soft delete
  await query(
    'UPDATE files SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
    [fileId]
  );

  // Update usage (reduce storage) - using GREATEST to prevent negative values
  await query(
    `INSERT INTO usage_records (user_id, date, storage_bytes, delete_calls, api_calls)
     VALUES ($1, CURRENT_DATE, 0, 1, 1)
     ON CONFLICT (user_id, date)
     DO UPDATE SET 
       storage_bytes = GREATEST(usage_records.storage_bytes - $2, 0),
       delete_calls = usage_records.delete_calls + 1,
       api_calls = usage_records.api_calls + 1,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, file.size]
  );

  // Delete from B2 or local storage
  try {
    if (file.b2_file_id) {
      // Delete from Backblaze B2
      await deleteFromB2(file.b2_file_id, file.path);
    } else if (file.path && !file.path.startsWith('http')) {
      // Delete from local storage
      await fs.unlink(file.path);
    }
  } catch (error) {
    console.error('Failed to delete physical file:', error);
    // Continue anyway as database record is already deleted
  }

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
    [userId, 'file_deleted', 'file', fileId]
  );

  successResponse(res, null, 'File deleted successfully');
});

// Update file metadata
export const updateFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.id;
  const { isPublic, tags, metadata } = req.body;

  // Reject if isPublic parameter is sent
  if (isPublic !== undefined) {
    return errorResponse(
      res,
      'Cannot change file visibility. File visibility is automatically inherited from the bucket. Move the file to a different bucket type to change visibility.',
      400
    );
  }

  const updates = [];
  const params = [fileId, userId];
  let paramIndex = 3;

  if (tags !== undefined) {
    updates.push(`tags = $${paramIndex++}`);
    params.push(Array.isArray(tags) ? tags : []);
  }
  if (metadata !== undefined) {
    updates.push(`metadata = $${paramIndex++}`);
    params.push(typeof metadata === 'object' ? metadata : {});
  }

  if (updates.length === 0) {
    return errorResponse(res, 'No fields to update', 400);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  const result = await query(
    `UPDATE files SET ${updates.join(', ')} 
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
     RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'File not found', 404);
  }

  successResponse(res, result.rows[0], 'File updated successfully');
});

// Public download (for files in public buckets)
export const publicDownloadFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  // Get file with bucket info
  const result = await query(
    `SELECT f.*, b.visibility as bucket_visibility
     FROM files f
     JOIN buckets b ON f.bucket_id = b.id
     WHERE f.id = $1 AND f.deleted_at IS NULL`,
    [fileId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'File not found', 404);
  }

  const file = result.rows[0];

  // Check if bucket is public
  if (file.bucket_visibility !== 'public') {
    return errorResponse(res, 'This file is private. Authentication required.', 403);
  }

  // Increment download counter
  query(
    'UPDATE files SET downloads = downloads + 1 WHERE id = $1',
    [fileId]
  ).catch(err => console.error('Failed to update download count:', err));

  // Update bandwidth usage (non-blocking)
  query(
    `INSERT INTO usage_records (user_id, date, bandwidth_bytes, download_bytes, download_calls, api_calls)
     VALUES ($1, CURRENT_DATE, $2, $2, 1, 1)
     ON CONFLICT (user_id, date)
     DO UPDATE SET 
       bandwidth_bytes = usage_records.bandwidth_bytes + $2,
       download_bytes = usage_records.download_bytes + $2,
       download_calls = usage_records.download_calls + 1,
       api_calls = usage_records.api_calls + 1,
       updated_at = CURRENT_TIMESTAMP`,
    [file.user_id, file.size]
  ).catch(err => console.error('Failed to update usage:', err));

  // If using Backblaze B2, redirect to B2 URL
  if (file.url) {
    return res.redirect(file.url);
  }

  // Otherwise send from local storage
  try {
    await fs.access(file.path);
    res.download(file.path, file.original_name);
  } catch (error) {
    return errorResponse(res, 'File not found on server', 404);
  }
});

// Bulk delete files
export const bulkDeleteFiles = asyncHandler(async (req, res) => {
  const { fileIds } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    return errorResponse(res, 'fileIds must be a non-empty array', 400);
  }

  if (fileIds.length > 100) {
    return errorResponse(res, 'Cannot delete more than 100 files at once', 400);
  }

  // Fetch all files to be deleted
  const placeholders = fileIds.map((_, i) => `$${i + 2}`).join(', ');
  const result = await query(
    `SELECT * FROM files WHERE id IN (${placeholders}) AND user_id = $1 AND deleted_at IS NULL`,
    [userId, ...fileIds]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'No files found to delete', 404);
  }

  const files = result.rows;
  const totalSize = files.reduce((sum, file) => sum + parseInt(file.size), 0);

  // Soft delete all files
  await query(
    `UPDATE files SET deleted_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders}) AND user_id = $1`,
    [userId, ...fileIds]
  );

  // Update usage
  await query(
    `INSERT INTO usage_records (user_id, date, storage_bytes, delete_calls, api_calls)
     VALUES ($1, CURRENT_DATE, 0, $2, 1)
     ON CONFLICT (user_id, date)
     DO UPDATE SET 
       storage_bytes = GREATEST(usage_records.storage_bytes - $3, 0),
       delete_calls = usage_records.delete_calls + $2,
       api_calls = usage_records.api_calls + 1,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, files.length, totalSize]
  );

  // Delete physical files (non-blocking)
  files.forEach(async (file) => {
    try {
      if (file.b2_file_id) {
        await deleteFromB2(file.b2_file_id, file.path);
      } else if (file.path && !file.path.startsWith('http')) {
        await fs.unlink(file.path);
      }
    } catch (error) {
      console.error('Failed to delete physical file:', file.id, error);
    }
  });

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, details) VALUES ($1, $2, $3, $4)',
    [userId, 'bulk_files_deleted', 'file', { count: files.length, totalSize }]
  );

  successResponse(res, { deletedCount: files.length, totalSize }, 'Files deleted successfully');
});

// Bulk update files
export const bulkUpdateFiles = asyncHandler(async (req, res) => {
  const { fileIds, isPublic, tags, metadata } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    return errorResponse(res, 'fileIds must be a non-empty array', 400);
  }

  if (fileIds.length > 100) {
    return errorResponse(res, 'Cannot update more than 100 files at once', 400);
  }

  // Reject if isPublic parameter is sent
  if (isPublic !== undefined) {
    return errorResponse(
      res,
      'Cannot change file visibility. File visibility is automatically inherited from the bucket.',
      400
    );
  }

  const updates = [];
  const params = [userId];
  let paramIndex = 2;

  if (tags !== undefined) {
    updates.push(`tags = $${paramIndex++}`);
    params.push(Array.isArray(tags) ? tags : []);
  }
  if (metadata !== undefined) {
    updates.push(`metadata = $${paramIndex++}`);
    params.push(typeof metadata === 'object' ? metadata : {});
  }

  if (updates.length === 0) {
    return errorResponse(res, 'No fields to update', 400);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  // Create placeholders for file IDs
  const placeholders = fileIds.map((id, i) => `$${paramIndex + i}`).join(', ');
  params.push(...fileIds);

  const result = await query(
    `UPDATE files SET ${updates.join(', ')} 
     WHERE user_id = $1 AND id IN (${placeholders}) AND deleted_at IS NULL
     RETURNING id`,
    params
  );

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, details) VALUES ($1, $2, $3, $4)',
    [userId, 'bulk_files_updated', 'file', { count: result.rows.length, updates: { isPublic, tags: !!tags, metadata: !!metadata } }]
  );

  successResponse(res, { updatedCount: result.rows.length }, 'Files updated successfully');
});

// Bulk download files (returns array of signed URLs)
export const bulkDownloadFiles = asyncHandler(async (req, res) => {
  const { fileIds } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    return errorResponse(res, 'fileIds must be a non-empty array', 400);
  }

  if (fileIds.length > 50) {
    return errorResponse(res, 'Cannot download more than 50 files at once', 400);
  }

  // Fetch all files
  const placeholders = fileIds.map((_, i) => `$${i + 2}`).join(', ');
  const result = await query(
    `SELECT id, filename, original_name, size, url, cdn_url, mime_type FROM files 
     WHERE id IN (${placeholders}) AND user_id = $1 AND deleted_at IS NULL`,
    [userId, ...fileIds]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'No files found', 404);
  }

  const files = result.rows;
  const totalSize = files.reduce((sum, file) => sum + parseInt(file.size), 0);

  // Generate download tokens for each file
  const downloadUrls = files.map(file => {
    const token = jwt.sign(
      { fileId: file.id, userId, type: 'download' },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      fileId: file.id,
      filename: file.original_name,
      size: file.size,
      mimeType: file.mime_type,
      downloadUrl: `${config.BACKEND_URL}/api/files/${file.id}/download?token=${token}`,
      directUrl: file.cdn_url || file.url
    };
  });

  // Update usage (non-blocking)
  query(
    `INSERT INTO usage_records (user_id, date, bandwidth_bytes, download_bytes, download_calls, api_calls)
     VALUES ($1, CURRENT_DATE, $2, $2, $3, 1)
     ON CONFLICT (user_id, date)
     DO UPDATE SET 
       bandwidth_bytes = usage_records.bandwidth_bytes + $2,
       download_bytes = usage_records.download_bytes + $2,
       download_calls = usage_records.download_calls + $3,
       api_calls = usage_records.api_calls + 1,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, totalSize, files.length]
  ).catch(err => console.error('Failed to update usage:', err));

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, details) VALUES ($1, $2, $3, $4)',
    [userId, 'bulk_files_downloaded', 'file', { count: files.length, totalSize }]
  );

  successResponse(res, { files: downloadUrls, totalSize }, 'Download URLs generated successfully');
});

// Bulk move files to another bucket
export const bulkMoveFiles = asyncHandler(async (req, res) => {
  const { fileIds, targetBucketId } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    return errorResponse(res, 'fileIds must be a non-empty array', 400);
  }

  if (!targetBucketId) {
    return errorResponse(res, 'targetBucketId is required', 400);
  }

  if (fileIds.length > 100) {
    return errorResponse(res, 'Cannot move more than 100 files at once', 400);
  }

  // Verify target bucket ownership
  const targetBucket = await query(
    'SELECT id FROM buckets WHERE id = $1 AND user_id = $2',
    [targetBucketId, userId]
  );

  if (targetBucket.rows.length === 0) {
    return errorResponse(res, 'Target bucket not found', 404);
  }

  // Move files
  const placeholders = fileIds.map((_, i) => `$${i + 3}`).join(', ');
  const result = await query(
    `UPDATE files SET bucket_id = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE user_id = $2 AND id IN (${placeholders}) AND deleted_at IS NULL
     RETURNING id`,
    [targetBucketId, userId, ...fileIds]
  );

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, details) VALUES ($1, $2, $3, $4)',
    [userId, 'bulk_files_moved', 'file', { count: result.rows.length, targetBucketId }]
  );

  successResponse(res, { movedCount: result.rows.length }, 'Files moved successfully');
});

// Bulk upload files
export const bulkUploadFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return errorResponse(res, 'No files uploaded', 400);
  }

  const { bucketId } = req.params;
  const userId = req.user.id;
  
  if (req.files.length > 20) {
    return errorResponse(res, 'Cannot upload more than 20 files at once', 400);
  }

  // Reject if isPublic parameter is sent
  if (req.body.isPublic !== undefined) {
    return errorResponse(
      res,
      'The isPublic parameter is not supported. File visibility is automatically inherited from the bucket.',
      400
    );
  }

  // Verify bucket ownership
  const bucket = await query(
    'SELECT id, name, visibility FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucket.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  const bucketVisibility = bucket.rows[0].visibility;
  const isPublicBucket = bucketVisibility === 'public';
  
  // File visibility MUST match bucket
  const isPublic = isPublicBucket;
  
  const uploadedFiles = [];
  const errors = [];
  let totalSize = 0;

  // Process each file
  for (const file of req.files) {
    try {
      const { tags = [], metadata = {} } = req.body;
      const uniqueFilename = generateUniqueFilename(file.originalname);

      let fileUrl, cdnUrl, filePath, b2FileId;

      if (isB2Available()) {
        const b2Path = `${userId}/${bucketId}/${uniqueFilename}`;
        const uploadResult = await uploadToB2(file.buffer, b2Path, file.mimetype, isPublicBucket);
        
        fileUrl = uploadResult.url;
        cdnUrl = uploadResult.url;
        filePath = b2Path;
        b2FileId = uploadResult.fileId;
      } else {
        const uploadDir = path.join(config.UPLOAD_DIR, userId);
        await fs.mkdir(uploadDir, { recursive: true });
        
        filePath = path.join(uploadDir, uniqueFilename);
        await fs.writeFile(filePath, file.buffer);
        
        fileUrl = `/uploads/${userId}/${uniqueFilename}`;
        cdnUrl = `${config.FRONTEND_URL}/cdn${fileUrl}`;
      }

      // Store file info in database
      const result = await query(
        `INSERT INTO files (
          bucket_id, user_id, filename, original_name, path, size,
          mime_type, extension, url, cdn_url, is_public, tags, metadata, b2_file_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          bucketId,
          userId,
          uniqueFilename,
          file.originalname,
          filePath,
          file.size,
          file.mimetype,
          path.extname(file.originalname),
          fileUrl,
          cdnUrl,
          isPublic,
          Array.isArray(tags) ? tags : [],
          typeof metadata === 'object' ? metadata : {},
          b2FileId || null
        ]
      );

      uploadedFiles.push({
        ...result.rows[0],
        formattedSize: formatBytes(result.rows[0].size)
      });
      totalSize += file.size;
    } catch (error) {
      errors.push({
        filename: file.originalname,
        error: error.message
      });
    }
  }

  // Update usage
  if (totalSize > 0) {
    await query(
      `INSERT INTO usage_records (user_id, date, storage_bytes, upload_bytes, upload_calls, api_calls)
       VALUES ($1, CURRENT_DATE, $2, $2, $3, 1)
       ON CONFLICT (user_id, date)
       DO UPDATE SET 
         storage_bytes = usage_records.storage_bytes + $2,
         upload_bytes = usage_records.upload_bytes + $2,
         upload_calls = usage_records.upload_calls + $3,
         api_calls = usage_records.api_calls + 1,
         bandwidth_bytes = usage_records.bandwidth_bytes + $2,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, totalSize, uploadedFiles.length]
    );
  }

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, details) VALUES ($1, $2, $3, $4)',
    [userId, 'bulk_files_uploaded', 'file', { count: uploadedFiles.length, totalSize, errors: errors.length }]
  );

  const response = {
    uploadedCount: uploadedFiles.length,
    files: uploadedFiles,
    totalSize,
    formattedSize: formatBytes(totalSize)
  };

  if (errors.length > 0) {
    response.errors = errors;
    response.errorCount = errors.length;
  }

  const message = errors.length > 0 
    ? `Uploaded ${uploadedFiles.length} files with ${errors.length} errors`
    : `Successfully uploaded ${uploadedFiles.length} files`;

  successResponse(res, response, message, 201);
});
