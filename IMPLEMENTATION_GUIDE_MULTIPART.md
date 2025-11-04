# 🚀 IMPLEMENTATION GUIDE: Multipart Upload

**Priority:** P0 - CRITICAL  
**Estimated Time:** 5-7 days  
**Complexity:** HIGH

---

## 📋 Overview

Multipart upload allows users to upload files in chunks, enabling:
- ✅ Upload files >100MB (up to 2TB)
- ✅ Parallel chunk uploads (faster)
- ✅ Resume failed uploads
- ✅ Better progress tracking

**AWS S3 Comparison:**
- AWS: 5MB-5TB per file, 5GB max per part
- Your Target: 5MB-2TB per file, 100MB max per part

---

## 🗄️ Step 1: Database Schema

```sql
-- Create multipart_uploads table
CREATE TABLE multipart_uploads (
  id SERIAL PRIMARY KEY,
  upload_id VARCHAR(100) UNIQUE NOT NULL, -- Unique identifier (UUID)
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bucket_id INT NOT NULL REFERENCES buckets(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100),
  metadata JSONB,
  tags TEXT[],
  total_parts INT,
  storage_class VARCHAR(50) DEFAULT 'STANDARD',
  status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, aborted
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create upload_parts table
CREATE TABLE upload_parts (
  id SERIAL PRIMARY KEY,
  upload_id VARCHAR(100) NOT NULL REFERENCES multipart_uploads(upload_id) ON DELETE CASCADE,
  part_number INT NOT NULL,
  etag VARCHAR(100) NOT NULL, -- MD5 hash of part
  size BIGINT NOT NULL,
  b2_file_id VARCHAR(200), -- Backblaze file ID
  uploaded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(upload_id, part_number)
);

-- Indexes
CREATE INDEX idx_multipart_uploads_user ON multipart_uploads(user_id);
CREATE INDEX idx_multipart_uploads_bucket ON multipart_uploads(bucket_id);
CREATE INDEX idx_multipart_uploads_status ON multipart_uploads(status);
CREATE INDEX idx_multipart_uploads_expires ON multipart_uploads(expires_at);
CREATE INDEX idx_upload_parts_upload ON upload_parts(upload_id);

-- Add column to files table for multipart tracking
ALTER TABLE files ADD COLUMN upload_id VARCHAR(100) REFERENCES multipart_uploads(upload_id);
```

---

## 📁 Step 2: Controller Implementation

**File:** `backend/src/controllers/multipartController.js`

```javascript
import crypto from 'crypto';
import { query, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/validator.js';
import { successResponse, errorResponse, generateUniqueFilename } from '../utils/helpers.js';
import { uploadToB2, deleteFromB2 } from '../services/b2Service.js';

// 1. INITIATE MULTIPART UPLOAD
export const initiateMultipartUpload = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;
  const { filename, contentType, metadata = {}, tags = [], storageClass = 'STANDARD' } = req.body;

  // Validate bucket ownership
  const bucketResult = await query(
    'SELECT id, name, visibility FROM buckets WHERE id = $1 AND user_id = $2',
    [bucketId, userId]
  );

  if (bucketResult.rows.length === 0) {
    return errorResponse(res, 'Bucket not found', 404);
  }

  // Check plan limits for multipart uploads
  const planResult = await query(
    `SELECT p.* FROM users u
     JOIN plans p ON u.plan_id = p.id
     WHERE u.id = $1`,
    [userId]
  );

  const plan = planResult.rows[0];
  if (!plan.multipart_upload_allowed) {
    return errorResponse(
      res,
      'Multipart uploads are not available in your plan. Please upgrade to Pro or PAYG.',
      403
    );
  }

  // Generate upload ID
  const uploadId = crypto.randomUUID();
  const uniqueFilename = generateUniqueFilename(filename);

  // Create multipart upload record
  const result = await query(
    `INSERT INTO multipart_uploads 
     (upload_id, user_id, bucket_id, filename, original_filename, content_type, metadata, tags, storage_class)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [uploadId, userId, bucketId, uniqueFilename, filename, contentType, JSON.stringify(metadata), tags, storageClass]
  );

  successResponse(res, {
    uploadId: result.rows[0].upload_id,
    bucketId,
    filename: uniqueFilename,
    expiresAt: result.rows[0].expires_at
  }, 'Multipart upload initiated', 201);
});

