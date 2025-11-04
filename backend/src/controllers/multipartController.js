import { query, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/validator.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import B2 from 'backblaze-b2';
import config from '../config/config.js';
import crypto from 'crypto';

// Initialize B2 client
const b2 = new B2({
  applicationKeyId: config.B2_APPLICATION_KEY_ID,
  applicationKey: config.B2_APPLICATION_KEY
});

// 1. INITIATE MULTIPART UPLOAD
export const initiateMultipartUpload = asyncHandler(async (req, res) => {
  const { bucketId, filename, mimeType, storageClass, metadata } = req.body;
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
  const uploadId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await transaction(async (client) => {
    // Authorize B2
    await b2.authorize();
    
    // Get B2 bucket info
    const b2BucketInfo = JSON.parse(bucket.metadata || '{}').b2_bucket_id;

    // Start B2 large file upload
    const b2Response = await b2.startLargeFile({
      bucketId: b2BucketInfo,
      fileName: `${bucket.slug}/${filename}`,
      contentType: mimeType || 'application/octet-stream'
    });

    // Insert multipart upload record
    await client.query(
      `INSERT INTO multipart_uploads 
       (upload_id, user_id, bucket_id, filename, original_name, mime_type, storage_class, metadata, b2_file_id, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        uploadId,
        userId,
        bucketId,
        filename,
        filename,
        mimeType || 'application/octet-stream',
        storageClass || 'STANDARD',
        JSON.stringify(metadata || {}),
        b2Response.data.fileId,
        'initiated',
        expiresAt
      ]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'multipart_initiated', 'multipart_upload', uploadId, { filename, bucket: bucket.name }]
    );
  });

  successResponse(res, {
    uploadId,
    bucketId,
    filename,
    expiresAt,
    message: 'Multipart upload initiated successfully'
  }, 201);
});

// 2. GET UPLOAD URL FOR PART
export const getUploadPartUrl = asyncHandler(async (req, res) => {
  const { uploadId } = req.params;
  const { partNumber } = req.query;
  const userId = req.user.id;

  if (!partNumber || partNumber < 1 || partNumber > 10000) {
    return errorResponse(res, 'Invalid part number (must be 1-10000)', 400);
  }

  // Get upload info
  const uploadResult = await query(
    'SELECT * FROM multipart_uploads WHERE upload_id = $1 AND user_id = $2',
    [uploadId, userId]
  );

  if (uploadResult.rows.length === 0) {
    return errorResponse(res, 'Multipart upload not found', 404);
  }

  const upload = uploadResult.rows[0];

  if (upload.status !== 'initiated') {
    return errorResponse(res, `Cannot upload parts - upload is ${upload.status}`, 400);
  }

  if (new Date() > new Date(upload.expires_at)) {
    return errorResponse(res, 'Multipart upload has expired', 410);
  }

  // Get upload URL from B2
  await b2.authorize();
  const urlResponse = await b2.getUploadPartUrl({
    fileId: upload.b2_file_id
  });

  successResponse(res, {
    uploadId,
    partNumber: parseInt(partNumber),
    uploadUrl: urlResponse.data.uploadUrl,
    authorizationToken: urlResponse.data.authorizationToken,
    expiresIn: 86400 // 24 hours in seconds
  });
});

// 3. COMPLETE PART UPLOAD (webhook from frontend after upload)
export const completePartUpload = asyncHandler(async (req, res) => {
  const { uploadId } = req.params;
  const { partNumber, size, sha1, etag } = req.body;
  const userId = req.user.id;

  // Verify upload ownership
  const uploadResult = await query(
    'SELECT * FROM multipart_uploads WHERE upload_id = $1 AND user_id = $2',
    [uploadId, userId]
  );

  if (uploadResult.rows.length === 0) {
    return errorResponse(res, 'Multipart upload not found', 404);
  }

  const upload = uploadResult.rows[0];

  await transaction(async (client) => {
    // Insert part record
    await client.query(
      `INSERT INTO upload_parts (multipart_upload_id, part_number, size, sha1_hash, etag)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (multipart_upload_id, part_number) 
       DO UPDATE SET size = $3, sha1_hash = $4, etag = $5, uploaded_at = NOW()`,
      [upload.id, partNumber, size, sha1, etag]
    );

    // Update upload progress
    await client.query(
      `UPDATE multipart_uploads 
       SET completed_parts = (SELECT COUNT(*) FROM upload_parts WHERE multipart_upload_id = $1)
       WHERE id = $1`,
      [upload.id]
    );
  });

  successResponse(res, {
    uploadId,
    partNumber,
    message: 'Part uploaded successfully'
  });
});

// 4. COMPLETE MULTIPART UPLOAD
export const completeMultipartUpload = asyncHandler(async (req, res) => {
  const { uploadId } = req.params;
  const userId = req.user.id;

  // Get upload info with all parts
  const uploadResult = await query(
    `SELECT mu.*, 
            json_agg(
              json_build_object(
                'partNumber', up.part_number,
                'size', up.size,
                'sha1', up.sha1_hash
              ) ORDER BY up.part_number
            ) as parts
     FROM multipart_uploads mu
     LEFT JOIN upload_parts up ON mu.id = up.multipart_upload_id
     WHERE mu.upload_id = $1 AND mu.user_id = $2
     GROUP BY mu.id`,
    [uploadId, userId]
  );

  if (uploadResult.rows.length === 0) {
    return errorResponse(res, 'Multipart upload not found', 404);
  }

  const upload = uploadResult.rows[0];

  if (upload.status === 'completed') {
    return errorResponse(res, 'Upload already completed', 400);
  }

  if (!upload.parts || upload.parts.length === 0 || upload.parts[0].partNumber === null) {
    return errorResponse(res, 'No parts uploaded yet', 400);
  }

  const result = await transaction(async (client) => {
    // Finish B2 large file
    await b2.authorize();
    const partSha1Array = upload.parts.map(p => p.sha1);
    
    const b2Response = await b2.finishLargeFile({
      fileId: upload.b2_file_id,
      partSha1Array
    });

    const totalSize = upload.parts.reduce((sum, p) => sum + parseInt(p.size), 0);

    // Insert into files table
    const fileResult = await client.query(
      `INSERT INTO files 
       (bucket_id, user_id, filename, original_name, path, size, mime_type, url, b2_file_id, storage_class, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        upload.bucket_id,
        userId,
        upload.filename,
        upload.original_name,
        `${upload.bucket_id}/${upload.filename}`,
        totalSize,
        upload.mime_type,
        b2Response.data.downloadUrl || `https://f002.backblazeb2.com/file/${upload.filename}`,
        upload.b2_file_id,
        upload.storage_class,
        upload.metadata
      ]
    );

    // Update multipart upload status
    await client.query(
      'UPDATE multipart_uploads SET status = $1, completed_at = NOW() WHERE id = $2',
      ['completed', upload.id]
    );

    // Update usage
    await client.query(
      `INSERT INTO usage_records (user_id, date, storage_bytes, upload_bytes, api_calls, upload_calls)
       VALUES ($1, CURRENT_DATE, $2, $2, 1, 1)
       ON CONFLICT (user_id, date)
       DO UPDATE SET 
         storage_bytes = usage_records.storage_bytes + $2,
         upload_bytes = usage_records.upload_bytes + $2,
         api_calls = usage_records.api_calls + 1,
         upload_calls = usage_records.upload_calls + 1`,
      [userId, totalSize]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'multipart_completed', 'file', fileResult.rows[0].id, { 
        filename: upload.filename, 
        size: totalSize, 
        parts: upload.parts.length 
      }]
    );

    return fileResult.rows[0];
  });

  successResponse(res, {
    file: result,
    message: 'Multipart upload completed successfully'
  });
});

