# 🚀 Quick API Reference - New Features

## All 41 New Endpoints

### 📦 Object Versioning (6 endpoints)
```
PUT    /api/v1/versioning/buckets/:id/versioning          # Enable/suspend versioning
GET    /api/v1/versioning/buckets/:id/versioning          # Get versioning status
GET    /api/v1/versioning/buckets/:id/versions            # List all object versions
GET    /api/v1/versioning/objects/:fileId/version/:versionId  # Get specific version
DELETE /api/v1/versioning/objects/:fileId/version/:versionId  # Delete version permanently
POST   /api/v1/versioning/objects/:fileId/restore/:versionId  # Restore old version
```

### 💾 Storage Classes (6 endpoints)
```
POST   /api/v1/storage-classes                            # Create custom storage class
GET    /api/v1/storage-classes                            # List all storage classes
PUT    /api/v1/storage-classes/:id                        # Update storage class
DELETE /api/v1/storage-classes/:id                        # Delete storage class
PUT    /api/v1/files/:fileId/storage-class                # Change file storage class
POST   /api/v1/files/:fileId/restore                      # Restore from archive
```

### 📤 Multipart Upload (7 endpoints)
```
POST   /api/v1/multipart/initiate                         # Initiate multipart upload
POST   /api/v1/multipart/:uploadId/upload-part            # Upload a part
POST   /api/v1/multipart/:uploadId/complete               # Complete multipart upload
DELETE /api/v1/multipart/:uploadId/abort                  # Abort multipart upload
GET    /api/v1/multipart/:uploadId/parts                  # List uploaded parts
GET    /api/v1/multipart/uploads                          # List in-progress uploads
POST   /api/v1/multipart/:uploadId/copy-part              # Copy part from existing object
```

### 🔄 Lifecycle Policies (3 endpoints)
```
PUT    /api/v1/lifecycle/buckets/:id/lifecycle            # Configure lifecycle rules
GET    /api/v1/lifecycle/buckets/:id/lifecycle            # Get lifecycle configuration
DELETE /api/v1/lifecycle/buckets/:id/lifecycle            # Delete lifecycle rules
```

### 📡 Event Notifications (6 endpoints)
```
POST   /api/v1/events/subscriptions                       # Create webhook subscription
GET    /api/v1/events/subscriptions                       # List subscriptions
GET    /api/v1/events/subscriptions/:id                   # Get subscription details
PUT    /api/v1/events/subscriptions/:id                   # Update subscription
DELETE /api/v1/events/subscriptions/:id                   # Delete subscription
GET    /api/v1/events/subscriptions/:id/deliveries        # List webhook deliveries
```

### 🌐 Per-Bucket CORS (3 endpoints)
```
PUT    /api/v1/cors/buckets/:id/cors                      # Set CORS configuration
GET    /api/v1/cors/buckets/:id/cors                      # Get CORS configuration
DELETE /api/v1/cors/buckets/:id/cors                      # Delete CORS configuration
```

### 🔐 Bucket Policies (3 endpoints)
```
PUT    /api/v1/policies/buckets/:id/policy                # Set bucket policy
GET    /api/v1/policies/buckets/:id/policy                # Get bucket policy
DELETE /api/v1/policies/buckets/:id/policy                # Delete bucket policy
```

### ✍️ Pre-signed POST (2 endpoints)
```
POST   /api/v1/presigned/generate                         # Generate pre-signed POST URL
POST   /api/v1/presigned/upload/:bucketSlug               # Upload via pre-signed POST
```

### 📦 Batch Operations (5 endpoints)
```
POST   /api/v1/batch/jobs                                 # Create batch job
GET    /api/v1/batch/jobs/:id                             # Get batch job status
GET    /api/v1/batch/jobs                                 # List batch jobs
POST   /api/v1/batch/jobs/:id/cancel                      # Cancel batch job
GET    /api/v1/batch/jobs/:id/operations                  # List job operations
```