// 2. UPLOAD PART
export const uploadPart = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No file part uploaded', 400);
  }

  const { uploadId, partNumber } = req.params;
  const userId = req.user.id;

  // Validate part number
  const partNum = parseInt(partNumber);
  if (partNum < 1 || partNum > 10000) {
    return errorResponse(res, 'Part number must be between 1 and 10000', 400);
  }

  // Validate upload exists and belongs to user
  const uploadResult = await query(
    `SELECT * FROM multipart_uploads
     WHERE upload_id = $1 AND user_id = $2 AND status = 'in_progress'`,
    [uploadId, userId]
  );

  if (uploadResult.rows.length === 0) {
    return errorResponse(res, 'Multipart upload not found or already completed', 404);
  }

  const upload = uploadResult.rows[0];

  // Check if part already uploaded (allow overwrite)
  await query(
    'DELETE FROM upload_parts WHERE upload_id = $1 AND part_number = $2',
    [uploadId, partNum]
  );

  // Calculate MD5 hash (ETag)
  const md5Hash = crypto.createHash('md5').update(req.file.buffer).digest('hex');
  const etag = md5Hash;

  // Upload part to B2
  const b2Path = `${userId}/${upload.bucket_id}/${upload.filename}.part${partNum}`;
  const uploadResult2 = await uploadToB2(
    req.file.buffer,
    b2Path,
    req.file.mimetype,
    false // Parts are always private
  );

  // Store part info
  const partResult = await query(
    `INSERT INTO upload_parts (upload_id, part_number, etag, size, b2_file_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [uploadId, partNum, etag, req.file.size, uploadResult2.fileId]
  );

  successResponse(res, {
    uploadId,
    partNumber: partNum,
    etag,
    size: req.file.size
  }, 'Part uploaded successfully');
});

// 3. COMPLETE MULTIPART UPLOAD
export const completeMultipartUpload = asyncHandler(async (req, res) => {
  const { uploadId } = req.params;
  const userId = req.user.id;
  const { parts } = req.body; // Array of {partNumber, etag}

  if (!Array.isArray(parts) || parts.length === 0) {
    return errorResponse(res, 'Parts array is required', 400);
  }

  // Use transaction for atomicity
  const result = await transaction(async (client) => {
    // Validate upload
    const uploadResult = await client.query(
      `SELECT mu.*, b.visibility FROM multipart_uploads mu
       JOIN buckets b ON mu.bucket_id = b.id
       WHERE mu.upload_id = $1 AND mu.user_id = $2 AND mu.status = 'in_progress'`,
      [uploadId, userId]
    );

    if (uploadResult.rows.length === 0) {
      throw new Error('Multipart upload not found or already completed');
    }

    const upload = uploadResult.rows[0];

    // Verify all parts exist and match ETags
    const partsResult = await client.query(
      'SELECT * FROM upload_parts WHERE upload_id = $1 ORDER BY part_number',
      [uploadId]
    );

    const uploadedParts = partsResult.rows;

    // Validate parts match
    for (const part of parts) {
      const uploadedPart = uploadedParts.find(p => p.part_number === part.partNumber);
      if (!uploadedPart) {
        throw new Error(`Part ${part.partNumber} not found`);
      }
      if (uploadedPart.etag !== part.etag) {
        throw new Error(`ETag mismatch for part ${part.partNumber}`);
      }
    }

    // Calculate total size
    const totalSize = uploadedParts.reduce((sum, part) => sum + parseInt(part.size), 0);

    // Check plan file size limit
    const planResult = await client.query(
      `SELECT p.* FROM users u
       JOIN plans p ON u.plan_id = p.id
       WHERE u.id = $1`,
      [userId]
    );

    const plan = planResult.rows[0];
    const sizeMB = totalSize / (1024 * 1024);

    if (plan.max_file_size_mb > 0 && sizeMB > plan.max_file_size_mb) {
      throw new Error(`Total file size (${sizeMB.toFixed(2)}MB) exceeds plan limit of ${plan.max_file_size_mb}MB`);
    }

    // In production, you'd combine parts in B2 here
    // For now, we'll create a final file entry
    const b2Path = `${userId}/${upload.bucket_id}/${upload.filename}`;
    const isPublic = upload.visibility === 'public';

    // Note: In real implementation, you'd merge all parts in B2
    // This is simplified - you need B2's finalize_large_file API

    // Create file record
    const fileResult = await client.query(
      `INSERT INTO files 
       (user_id, bucket_id, filename, original_filename, file_path, size, mime_type, 
        is_public, url, cdn_url, metadata, tags, upload_id, storage_class)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        userId, upload.bucket_id, upload.filename, upload.original_filename,
        b2Path, totalSize, upload.content_type, isPublic,
        'https://b2-url.com/' + b2Path, 'https://cdn-url.com/' + b2Path,
        upload.metadata, upload.tags, uploadId, upload.storage_class
      ]
    );

    // Update multipart upload status
    await client.query(
      `UPDATE multipart_uploads
       SET status = 'completed', completed_at = NOW(), total_parts = $2
       WHERE upload_id = $1`,
      [uploadId, parts.length]
    );

    // Update usage
    await client.query(
      `INSERT INTO usage (user_id, storage_used, files_count)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id)
       DO UPDATE SET
         storage_used = usage.storage_used + $2,
         files_count = usage.files_count + 1`,
      [userId, totalSize]
    );

    return fileResult.rows[0];
  });

  successResponse(res, result, 'Multipart upload completed successfully');
});

