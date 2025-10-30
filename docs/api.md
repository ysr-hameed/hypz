# API Documentation

## Base URL

```
Production: https://api.hypz.io/api
Development: http://localhost:5000/api
```

## Authentication

All API requests (except registration and login) require authentication using one of the following methods:

### 1. API Key (Recommended for SDK)

```http
X-API-Key: your-api-key-here
```

### 2. JWT Token

```http
Authorization: Bearer your-jwt-token
```

## Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": { /* Response data */ }
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/missing credentials |
| 403 | Forbidden - Quota exceeded |
| 404 | Not Found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## Authentication Endpoints

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "plan": "free",
      "apiKey": "hypz_xxxxxxxxxx"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Login

Authenticate and get access token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* User object */ },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Get Profile

Get authenticated user's profile.

**Endpoint:** `GET /auth/profile`

**Headers:** Requires authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "plan": "free",
    "apiKey": "hypz_xxxxxxxxxx",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Regenerate API Key

Generate a new API key (invalidates old key).

**Endpoint:** `POST /auth/regenerate-api-key`

**Headers:** Requires authentication

**Response:**
```json
{
  "success": true,
  "message": "API key regenerated successfully",
  "data": {
    "apiKey": "hypz_newkey123456"
  }
}
```

---

## File Endpoints

### Upload File

Upload a new file to storage.

**Endpoint:** `POST /files/upload`

**Headers:**
- Requires authentication
- `Content-Type: multipart/form-data`

**Form Data:**
- `file` (required): File to upload
- `isPublic` (optional): Boolean, default false
- `expiresIn` (optional): Number of days until expiration
- `metadata` (optional): JSON string with additional data

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "uuid",
    "filename": "image.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "isPublic": false,
    "expiresAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### List Files

Get list of uploaded files.

**Endpoint:** `GET /files`

**Headers:** Requires authentication

**Query Parameters:**
- `limit` (optional): Number of files to return (default: 50)
- `offset` (optional): Number of files to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "image.jpg",
      "size": 1024000,
      "mimeType": "image/jpeg",
      "isPublic": false,
      "downloadCount": 5,
      "expiresAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0
  }
}
```

### Get File Info

Get details of a specific file.

**Endpoint:** `GET /files/:fileId`

**Headers:** Requires authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "image.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "isPublic": false,
    "downloadCount": 5,
    "expiresAt": null,
    "metadata": {},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Download File

Get a signed URL to download a file.

**Endpoint:** `GET /files/:fileId/download`

**Headers:** Authentication optional (required for private files)

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://signed-url.backblazeb2.com/...",
    "filename": "image.jpg",
    "expiresIn": 3600
  }
}
```

### Delete File

Delete a file permanently.

**Endpoint:** `DELETE /files/:fileId`

**Headers:** Requires authentication

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Get File Statistics

Get statistics about your files.

**Endpoint:** `GET /files/stats/summary`

**Headers:** Requires authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFiles": 50,
    "totalSize": 52428800,
    "totalDownloads": 250
  }
}
```

---

## Usage Endpoints

### Get Current Usage

Get current usage statistics for the billing period.

**Endpoint:** `GET /usage/current`

**Headers:** Requires authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "current": {
      "storage": 52428800,
      "bandwidth": 104857600,
      "apiCalls": 150
    },
    "limits": {
      "storage": 1073741824,
      "bandwidth": 5368709120,
      "apiCalls": 1000,
      "maxFileSize": 52428800
    },
    "percentage": {
      "storage": "4.88",
      "bandwidth": "1.95",
      "apiCalls": "15.00"
    },
    "periodStart": "2024-01-01T00:00:00.000Z",
    "periodEnd": null
  }
}
```

### Get Usage History

Get historical usage data.

**Endpoint:** `GET /usage/history`

**Headers:** Requires authentication

**Query Parameters:**
- `limit` (optional): Number of records (default: 12)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "storage": 52428800,
      "bandwidth": 104857600,
      "apiCalls": 150,
      "periodStart": "2024-01-01T00:00:00.000Z",
      "periodEnd": "2024-02-01T00:00:00.000Z"
    }
  ]
}
```

---

## Billing Endpoints

### Get Plans

Get available pricing plans.

**Endpoint:** `GET /billing/plans`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "currency": "INR",
      "features": {
        "storage": 1073741824,
        "bandwidth": 5368709120,
        "maxFileSize": 52428800,
        "apiCalls": 1000
      }
    }
  ]
}
```

### Create Payment Order

Create a Razorpay order for plan upgrade.

**Endpoint:** `POST /billing/create-order`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "plan": "pro"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxxxx",
    "amount": 49900,
    "currency": "INR",
    "billingId": "uuid",
    "razorpayKeyId": "rzp_xxxxx"
  }
}
```

### Verify Payment

Verify Razorpay payment.

**Endpoint:** `POST /billing/verify-payment`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "razorpayOrderId": "order_xxxxx",
  "razorpayPaymentId": "pay_xxxxx",
  "razorpaySignature": "signature_xxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "plan": "pro"
  }
}
```

### Get Billing History

Get payment transaction history.

**Endpoint:** `GET /billing/history`

**Headers:** Requires authentication

**Query Parameters:**
- `limit` (optional): Number of records (default: 20)
- `offset` (optional): Number to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "plan": "pro",
      "amount": 499,
      "currency": "INR",
      "status": "completed",
      "razorpayOrderId": "order_xxxxx",
      "razorpayPaymentId": "pay_xxxxx",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Rate Limits

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- File Upload: 50 uploads per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## SDKs

Official SDKs are available for:
- JavaScript/Node.js: `@hypz/storage-sdk`
- Python: Coming soon
- PHP: Coming soon

## Postman Collection

Download our Postman collection for easy API testing:
[Download Collection](https://api.hypz.io/postman-collection.json)

## Support

Need help? Contact us:
- Email: support@hypz.io
- Discord: https://discord.gg/hypz
- GitHub: https://github.com/hypz/storage