---

## Authentication

All endpoints require authentication via JWT token:
```bash
Authorization: Bearer <JWT_TOKEN>
```

Get token via login:
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

---

## Quick Examples

### 1. Enable Versioning
```bash
curl -X PUT http://localhost:5000/api/v1/versioning/buckets/{bucketId}/versioning \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Enabled"}'
```

### 2. Create Event Subscription
```bash
curl -X POST http://localhost:5000/api/v1/events/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bucketId": "bucket-uuid",
    "webhookUrl": "https://webhook.site/unique-url",
    "events": ["s3:ObjectCreated:*"]
  }'
```

### 3. Set Lifecycle Policy
```bash
curl -X PUT http://localhost:5000/api/v1/lifecycle/buckets/{bucketId}/lifecycle \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rules": [{
      "name": "archive-old-files",
      "status": "enabled",
      "filter": {"prefix": "logs/"},
      "transitions": [{"days": 30, "storageClass": "GLACIER"}],
      "expiration": {"days": 90}
    }]
  }'
```

### 4. Configure CORS
```bash
curl -X PUT http://localhost:5000/api/v1/cors/buckets/{bucketId}/cors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "allowedOrigins": ["https://example.com"],
    "allowedMethods": ["GET", "POST"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 3600
  }'
```

### 5. Create Batch Job
```bash
curl -X POST http://localhost:5000/api/v1/batch/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bucketId": "bucket-uuid",
    "operation": "delete",
    "filters": {"prefix": "temp/"},
    "priority": 5
  }'
```

### 6. Generate Pre-signed POST
```bash
curl -X POST http://localhost:5000/api/v1/presigned/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bucketSlug": "my-bucket",
    "key": "upload.jpg",
    "expiresIn": 3600,
    "conditions": {"maxSizeMB": 10}
  }'
```

---

## Response Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `500 Internal Server Error` - Server error

---

## Rate Limits (Plan-based)

- **Free**: 5 req/s
- **Basic**: 10 req/s
- **Pro**: 50 req/s
- **Business**: 100 req/s
- **Enterprise**: 200 req/s
- **PAYG**: 50 req/s

---

## Permissions Required

| Feature | Permission |
|---------|-----------|
| Versioning | `versioning` |
| Storage Classes | `storage_classes` |
| Multipart Upload | `multipart_upload` |
| Lifecycle | `lifecycle_policies` |
| Events | `webhooks` |
| CORS | `cors` |
| Policies | `bucket_policies` |
| Pre-signed POST | `presigned_post` |
| Batch Ops | `batch_operations` |

Check your plan's permissions:
```bash
GET /api/v1/users/me
```

---

## Server Status

Check if all features are loaded:
```bash
GET http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "endpoints": 121,
  "features": [
    "versioning",
    "storage-classes",
    "multipart",
    "lifecycle",
    "events",
    "cors",
    "policies",
    "presigned",
    "batch"
  ]
}
```

---

## Testing Script

Run comprehensive tests:
```bash
cd backend
chmod +x test-new-features.sh

# Edit script to set:
# - TOKEN="your-jwt-token"
# - BUCKET_ID="your-bucket-uuid"
# - BUCKET_SLUG="your-bucket-slug"

./test-new-features.sh
```

---

## Documentation

- **Full Feature Guide**: `/NEW_FEATURES_SUMMARY.md`
- **Implementation Progress**: `/IMPLEMENTATION_PROGRESS.md`
- **Multipart Guide**: `/IMPLEMENTATION_GUIDE_MULTIPART.md`
- **Versioning Guide**: `/IMPLEMENTATION_GUIDE_VERSIONING.md`

---

## Need Help?

1. Check server logs: `npm start` in `/backend`
2. Verify database: `node src/database/migrate.js`
3. Test endpoint: Use curl examples above
4. Check permissions: Ensure plan supports feature

---

**🎉 All 41 endpoints are production-ready!**