// 4. ABORT MULTIPART UPLOAD
export const abortMultipartUpload = asyncHandler(async (req, res) => {
  const { uploadId } = req.params;
  const userId = req.user.id;

  await transaction(async (client) => {
    // Validate upload
    const uploadResult = await client.query(
      'SELECT * FROM multipart_uploads WHERE upload_id = $1 AND user_id = $2',
      [uploadId, userId]
    );

    if (uploadResult.rows.length === 0) {
      throw new Error('Multipart upload not found');
    }

    // Get all parts to delete from B2
    const partsResult = await client.query(
      'SELECT b2_file_id FROM upload_parts WHERE upload_id = $1',
      [uploadId]
    );

    // Delete parts from B2
    for (const part of partsResult.rows) {
      if (part.b2_file_id) {
        try {
          await deleteFromB2(part.b2_file_id, null);
        } catch (error) {
          console.error('Error deleting part from B2:', error);
        }
      }
    }

    // Delete parts from database
    await client.query('DELETE FROM upload_parts WHERE upload_id = $1', [uploadId]);

    // Update upload status
    await client.query(
      `UPDATE multipart_uploads SET status = 'aborted' WHERE upload_id = $1`,
      [uploadId]
    );
  });

  successResponse(res, null, 'Multipart upload aborted successfully');
});

// 5. LIST PARTS
export const listParts = asyncHandler(async (req, res) => {
  const { uploadId } = req.params;
  const userId = req.user.id;

  // Validate upload
  const uploadResult = await query(
    'SELECT * FROM multipart_uploads WHERE upload_id = $1 AND user_id = $2',
    [uploadId, userId]
  );

  if (uploadResult.rows.length === 0) {
    return errorResponse(res, 'Multipart upload not found', 404);
  }

  // Get all parts
  const partsResult = await query(
    'SELECT part_number, etag, size, uploaded_at FROM upload_parts WHERE upload_id = $1 ORDER BY part_number',
    [uploadId]
  );

  successResponse(res, {
    uploadId,
    parts: partsResult.rows,
    totalParts: partsResult.rows.length
  });
});

// 6. LIST MULTIPART UPLOADS
export const listMultipartUploads = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { bucketId } = req.query;

  let queryText = `
    SELECT mu.*, b.name as bucket_name, COUNT(up.id) as parts_uploaded
    FROM multipart_uploads mu
    LEFT JOIN buckets b ON mu.bucket_id = b.id
    LEFT JOIN upload_parts up ON mu.upload_id = up.upload_id
    WHERE mu.user_id = $1 AND mu.status = 'in_progress'
  `;

  const params = [userId];

  if (bucketId) {
    queryText += ' AND mu.bucket_id = $2';
    params.push(bucketId);
  }

  queryText += ' GROUP BY mu.id, b.name ORDER BY mu.created_at DESC';

  const result = await query(queryText, params);

  successResponse(res, {
    uploads: result.rows,
    count: result.rows.length
  });
});

