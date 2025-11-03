# Hypz SDK - Quick Reference

## Installation

```bash
npm install hypz-cloud-sdk
```

## Setup

```javascript
const { Hypz } = require('hypz-cloud-sdk');

const hypz = new Hypz({
  apiKey: 'hypz_your_api_key_here',
  baseURL: 'http://localhost:5000/api/v1' // optional
});
```

## Buckets

```javascript
// Create
const bucket = await hypz.createBucket({
  name: 'my-bucket',
  visibility: 'public', // or 'private'
  description: 'My bucket'
});

// List
const buckets = await hypz.listBuckets();

// Get
const bucket = await hypz.getBucket('bucket-id');

// Update
const updated = await hypz.updateBucket('bucket-id', {
  description: 'New description'
});

// Delete
await hypz.deleteBucket('bucket-id');
```

## Files

```javascript
// Upload
const file = await hypz.uploadFile('bucket-id', fileOrBuffer, {
  filename: 'image.jpg', // optional, for buffers
  tags: ['photo', 'avatar'],
  metadata: { userId: '123' }
});

// List
const files = await hypz.listFiles('bucket-id', {
  page: 1,
  limit: 20
});

// Get
const file = await hypz.getFile('file-id');

// Download URL
const url = await hypz.getDownloadUrl('file-id');

// Update
const updated = await hypz.updateFile('file-id', {
  tags: ['updated'],
  metadata: { status: 'processed' }
});

// Delete
await hypz.deleteFile('file-id');
```

## Usage

```javascript
// Current usage
const usage = await hypz.getUsage();
console.log(usage.storage_used);
console.log(usage.bandwidth_used);
console.log(usage.files_count);

// History
const history = await hypz.getUsageHistory({
  period: 'month' // day, week, month, year
});
```

## Error Handling

```javascript
import { Hypz, HypzError } from 'hypz-cloud-sdk';

try {
  await hypz.uploadFile('bucket-id', file);
} catch (error) {
  if (error instanceof HypzError) {
    console.error(error.statusCode); // 401, 403, etc.
    console.error(error.message);
    console.error(error.response);
  }
}
```

## Common Errors

- **401**: Invalid or missing API key
- **403**: Permission denied (check API key permissions)
- **404**: Resource not found
- **409**: Resource already exists (e.g., bucket name taken)
- **413**: File too large
- **429**: Rate limit exceeded
- **500**: Server error

## API Key Permissions

When creating an API key, grant these permissions:

- `buckets:read` - List and view buckets
- `buckets:write` - Create and update buckets
- `files:read` - List and view files
- `files:write` - Upload files
- `files:delete` - Delete files
- `usage:read` - View usage statistics

## TypeScript

```typescript
import { Hypz, Bucket, File, Usage } from 'hypz-cloud-sdk';

const hypz = new Hypz({
  apiKey: process.env.HYPZ_API_KEY!
});

const bucket: Bucket = await hypz.createBucket({
  name: 'my-bucket',
  visibility: 'public'
});

const files: File[] = await hypz.listFiles(bucket.id);
const usage: Usage = await hypz.getUsage();
```

## Best Practices

1. **Use environment variables** for API keys
2. **Add .env to .gitignore**
3. **Handle errors gracefully**
4. **Use public buckets** for CDN content
5. **Use private buckets** for sensitive data
6. **Check rate limits** in your plan
7. **Use tags and metadata** for organization

## Complete Example

```javascript
const { Hypz } = require('hypz-cloud-sdk');

const hypz = new Hypz({
  apiKey: process.env.HYPZ_API_KEY,
  baseURL: 'http://localhost:5000/api/v1'
});

async function uploadImage(imageFile) {
  try {
    // 1. Create or get bucket
    let bucket;
    try {
      bucket = await hypz.createBucket({
        name: 'images',
        visibility: 'public'
      });
    } catch (error) {
      if (error.statusCode === 409) {
        // Bucket exists, list to get it
        const buckets = await hypz.listBuckets();
        bucket = buckets.find(b => b.name === 'images');
      } else {
        throw error;
      }
    }

    // 2. Upload file
    const file = await hypz.uploadFile(bucket.id, imageFile, {
      tags: ['image', 'upload'],
      metadata: {
        uploadedAt: new Date().toISOString(),
        originalName: imageFile.name
      }
    });

    console.log('✓ Uploaded:', file.cdn_url);
    return file;

  } catch (error) {
    console.error('Upload failed:', error.message);
    throw error;
  }
}

// Usage
uploadImage(myFile);
```

## Resources

- **NPM Package**: https://www.npmjs.com/package/hypz-cloud-sdk
- **Documentation**: http://localhost:5173/dashboard/documentation
- **API Reference**: Full docs in your dashboard

---

**Happy coding! 🚀**
