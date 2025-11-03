# Hypz SDK for Node.js

Official Node.js SDK for Hypz Cloud Storage - S3-compatible file storage with powerful APIs.

## Installation

```bash
npm install @hypz/sdk
```

## Quick Start

```javascript
const { HypzSDK } = require('@hypz/sdk');

// Initialize the SDK
const hypz = new HypzSDK({
  apiKey: 'your-api-key',
  baseURL: 'https://api.hypz.io/api/v1'
});

// Create a bucket
const bucket = await hypz.buckets.create({
  name: 'my-bucket',
  isPublic: true
});

// Upload a file
const file = await hypz.files.upload({
  bucketId: bucket.id,
  file: fileBuffer,
  fileName: 'example.jpg'
});

console.log('File URL:', file.url);
```

## Features

- 🚀 **Simple & Intuitive API** - Easy to use methods for all operations
- 📦 **Bucket Management** - Create, list, update, and delete buckets
- 📁 **File Operations** - Upload, download, list, and delete files
- 🔑 **API Key Management** - Create and manage API keys
- 📊 **Usage Tracking** - Monitor storage and bandwidth usage
- ⚡ **Promise-based** - Modern async/await support
- 🔒 **Secure** - Built-in authentication and validation

## Documentation

### Initialize SDK

```javascript
const { HypzSDK } = require('@hypz/sdk');

const hypz = new HypzSDK({
  apiKey: 'your-api-key',
  baseURL: 'https://api.hypz.io/api/v1' // optional, defaults to production
});
```

### Bucket Operations

#### Create Bucket
```javascript
const bucket = await hypz.buckets.create({
  name: 'my-bucket',
  isPublic: true
});
```

#### List Buckets
```javascript
const buckets = await hypz.buckets.list();
```

#### Get Bucket Details
```javascript
const bucket = await hypz.buckets.get(bucketId);
```

#### Update Bucket
```javascript
const updated = await hypz.buckets.update(bucketId, {
  name: 'new-name',
  isPublic: false
});
```

#### Delete Bucket
```javascript
await hypz.buckets.delete(bucketId);
```

### File Operations

#### Upload File
```javascript
const file = await hypz.files.upload({
  bucketId: 'bucket-id',
  file: fileBuffer,
  fileName: 'photo.jpg'
});
```

#### List Files
```javascript
const files = await hypz.files.list(bucketId);
```

#### Get File Details
```javascript
const file = await hypz.files.get(fileId);
```

#### Download File
```javascript
const fileData = await hypz.files.download(fileId);
```

#### Delete File
```javascript
await hypz.files.delete(fileId);
```

### API Key Management

#### Create API Key
```javascript
const apiKey = await hypz.apiKeys.create({
  name: 'Production Key',
  permissions: ['files:read', 'files:write']
});
```

#### List API Keys
```javascript
const keys = await hypz.apiKeys.list();
```

#### Revoke API Key
```javascript
await hypz.apiKeys.revoke(keyId);
```

### Usage Tracking

#### Get Current Usage
```javascript
const usage = await hypz.usage.getCurrent();
console.log('Storage used:', usage.storageUsed);
console.log('Bandwidth used:', usage.bandwidthUsed);
```

#### Get Usage History
```javascript
const history = await hypz.usage.getHistory();
```

## Error Handling

The SDK throws `HypzError` for API errors:

```javascript
const { HypzSDK, HypzError } = require('@hypz/sdk');

try {
  const file = await hypz.files.upload({
    bucketId: 'invalid-id',
    file: buffer,
    fileName: 'test.jpg'
  });
} catch (error) {
  if (error instanceof HypzError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Response:', error.response);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Support

The SDK includes TypeScript definitions. Import types:

```typescript
import { HypzSDK, HypzError, BucketOptions, FileUploadOptions } from '@hypz/sdk';
```

## Examples

### Upload Multiple Files

```javascript
const files = ['file1.jpg', 'file2.png', 'file3.pdf'];

for (const fileName of files) {
  const buffer = fs.readFileSync(fileName);
  const uploaded = await hypz.files.upload({
    bucketId: 'my-bucket-id',
    file: buffer,
    fileName
  });
  console.log(`Uploaded: ${uploaded.url}`);
}
```

### Create Public Gallery

```javascript
// Create public bucket
const gallery = await hypz.buckets.create({
  name: 'photo-gallery',
  isPublic: true
});

// Upload images
const images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
const uploadedFiles = [];

for (const image of images) {
  const buffer = fs.readFileSync(image);
  const file = await hypz.files.upload({
    bucketId: gallery.id,
    file: buffer,
    fileName: image
  });
  uploadedFiles.push(file);
}

console.log('Gallery created:', uploadedFiles.map(f => f.url));
```

### Monitor Storage Usage

```javascript
const checkUsage = async () => {
  const usage = await hypz.usage.getCurrent();
  const storageGB = (usage.storageUsed / 1024 / 1024 / 1024).toFixed(2);
  const bandwidthGB = (usage.bandwidthUsed / 1024 / 1024 / 1024).toFixed(2);
  
  console.log(`Storage: ${storageGB} GB`);
  console.log(`Bandwidth: ${bandwidthGB} GB`);
  
  if (usage.storageUsed > usage.storageLimit * 0.9) {
    console.warn('⚠️ Storage limit nearly reached!');
  }
};

// Check every hour
setInterval(checkUsage, 60 * 60 * 1000);
```

## Support

- 📧 Email: support@hypz.io
- 💬 Discord: [Join our community](https://discord.gg/hypz)
- 📚 Docs: [https://docs.hypz.io](https://docs.hypz.io)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/hypz-sdk/issues)

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