// CRON JOB: Clean up expired uploads (run daily)
export const cleanupExpiredUploads = async () => {
  try {
    const expiredResult = await query(
      `SELECT mu.upload_id, up.b2_file_id
       FROM multipart_uploads mu
       LEFT JOIN upload_parts up ON mu.upload_id = up.upload_id
       WHERE mu.status = 'in_progress' AND mu.expires_at < NOW()`
    );

    for (const upload of expiredResult.rows) {
      // Delete from B2
      if (upload.b2_file_id) {
        try {
          await deleteFromB2(upload.b2_file_id, null);
        } catch (error) {
          console.error('Error deleting expired part:', error);
        }
      }
    }

    // Update status
    await query(
      `UPDATE multipart_uploads
       SET status = 'aborted'
       WHERE status = 'in_progress' AND expires_at < NOW()`
    );

    console.log(`Cleaned up ${expiredResult.rows.length} expired multipart uploads`);
  } catch (error) {
    console.error('Error cleaning up expired uploads:', error);
  }
};
```

---

## 📡 Step 3: Routes

**File:** `backend/src/routes/multipartRoutes.js`

```javascript
import express from 'express';
import { authenticate, requirePermission, requireOwnership } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/security.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { upload } from '../controllers/fileController.js';
import {
  initiateMultipartUpload,
  uploadPart,
  completeMultipartUpload,
  abortMultipartUpload,
  listParts,
  listMultipartUploads
} from '../controllers/multipartController.js';

const router = express.Router();

// Validation
const initiateValidation = [
  body('filename').trim().notEmpty().withMessage('Filename is required'),
  body('contentType').optional().trim(),
  body('metadata').optional().isObject(),
  body('tags').optional().isArray(),
  body('storageClass').optional().isIn(['STANDARD', 'INFREQUENT_ACCESS', 'GLACIER', 'DEEP_ARCHIVE']),
  validate
];

const completeValidation = [
  body('parts').isArray({ min: 1 }).withMessage('Parts array is required'),
  body('parts.*.partNumber').isInt({ min: 1 }).withMessage('Invalid part number'),
  body('parts.*.etag').trim().notEmpty().withMessage('ETag is required'),
  validate
];

// Routes
router.post(
  '/:bucketId/initiate',
  authenticate,
  requirePermission('files:write'),
  requireOwnership('bucket'),
  initiateValidation,
  initiateMultipartUpload
);

router.put(
  '/:uploadId/part/:partNumber',
  authenticate,
  requirePermission('files:write'),
  uploadLimiter,
  upload.single('file'),
  uploadPart
);

router.post(
  '/:uploadId/complete',
  authenticate,
  requirePermission('files:write'),
  completeValidation,
  completeMultipartUpload
);

router.delete(
  '/:uploadId/abort',
  authenticate,
  requirePermission('files:write'),
  abortMultipartUpload
);

router.get(
  '/:uploadId/parts',
  authenticate,
  requirePermission('files:read'),
  listParts
);

router.get(
  '/',
  authenticate,
  requirePermission('files:read'),
  listMultipartUploads
);

export default router;
```

---

## 🔧 Step 4: Update server.js

```javascript
// In server.js, add:
import multipartRoutes from './routes/multipartRoutes.js';

// Add route
app.use(`/api/${config.API_VERSION}/multipart`, planBasedRateLimit, multipartRoutes);

// Add cron job for cleanup
import { cleanupExpiredUploads } from './controllers/multipartController.js';
import cron from 'node-cron';

// Run daily at 2 AM
cron.schedule('0 2 * * *', cleanupExpiredUploads);
```

---

## 📦 Step 5: Update B2 Service

**File:** `backend/src/services/b2Service.js`

Add B2 large file API support:

```javascript
// Add to b2Service.js

export const startLargeFile = async (fileName, contentType, bucketId) => {
  const auth = await getAuthToken();
  
  const response = await fetch(`${auth.apiUrl}/b2api/v2/b2_start_large_file`, {
    method: 'POST',
    headers: {
      'Authorization': auth.authorizationToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bucketId,
      fileName,
      contentType
    })
  });

  if (!response.ok) {
    throw new Error('Failed to start large file');
  }

  return await response.json();
};

