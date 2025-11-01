# 📚 Hypz Storage API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

All authenticated endpoints require either:
- **JWT Token** in Authorization header: `Bearer <token>`
- **API Key** in header: `X-API-Key: <key>` or query: `?api_key=<key>`

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": false
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Login

**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true,
      "planId": "free_global",
      "role": "user"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Verify Email

**POST** `/auth/verify-email`

Verify email address with token from email.

**Request Body:**
```json
{
  "token": "verification-token"
}
```

**Response:** `200 OK`

### Resend Verification Email

**POST** `/auth/resend-verification`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Forgot Password

**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Reset Password

**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewSecurePass123"
}
```

### Get Current User

**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true,
    "planId": "free_global",
    "avatarUrl": null,
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Logout

**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

---

## 🗂️ Bucket Endpoints

### Create Bucket

**POST** `/buckets`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "my-bucket",
  "visibility": "private",
  "description": "My storage bucket",
  "region": "us-east-1"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Bucket created successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "my-bucket",
    "slug": "my-bucket-abc123",
    "visibility": "private",
    "description": "My storage bucket",
    "region": "us-east-1",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get All Buckets

**GET** `/buckets?page=1&limit=10&search=keyword`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "buckets": [
      {
        "id": "uuid",
        "name": "my-bucket",
        "slug": "my-bucket-abc123",
        "visibility": "private",
        "file_count": "10",
        "total_size": "1048576",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Get Bucket Details

**GET** `/buckets/:bucketId`

**Headers:** `Authorization: Bearer <token>`

### Update Bucket

**PUT** `/buckets/:bucketId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "updated-bucket-name",
  "visibility": "public",
  "description": "Updated description"
}
```

### Delete Bucket

**DELETE** `/buckets/:bucketId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Get Bucket Statistics

**GET** `/buckets/:bucketId/stats`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_files": "25",
    "total_size": "52428800",
    "total_downloads": "150",
    "active_days": "10",
    "typeDistribution": [
      {
        "mime_type": "image/jpeg",
        "count": "15",
        "size": "31457280"
      }
    ]
  }
}
```

---

## 📁 File Endpoints

### Upload File

**POST** `/files/:bucketId/upload`

**Headers:** 
- `Authorization: Bearer <token>` OR `X-API-Key: <key>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file` (required): File to upload
- `isPublic` (optional): boolean
- `tags` (optional): array of strings
- `metadata` (optional): JSON object

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "uuid",
    "bucket_id": "uuid",
    "filename": "image_1234567890_abc.jpg",
    "original_name": "image.jpg",
    "size": 1048576,
    "mime_type": "image/jpeg",
    "url": "/uploads/user-id/filename.jpg",
    "cdn_url": "https://cdn.hypz.io/uploads/user-id/filename.jpg",
    "is_public": false,
    "formattedSize": "1 MB",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get Files in Bucket

**GET** `/files/:bucketId/files?page=1&limit=20&search=keyword&sortBy=created_at&order=DESC`

**Headers:** `Authorization: Bearer <token>` OR `X-API-Key: <key>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional)
- `sortBy` (created_at, filename, size, downloads)
- `order` (ASC, DESC)

**Response:** `200 OK`

### Get File Details

**GET** `/files/file/:fileId`

**Headers:** `Authorization: Bearer <token>` OR `X-API-Key: <key>`

### Download File

**GET** `/files/file/:fileId/download`

**Headers:** `Authorization: Bearer <token>` OR `X-API-Key: <key>`

**Response:** File download

### Delete File

**DELETE** `/files/file/:fileId`

**Headers:** `Authorization: Bearer <token>` OR `X-API-Key: <key>`

### Update File Metadata

**PATCH** `/files/file/:fileId`

**Headers:** `Authorization: Bearer <token>` OR `X-API-Key: <key>`

**Request Body:**
```json
{
  "isPublic": true,
  "tags": ["image", "profile"],
  "metadata": {
    "category": "avatars",
    "processed": true
  }
}
```

---

## 🔑 API Key Endpoints

### Create API Key

**POST** `/api-keys`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Production API Key",
  "permissions": {
    "read": true,
    "write": true,
    "delete": false
  },
  "rateLimit": 1000,
  "expiresIn": 365
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "API key created successfully",
  "data": {
    "id": "uuid",
    "name": "Production API Key",
    "key_prefix": "sk_live_abc...",
    "apiKey": "sk_live_abcdefghijklmnopqrstuvwxyz123456",
    "permissions": {
      "read": true,
      "write": true,
      "delete": false
    },
    "rate_limit": 1000,
    "expires_at": "2025-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "warning": "Please save this API key securely. You will not be able to see it again."
  }
}
```

### Get All API Keys

**GET** `/api-keys`

**Headers:** `Authorization: Bearer <token>`

### Get API Key Details

**GET** `/api-keys/:keyId`

**Headers:** `Authorization: Bearer <token>`

### Update API Key

**PUT** `/api-keys/:keyId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Key Name",
  "isActive": true,
  "rateLimit": 2000
}
```

### Delete API Key

**DELETE** `/api-keys/:keyId`

**Headers:** `Authorization: Bearer <token>`

### Regenerate API Key

**POST** `/api-keys/:keyId/regenerate`

**Headers:** `Authorization: Bearer <token>`

**Response:** Returns new API key (save it!)

---

## 📊 Usage Endpoints

### Get Current Usage

**GET** `/usage/current`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "today": {
      "storage_bytes": 52428800,
      "bandwidth_bytes": 104857600,
      "api_calls": 150,
      "storage": "50 MB",
      "bandwidth": "100 MB"
    },
    "month": {
      "storage_bytes": 524288000,
      "bandwidth_bytes": 1073741824,
      "api_calls": 5000,
      "storage": "500 MB",
      "bandwidth": "1 GB"
    }
  }
}
```

### Get Usage History

**GET** `/usage/history?days=30`

**Headers:** `Authorization: Bearer <token>`

### Get Usage Analytics

**GET** `/usage/analytics`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": {
      "active_days": 25,
      "total_api_calls": 15000,
      "totalBandwidth": "5 GB",
      "avgDailyBandwidth": "200 MB"
    },
    "bucketUsage": [...],
    "fileTypes": [...]
  }
}
```

---

## 🚨 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## 🔒 Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Upload**: 50 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## 📝 Examples with cURL

### Complete Workflow Example

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123","firstName":"John","lastName":"Doe"}' \
  | jq -r '.data.token')

# 2. Create Bucket
BUCKET_ID=$(curl -s -X POST http://localhost:5000/api/v1/buckets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-bucket","visibility":"private"}' \
  | jq -r '.data.id')

# 3. Upload File
curl -X POST "http://localhost:5000/api/v1/files/$BUCKET_ID/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/file.jpg"

# 4. Create API Key
curl -X POST http://localhost:5000/api/v1/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My API Key"}'

# 5. Check Usage
curl -X GET http://localhost:5000/api/v1/usage/current \
  -H "Authorization: Bearer $TOKEN"
```

---

**For more information, see the [README.md](./README.md)**
