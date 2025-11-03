# Hypz Cloud Storage SDK

Official SDKs for [Hypz Cloud Storage](https://hypz.io) - S3-compatible cloud storage made simple.

Available in **JavaScript/TypeScript** and **Python** 🎉

[![npm version](https://badge.fury.io/js/hypz-cloud-sdk.svg)](https://www.npmjs.com/package/hypz-cloud-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Available SDKs

### 🟨 JavaScript/TypeScript SDK (This Directory)
Full-featured SDK for Node.js and browser environments.

### 🐍 Python SDK ([See python/ folder](./python/))
Full-featured Python client for server-side applications. [Get Started →](./python/QUICKSTART.md)

## Features

✨ **Easy to Use** - Simple, intuitive API
🔐 **Secure** - API key authentication
📦 **TypeScript Support** - Full type definitions included (JS SDK)
🐍 **Python Support** - NEW! Full-featured Python SDK
🚀 **Fast** - Built on Axios (JS) / Requests (Python) for optimal performance
🌐 **Universal** - Works in Browser and Node.js (JS) / Python 3.7+ (Python)
📝 **Well Documented** - Comprehensive guides and examples

## Installation

### JavaScript/TypeScript

```bash
npm install hypz-cloud-sdk
```

Or with yarn:

```bash
yarn add hypz-cloud-sdk
```

### Python

```bash
cd python
pip install -e .
```

Or install requirements only:

```bash
pip install requests>=2.25.0
```

## Quick Start

### JavaScript/TypeScript

#### 1. Get Your API Key

Sign up at [hypz.io](https://hypz.io) and create an API key from your dashboard.

#### 2. Initialize the SDK

```javascript
const { Hypz } = require('hypz-cloud-sdk');

const hypz = new Hypz({
  apiKey: 'your_api_key_here',
  baseURL: 'https://api.hypz.io/api/v1' // Optional
});
```

Or with ES6/TypeScript:

```typescript
import { Hypz } from 'hypz-cloud-sdk';

const hypz = new Hypz({
  apiKey: process.env.HYPZ_API_KEY,
});
```

### 3. Start Using It!

```javascript
// Create a bucket
const bucket = await hypz.createBucket({
  name: 'my-app-uploads',
  visibility: 'public',
  description: 'User uploads for my app'
});

// Upload a file
const file = await hypz.uploadFile(bucket.id, fileInput.files[0], {
  tags: ['avatar', 'profile'],
  metadata: { userId: '123' }
});

console.log('File uploaded:', file.url);
```

### Python

#### 1. Get Your API Key

Create an API key from your dashboard at http://localhost:5173

#### 2. Initialize the SDK

```python
from hypz import HypzClient

# Initialize client
client = HypzClient(api_key='your_api_key_here')
```

#### 3. Create a Bucket

```python
bucket = client.buckets.create(
    name='my-bucket',
    description='My first bucket',
    visibility='private'
)
```

#### 4. Upload Files

```python
# Upload from file path
file = client.files.upload(
    bucket_id=bucket['id'],
    file_path='./photo.jpg',
    is_public=False,
    tags=['photo', 'vacation'],
    metadata={'location': 'Paris'}
)

print(f"File uploaded: {file['url']}")
```

**👉 For complete Python SDK documentation, see [python/README.md](./python/README.md)**

**👉 For Python quick start, see [python/QUICKSTART.md](./python/QUICKSTART.md)**

## API Reference

### Buckets

#### Create Bucket

```javascript
const bucket = await hypz.createBucket({
  name: 'my-bucket',
  visibility: 'public', // 'public' or 'private'
  description: 'Optional description',
  region: 'us-east-1' // Optional
});
```

#### List Buckets

```javascript
const buckets = await hypz.listBuckets({
  page: 1,
  limit: 20,
  search: 'my-bucket'
});
```

#### Get Bucket

```javascript
const bucket = await hypz.getBucket('bucket-id');
```

#### Update Bucket

```javascript
const updated = await hypz.updateBucket('bucket-id', {
  description: 'New description',
  visibility: 'private'
});
```

#### Delete Bucket

```javascript
await hypz.deleteBucket('bucket-id');
```

### Files

#### Upload File

**Browser:**

```javascript
const fileInput = document.querySelector('input[type="file"]');
const file = await hypz.uploadFile('bucket-id', fileInput.files[0], {
  tags: ['photo', 'profile'],
  metadata: {
    userId: '123',
    category: 'avatar'
  }
});
```

**Node.js:**

```javascript
const fs = require('fs');
const fileBuffer = fs.readFileSync('./image.jpg');

const file = await hypz.uploadFile('bucket-id', fileBuffer, {
  filename: 'image.jpg',
  tags: ['photo']
});
```

#### List Files

```javascript
const files = await hypz.listFiles('bucket-id', {
  page: 1,
  limit: 50,
  search: 'avatar'
});

files.forEach(file => {
  console.log(file.original_name, file.url);
});
```

#### Get File

```javascript
const file = await hypz.getFile('file-id');
console.log(file.url, file.cdn_url);
```

#### Download File

```javascript
const downloadUrl = await hypz.getDownloadUrl('file-id');

// Browser
window.location.href = downloadUrl;

// Node.js
const response = await fetch(downloadUrl);
const buffer = await response.buffer();
fs.writeFileSync('./downloaded.jpg', buffer);
```

#### Update File Metadata

```javascript
const updated = await hypz.updateFile('file-id', {
  tags: ['new-tag'],
  metadata: { category: 'updated' }
});
```

#### Delete File

```javascript
await hypz.deleteFile('file-id');
```

### Usage

#### Get Current Usage

```javascript
const usage = await hypz.getUsage();

console.log('Storage Used:', usage.storage_used);
console.log('Bandwidth Used:', usage.bandwidth_used);
console.log('API Calls:', usage.api_calls);
console.log('Files Count:', usage.files_count);
```

#### Get Usage History

```javascript
const history = await hypz.getUsageHistory({
  period: 'month' // 'day', 'week', 'month', 'year'
});
```

## Complete Examples

### Upload and Share Image

```javascript
const { Hypz } = require('hypz-cloud-sdk');

const hypz = new Hypz({ apiKey: process.env.HYPZ_API_KEY });

async function uploadAndShare() {
  // Create bucket
  const bucket = await hypz.createBucket({
    name: 'shared-images',
    visibility: 'public'
  });

  // Upload file
  const fileInput = document.querySelector('#fileInput');
  const file = await hypz.uploadFile(bucket.id, fileInput.files[0], {
    tags: ['shared', 'public']
  });

  // Share URL
  console.log('Share this URL:', file.cdn_url);
  
  return file.cdn_url;
}

uploadAndShare();
```

### Backup Files from Local Directory

```javascript
const { Hypz } = require('hypz-cloud-sdk');
const fs = require('fs');
const path = require('path');

const hypz = new Hypz({ apiKey: process.env.HYPZ_API_KEY });

async function backupDirectory(dirPath, bucketName) {
  // Create backup bucket
  const bucket = await hypz.createBucket({
    name: bucketName,
    visibility: 'private',
    description: `Backup of ${dirPath}`
  });

  // Get all files
  const files = fs.readdirSync(dirPath);

  // Upload each file
  for (const filename of files) {
    const filePath = path.join(dirPath, filename);
    const fileBuffer = fs.readFileSync(filePath);

    const uploaded = await hypz.uploadFile(bucket.id, fileBuffer, {
      filename: filename,
      metadata: {
        originalPath: filePath,
        backupDate: new Date().toISOString()
      }
    });

    console.log(`✓ Backed up: ${filename}`);
  }

  console.log(`✅ Backup complete! ${files.length} files uploaded`);
}

backupDirectory('./my-documents', 'documents-backup');
```

### Image CDN with Automatic Tagging

```javascript
const { Hypz } = require('hypz-cloud-sdk');

const hypz = new Hypz({ apiKey: process.env.HYPZ_API_KEY });

async function uploadWithSmartTags(file, category) {
  // Create/get bucket
  let bucket;
  try {
    bucket = await hypz.createBucket({
      name: 'image-cdn',
      visibility: 'public'
    });
  } catch (error) {
    // Bucket already exists
    const buckets = await hypz.listBuckets({ search: 'image-cdn' });
    bucket = buckets[0];
  }

  // Auto-generate tags
  const tags = [
    category,
    file.type.startsWith('image/') ? 'image' : 'file',
    new Date().getFullYear().toString()
  ];

  // Upload with metadata
  const uploaded = await hypz.uploadFile(bucket.id, file, {
    tags: tags,
    metadata: {
      uploadedBy: 'user-123',
      category: category,
      originalSize: file.size
    }
  });

  return uploaded.cdn_url;
}

// Usage
const imageUrl = await uploadWithSmartTags(fileInput.files[0], 'profile-pictures');
```

## Error Handling

```javascript
try {
  const file = await hypz.uploadFile('bucket-id', file);
  console.log('Success:', file.url);
} catch (error) {
  if (error instanceof Hypz.HypzError) {
    console.error('Status:', error.statusCode);
    console.error('Message:', error.message);
    console.error('Response:', error.response);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import { Hypz, Bucket, File, Usage, HypzError } from 'hypz-cloud-sdk';

const hypz = new Hypz({
  apiKey: process.env.HYPZ_API_KEY!
});

// Full type inference
const bucket: Bucket = await hypz.createBucket({
  name: 'typed-bucket',
  visibility: 'public'
});

const files: File[] = await hypz.listFiles(bucket.id);
```

## Configuration

```javascript
const hypz = new Hypz({
  apiKey: 'your_api_key',           // Required
  baseURL: 'https://api.hypz.io',   // Optional, default shown
  timeout: 30000                     // Optional, default 30s
});
```

## Best Practices

### 1. Store API Keys Securely

```javascript
// ✅ Good - Use environment variables
const hypz = new Hypz({
  apiKey: process.env.HYPZ_API_KEY
});

// ❌ Bad - Hardcoded
const hypz = new Hypz({
  apiKey: 'hypz_abc123...'
});
```

### 2. Handle Errors Gracefully

```javascript
try {
  await hypz.uploadFile(bucketId, file);
} catch (error) {
  if (error.statusCode === 401) {
    // Handle authentication error
  } else if (error.statusCode === 403) {
    // Handle permission error
  } else {
    // Handle other errors
  }
}
```

### 3. Use Public Buckets for CDN

```javascript
// For public files (images, videos, etc.)
const publicBucket = await hypz.createBucket({
  name: 'cdn-assets',
  visibility: 'public'  // Files are publicly accessible
});

// For private files (documents, user data, etc.)
const privateBucket = await hypz.createBucket({
  name: 'user-documents',
  visibility: 'private'  // Requires authentication
});
```

## Support

- 📚 [Documentation](https://hypz.io/docs)
- 💬 [Discord Community](https://discord.gg/hypz)
- 🐛 [Issue Tracker](https://github.com/ysr-hameed/hypz/issues)
- 📧 [Email Support](mailto:support@hypz.io)

## License

MIT © Hypz Team

---

Made with ❤️ by the Hypz team