export const finalizeLargeFile = async (fileId, partSha1Array) => {
  const auth = await getAuthToken();
  
  const response = await fetch(`${auth.apiUrl}/b2api/v2/b2_finish_large_file`, {
    method: 'POST',
    headers: {
      'Authorization': auth.authorizationToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileId,
      partSha1Array
    })
  });

  if (!response.ok) {
    throw new Error('Failed to finalize large file');
  }

  return await response.json();
};
```

---

## 🧪 Step 6: Testing

**Bash test script:**

```bash
#!/bin/bash

API_URL="http://localhost:5000/api/v1"
TOKEN="your_jwt_token"
BUCKET_ID=1

echo "1. Initiate multipart upload..."
UPLOAD_RESPONSE=$(curl -X POST "$API_URL/multipart/$BUCKET_ID/initiate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "large-file.zip",
    "contentType": "application/zip"
  }')

UPLOAD_ID=$(echo $UPLOAD_RESPONSE | jq -r '.data.uploadId')
echo "Upload ID: $UPLOAD_ID"

echo "2. Upload part 1..."
curl -X PUT "$API_URL/multipart/$UPLOAD_ID/part/1" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./test-part1.bin"

echo "3. Upload part 2..."
curl -X PUT "$API_URL/multipart/$UPLOAD_ID/part/2" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./test-part2.bin"

echo "4. List parts..."
curl -X GET "$API_URL/multipart/$UPLOAD_ID/parts" \
  -H "Authorization: Bearer $TOKEN"

echo "5. Complete upload..."
curl -X POST "$API_URL/multipart/$UPLOAD_ID/complete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parts": [
      {"partNumber": 1, "etag": "abc123"},
      {"partNumber": 2, "etag": "def456"}
    ]
  }'
```

---

## 📚 Step 7: Update SDK

**Node.js SDK addition:**

```javascript
// In hypz-sdk/nodejs/index.js

/**
 * Initiate multipart upload
 */
async initiateMultipartUpload(bucketId, filename, options = {}) {
  const response = await this._makeRequest(`/multipart/${bucketId}/initiate`, {
    method: 'POST',
    body: JSON.stringify({
      filename,
      contentType: options.contentType,
      metadata: options.metadata,
      tags: options.tags,
      storageClass: options.storageClass
    })
  });
  return response.data;
}

/**
 * Upload part
 */
async uploadPart(uploadId, partNumber, fileBuffer) {
  const formData = new FormData();
  formData.append('file', fileBuffer);

  const response = await this._makeRequest(`/multipart/${uploadId}/part/${partNumber}`, {
    method: 'PUT',
    body: formData
  });
  return response.data;
}

/**
 * Complete multipart upload
 */
async completeMultipartUpload(uploadId, parts) {
  const response = await this._makeRequest(`/multipart/${uploadId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ parts })
  });
  return response.data;
}

/**
 * Upload large file with automatic multipart
 */
async uploadLargeFile(bucketId, filePath, options = {}) {
  const fs = require('fs');
  const stats = fs.statSync(filePath);
  const chunkSize = 10 * 1024 * 1024; // 10MB chunks

  // Initiate
  const { uploadId } = await this.initiateMultipartUpload(
    bucketId,
    require('path').basename(filePath),
    options
  );

  // Upload parts
  const parts = [];
  let partNumber = 1;
  
  for (let start = 0; start < stats.size; start += chunkSize) {
    const end = Math.min(start + chunkSize, stats.size);
    const buffer = Buffer.alloc(end - start);
    
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, end - start, start);
    fs.closeSync(fd);

    const result = await this.uploadPart(uploadId, partNumber, buffer);
    parts.push({
      partNumber: partNumber,
      etag: result.etag
    });

    if (options.onProgress) {
      options.onProgress(end, stats.size);
    }

    partNumber++;
  }

  // Complete
  return await this.completeMultipartUpload(uploadId, parts);
}
```

---

## ✅ Completion Checklist

- [ ] Run database migrations
- [ ] Create multipart controller
- [ ] Add routes
- [ ] Update server.js
- [ ] Add B2 large file APIs
- [ ] Update plan schema (add multipart_upload_allowed column)
- [ ] Add cleanup cron job
- [ ] Test with small file (2 parts)
- [ ] Test with large file (50+ parts)
- [ ] Test abort functionality
- [ ] Test expiration cleanup
- [ ] Update SDK (all languages)
- [ ] Update documentation
- [ ] Add frontend UI for progress

---

**Estimated Time:** 5-7 days full-time development + testing