// 5. ABORT MULTIPART UPLOAD
export const abortMultipartUpload = asyncHandler(async (req, res) => {
  const { uploadId } = req.params;
  const userId = req.user.id;

  const uploadResult = await query(
    'SELECT * FROM multipart_uploads WHERE upload_id = $1 AND user_id = $2',
    [uploadId, userId]
  );

  if (uploadResult.rows.length === 0) {
    return errorResponse(res, 'Multipart upload not found', 404);
  }

  const upload = uploadResult.rows[0];

  if (upload.status === 'completed') {
    return errorResponse(res, 'Cannot abort completed upload', 400);
  }

  await transaction(async (client) => {
    // Cancel B2 large file
    try {
      await b2.authorize();
      await b2.cancelLargeFile({
        fileId: upload.b2_file_id
      });
    } catch (error) {
      console.error('Error canceling B2 large file:', error);
    }

    // Update upload status
    await client.query(
      'UPDATE multipart_uploads SET status = $1, aborted_at = NOW() WHERE id = $2',
      ['aborted', upload.id]
    );

    // Delete uploaded parts
    await client.query(
      'DELETE FROM upload_parts WHERE multipart_upload_id = $1',
      [upload.id]
    );

    // Log activity
    await client.query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'multipart_aborted', 'multipart_upload', uploadId, { filename: upload.filename }]
    );
  });

  successResponse(res, {
    uploadId,
    message: 'Multipart upload aborted successfully'
  });
});

// 6. LIST PARTS
export const listParts = asyncHandler(async (req, res) => {
  const { uploadId } = req.params;
  const userId = req.user.id;

  const uploadResult = await query(
    'SELECT * FROM multipart_uploads WHERE upload_id = $1 AND user_id = $2',
    [uploadId, userId]
  );

  if (uploadResult.rows.length === 0) {
    return errorResponse(res, 'Multipart upload not found', 404);
  }

  const upload = uploadResult.rows[0];

  const partsResult = await query(
    'SELECT part_number, size, etag, sha1_hash, uploaded_at FROM upload_parts WHERE multipart_upload_id = $1 ORDER BY part_number',
    [upload.id]
  );

  successResponse(res, {
    uploadId,
    filename: upload.filename,
    status: upload.status,
    parts: partsResult.rows,
    totalParts: partsResult.rows.length,
    completedParts: upload.completed_parts
  });
});

// 7. LIST MULTIPART UPLOADS
export const listMultipartUploads = asyncHandler(async (req, res) => {
  const { bucketId } = req.query;
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  let queryStr = `
    SELECT mu.*, b.name as bucket_name,
           (SELECT COUNT(*) FROM upload_parts WHERE multipart_upload_id = mu.id) as parts_count
    FROM multipart_uploads mu
    JOIN buckets b ON mu.bucket_id = b.id
    WHERE mu.user_id = $1
  `;
  const params = [userId];

  if (bucketId) {
    queryStr += ' AND mu.bucket_id = $2';
    params.push(bucketId);
  }

  queryStr += ` ORDER BY mu.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await query(queryStr, params);

  successResponse(res, {
    uploads: result.rows,
    count: result.rows.length,
    limit,
    offset
  });
});
