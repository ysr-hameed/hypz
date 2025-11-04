# 🚀 IMPLEMENTATION GUIDE: Object Versioning

**Priority:** P0 - CRITICAL  
**Estimated Time:** 3-4 days  
**Complexity:** MEDIUM-HIGH

---

## 📋 Overview

Object versioning allows users to keep multiple variants of an object, enabling:
- ✅ Recover from accidental deletions
- ✅ Recover from accidental overwrites
- ✅ Compliance requirements (audit trails)
- ✅ Data protection

**AWS S3 Comparison:**
- AWS: Unlimited versions per object
- Your Target: Unlimited versions (with lifecycle policies to manage)

---

## 🗄️ Step 1: Database Schema

```sql
-- Add versioning column to buckets
ALTER TABLE buckets ADD COLUMN versioning_enabled BOOLEAN DEFAULT false;
ALTER TABLE buckets ADD COLUMN versioning_mfa_delete BOOLEAN DEFAULT false;

-- Modify files table to support versioning
ALTER TABLE files ADD COLUMN version_id VARCHAR(50) DEFAULT 'null';
ALTER TABLE files ADD COLUMN is_latest BOOLEAN DEFAULT true;
ALTER TABLE files ADD COLUMN is_delete_marker BOOLEAN DEFAULT false;

-- Create index for version queries
CREATE INDEX idx_files_bucket_filename_version ON files(bucket_id, filename, version_id);
CREATE INDEX idx_files_is_latest ON files(is_latest);

-- Update existing files to have version_id
UPDATE files SET version_id = 'null' WHERE version_id IS NULL;
```

---

## 📁 Step 2: Controller Implementation

**File:** `backend/src/controllers/versioningController.js`

```javascript
import crypto from 'crypto';
import { query, transaction } from '../config/database.js';
import { asyncHandler } from '../middleware/validator.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { deleteFromB2 } from '../services/b2Service.js';

// 1. ENABLE/SUSPEND VERSIONING
export const putBucketVersioning = asyncHandler(async (req, res) => {
  const { bucketId } = req.params;
  const userId = req.user.id;
  const { status, mfaDelete = false } = req.body; // status: 'Enabled' or 'Suspended'

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
      'Versioning is not available in your plan. Please upgrade to Pro or PAYG.',
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
    bucketId,
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
    mfaDelete: result.rows[0].versioning_mfa_delete
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
      created_at, updated_at, etag, storage_class
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
    // For pagination
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
        versionId: row.version_id,
        isLatest: row.is_latest,
        size: row.size,
        etag: row.etag,
        storageClass: row.storage_class,
        lastModified: row.created_at
      });
    }
  });

  successResponse(res, {
    bucketId,
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
    WHERE f.id = $1 AND b.user_id = $2
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
       WHERE f.id = $1 AND f.version_id = $2 AND b.user_id = $3`,
      [fileId, versionId, userId]
    );

    if (fileResult.rows.length === 0) {
      throw new Error('Version not found');
    }

    const file = fileResult.rows[0];

    // Delete from B2
    if (file.b2_file_id) {
      await deleteFromB2(file.b2_file_id, file.file_path);
    }

    // Permanently delete this version
    await client.query(
      'DELETE FROM files WHERE id = $1 AND version_id = $2',
      [fileId, versionId]
    );

    // If this was the latest version, mark the next version as latest
    if (file.is_latest) {
      await client.query(
        `UPDATE files
         SET is_latest = true
         WHERE bucket_id = $1 AND filename = $2 AND version_id != $3
         ORDER BY created_at DESC
         LIMIT 1`,
        [file.bucket_id, file.filename, versionId]
      );
    }

    // Update usage
    await client.query(
      `UPDATE usage
       SET storage_used = storage_used - $2,
           files_count = files_count - 1
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
    return errorResponse(res, 'versionId is required', 400);
  }

  const result = await transaction(async (client) => {
    // Get the version to restore
    const versionResult = await client.query(
      `SELECT f.*, b.versioning_enabled
       FROM files f
       JOIN buckets b ON f.bucket_id = b.id
       WHERE f.id = $1 AND f.version_id = $2 AND b.user_id = $3`,
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
       WHERE bucket_id = $1 AND filename = $2 AND is_latest = true`,
      [oldVersion.bucket_id, oldVersion.filename]
    );

    // Create new version (copy of old version)
    const newVersionId = crypto.randomUUID();

    const newFileResult = await client.query(
      `INSERT INTO files
       (user_id, bucket_id, filename, original_filename, file_path, size, mime_type,
        is_public, url, cdn_url, metadata, tags, version_id, is_latest, etag,
        b2_file_id, storage_class)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, $15, $16)
       RETURNING *`,
      [
        userId, oldVersion.bucket_id, oldVersion.filename, oldVersion.original_filename,
        oldVersion.file_path, oldVersion.size, oldVersion.mime_type, oldVersion.is_public,
        oldVersion.url, oldVersion.cdn_url, oldVersion.metadata, oldVersion.tags,
        newVersionId, oldVersion.etag, oldVersion.b2_file_id, oldVersion.storage_class
      ]
    );

    // Update usage (add new version)
    await client.query(
      `UPDATE usage
       SET storage_used = storage_used + $2,
           files_count = files_count + 1
       WHERE user_id = $1`,
      [userId, oldVersion.size]
    );

    return newFileResult.rows[0];
  });

  successResponse(res, result, 'Version restored successfully');
});

