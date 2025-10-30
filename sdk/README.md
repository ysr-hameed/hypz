# Hypz Storage SDK

Official JavaScript SDK for Hypz Storage - S3-Compatible Object Storage for India.

## Installation

```bash
npm install @hypz/storage-sdk
```

## Quick Start

```javascript
const Hypz = require('@hypz/storage-sdk');

// Initialize the client with your API key
const client = new Hypz.Client('your-api-key-here');

// Upload a file
const file = await client.files.upload({
  file: './path/to/file.jpg',
  filename: 'my-image.jpg',
  isPublic: false,
  expiresIn: 30, // days (optional)
  metadata: { // optional
    description: 'My uploaded file'
  }
});

console.log('File uploaded:', file.id);
```

## Configuration

```javascript
const client = new Hypz.Client('your-api-key', {
  baseURL: 'https://api.hypz.io/api' // Optional, defaults to localhost
});
```

## API Reference

### Files

#### Upload a File

```javascript
const file = await client.files.upload({
  file: fileBuffer, // Buffer, Stream, or file path
  filename: 'example.jpg',
  isPublic: false, // optional, default: false
  expiresIn: 30, // optional, days
  metadata: {} // optional
});
```

#### List Files

```javascript
const files = await client.files.list({
  limit: 50, // optional, default: 50
  offset: 0 // optional, default: 0
});
```

#### Get File Info

```javascript
const file = await client.files.get(fileId);
```

#### Get Download URL

```javascript
const downloadUrl = await client.files.getDownloadUrl(fileId);
// URL is valid for 1 hour
```

#### Download File

```javascript
const fileBuffer = await client.files.download(fileId);
// Returns file content as Buffer
```

#### Delete File

```javascript
await client.files.delete(fileId);
```

#### Get File Statistics

```javascript
const stats = await client.files.getStats();
// Returns: { totalFiles, totalSize, totalDownloads }
```

### Usage

#### Get Current Usage

```javascript
const usage = await client.usage.getCurrent();
// Returns: { current, limits, percentage, periodStart, periodEnd }
```

#### Get Usage History

```javascript
const history = await client.usage.getHistory({
  limit: 12 // optional, default: 12
});
```

### Billing

#### Get Available Plans

```javascript
const plans = await client.billing.getPlans();
```

#### Get Billing History

```javascript
const history = await client.billing.getHistory({
  limit: 20, // optional
  offset: 0 // optional
});
```

#### Get Billing Stats

```javascript
const stats = await client.billing.getStats();
```

## Examples

### Upload with Progress Tracking

```javascript
const fs = require('fs');

const fileStream = fs.createReadStream('./large-file.mp4');

const file = await client.files.upload({
  file: fileStream,
  filename: 'video.mp4',
  metadata: {
    category: 'videos',
    uploadedBy: 'user123'
  }
});
```

### Batch Operations

```javascript
// Upload multiple files
const files = ['file1.jpg', 'file2.png', 'file3.pdf'];

const uploads = await Promise.all(
  files.map(file => client.files.upload({
    file: file,
    filename: file
  }))
);

console.log(`Uploaded ${uploads.length} files`);
```

### Error Handling

```javascript
try {
  const file = await client.files.upload({
    file: './large-file.mp4',
    filename: 'video.mp4'
  });
} catch (error) {
  if (error.response) {
    // API error
    console.error('API Error:', error.response.data.message);
  } else {
    // Network or other error
    console.error('Error:', error.message);
  }
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (quota exceeded)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Support

- Documentation: https://docs.hypz.io
- Email: support@hypz.io
- GitHub: https://github.com/hypz/storage-sdk

## License

MIT
