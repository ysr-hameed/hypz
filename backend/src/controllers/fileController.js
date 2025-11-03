import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
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
  const { isPublic = false, tags = [], metadata = {} } = req.body;

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
    'SELECT * FROM files WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
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
      // For private buckets, stream via SDK; for public buckets, redirect to URL
      if (file.url && file.url.includes('/file/') && file.is_public) {
        return res.redirect(file.url);
      }

      // Attempt streaming from B2 (defaults to private bucket when bucket not provided)
  const { downloadFromB2 } = await import('../services/b2Service.js');
  const data = await downloadFromB2(file.path);

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

  const updates = [];
  const params = [fileId, userId];
  let paramIndex = 3;

  if (isPublic !== undefined) {
    updates.push(`is_public = $${paramIndex++}`);
    params.push(isPublic);
  }
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