// HELPER: Create new version on upload (called from fileController)
export const createNewVersion = async (client, bucketId, filename, fileData) => {
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
       WHERE bucket_id = $1 AND filename = $2 AND is_latest = true`,
      [bucketId, filename]
    );

    // New file will have new version_id
    return crypto.randomUUID();
  }

  // If versioning not enabled, overwrite (version_id = 'null')
  return 'null';
};
```

---

## 📡 Step 3: Routes

**File:** `backend/src/routes/versioningRoutes.js`

```javascript
import express from 'express';
import { authenticate, requirePermission, requireOwnership } from '../middleware/auth.js';
import { body, query as queryValidator } from 'express-validator';
import { validate } from '../middleware/validator.js';
import {
  putBucketVersioning,
  getBucketVersioning,
  listObjectVersions,
  getObjectVersion,
  deleteObjectVersion,
  restoreObjectVersion
} from '../controllers/versioningController.js';

const router = express.Router();

// Validation
const versioningValidation = [
  body('status').isIn(['Enabled', 'Suspended']).withMessage('Status must be Enabled or Suspended'),
  body('mfaDelete').optional().isBoolean(),
  validate
];

const restoreValidation = [
  body('versionId').trim().notEmpty().withMessage('versionId is required'),
  validate
];

// Bucket-level versioning
router.put(
  '/buckets/:bucketId/versioning',
  authenticate,
  requirePermission('buckets:write'),
  requireOwnership('bucket'),
  versioningValidation,
  putBucketVersioning
);

router.get(
  '/buckets/:bucketId/versioning',
  authenticate,
  requirePermission('buckets:read'),
  requireOwnership('bucket'),
  getBucketVersioning
);

// Object versions
router.get(
  '/buckets/:bucketId/versions',
  authenticate,
  requirePermission('files:read'),
  requireOwnership('bucket'),
  listObjectVersions
);

router.get(
  '/files/:fileId/version',
  authenticate,
  requirePermission('files:read'),
  getObjectVersion
);

router.delete(
  '/files/:fileId/version',
  authenticate,
  requirePermission('files:delete'),
  deleteObjectVersion
);

router.post(
  '/files/:fileId/restore',
  authenticate,
  requirePermission('files:write'),
  restoreValidation,
  restoreObjectVersion
);

export default router;
```

---

## 🔧 Step 4: Update fileController.js

Modify upload to support versioning:

```javascript
// In uploadFile function, before creating file record:

import { createNewVersion } from './versioningController.js';

// Inside uploadFile after bucket verification:
const versionId = await createNewVersion(client, bucketId, uniqueFilename, {
  // ... file data
});

// Then in INSERT query, add version_id:
const result = await query(
  `INSERT INTO files 
   (user_id, bucket_id, filename, ..., version_id, is_latest)
   VALUES ($1, $2, $3, ..., $X, true)
   RETURNING *`,
  [...params, versionId]
);
```

---

## 🔧 Step 5: Update server.js

```javascript
// Add versioning routes
import versioningRoutes from './routes/versioningRoutes.js';

app.use(`/api/${config.API_VERSION}/versioning`, planBasedRateLimit, versioningRoutes);
```

---

## 📦 Step 6: Update Plan Schema

```sql
-- Add versioning permission to plans
ALTER TABLE plans ADD COLUMN versioning_allowed BOOLEAN DEFAULT false;

-- Update existing plans
UPDATE plans SET versioning_allowed = true WHERE name IN ('Pro', 'Pay As You Go');
UPDATE plans SET versioning_allowed = false WHERE name = 'Free';
```

---

## 📚 Step 7: Update SDK

**Node.js SDK:**

```javascript
/**
 * Enable/suspend versioning on a bucket
 */
async putBucketVersioning(bucketId, status, mfaDelete = false) {
  const response = await this._makeRequest(`/versioning/buckets/${bucketId}/versioning`, {
    method: 'PUT',
    body: JSON.stringify({ status, mfaDelete })
  });
  return response.data;
}

/**
 * Get bucket versioning status
 */
async getBucketVersioning(bucketId) {
  const response = await this._makeRequest(`/versioning/buckets/${bucketId}/versioning`, {
    method: 'GET'
  });
  return response.data;
}

/**
 * List all versions of objects in a bucket
 */
async listObjectVersions(bucketId, options = {}) {
  const params = new URLSearchParams();
  if (options.prefix) params.append('prefix', options.prefix);
  if (options.maxKeys) params.append('maxKeys', options.maxKeys);
  if (options.keyMarker) params.append('keyMarker', options.keyMarker);
  if (options.versionIdMarker) params.append('versionIdMarker', options.versionIdMarker);

  const response = await this._makeRequest(
    `/versioning/buckets/${bucketId}/versions?${params}`,
    { method: 'GET' }
  );
  return response.data;
}

/**
 * Get a specific version of an object
 */
async getObjectVersion(fileId, versionId) {
  const response = await this._makeRequest(
    `/versioning/files/${fileId}/version?versionId=${versionId}`,
    { method: 'GET' }
  );
  return response.data;
}

/**
 * Delete a specific version permanently
 */
async deleteObjectVersion(fileId, versionId) {
  const response = await this._makeRequest(
    `/versioning/files/${fileId}/version?versionId=${versionId}`,
    { method: 'DELETE' }
  );
  return response.data;
}

/**
 * Restore an old version (creates new version)
 */
async restoreObjectVersion(fileId, versionId) {
  const response = await this._makeRequest(`/versioning/files/${fileId}/restore`, {
    method: 'POST',
    body: JSON.stringify({ versionId })
  });
  return response.data;
}
```

---

## 🧪 Step 8: Testing

```bash
#!/bin/bash

API_URL="http://localhost:5000/api/v1"
TOKEN="your_jwt_token"
BUCKET_ID=1

echo "1. Enable versioning..."
curl -X PUT "$API_URL/versioning/buckets/$BUCKET_ID/versioning" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Enabled"}'

echo "2. Upload file (version 1)..."
curl -X POST "$API_URL/files/$BUCKET_ID/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./test.txt"

echo "3. Upload same filename (version 2)..."
curl -X POST "$API_URL/files/$BUCKET_ID/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./test-v2.txt"

echo "4. List versions..."
curl -X GET "$API_URL/versioning/buckets/$BUCKET_ID/versions" \
  -H "Authorization: Bearer $TOKEN"

echo "5. Restore version 1..."
curl -X POST "$API_URL/versioning/files/1/restore" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"versionId": "version-id-1"}'

echo "6. Delete specific version..."
curl -X DELETE "$API_URL/versioning/files/1/version?versionId=version-id-2" \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Completion Checklist

- [ ] Run database migrations
- [ ] Create versioning controller
- [ ] Add versioning routes
- [ ] Update fileController to create versions
- [ ] Update server.js
- [ ] Update plan schema
- [ ] Test enable versioning
- [ ] Test upload multiple versions
- [ ] Test list versions
- [ ] Test delete version
- [ ] Test restore version
- [ ] Update SDK (all languages)
- [ ] Update documentation
- [ ] Add frontend UI for version management

---

**Estimated Time:** 3-4 days full-time development + testing
