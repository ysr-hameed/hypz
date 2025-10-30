# Getting Started with Hypz Storage

Welcome to Hypz Storage! This guide will help you get started with our S3-compatible object storage platform.

## Table of Contents

1. [Create an Account](#create-an-account)
2. [Get Your API Key](#get-your-api-key)
3. [Install SDK](#install-sdk)
4. [Upload Your First File](#upload-your-first-file)
5. [Next Steps](#next-steps)

## Create an Account

1. Visit [https://hypz.io/signup](https://hypz.io/signup)
2. Enter your email, full name, and password
3. Click "Create Account"
4. You'll be automatically logged in with a **Free plan** (1GB storage)

## Get Your API Key

Your API key is needed to authenticate API requests.

1. Login to your dashboard at [https://hypz.io/dashboard](https://hypz.io/dashboard)
2. Your API key is displayed on the dashboard
3. Click "Regenerate" if you need a new key (invalidates the old one)
4. Keep your API key secure - treat it like a password!

## Install SDK

### Node.js/JavaScript

```bash
npm install @hypz/storage-sdk
```

### Python (Coming Soon)

```bash
pip install hypz-storage
```

### Using REST API Directly

You can also use the REST API directly without an SDK. See [API Documentation](api.md).

## Upload Your First File

### Using JavaScript SDK

```javascript
const Hypz = require('@hypz/storage-sdk');

// Initialize client with your API key
const client = new Hypz.Client('your-api-key-here');

async function uploadFile() {
  try {
    // Upload a file
    const file = await client.files.upload({
      file: './path/to/your/file.jpg',
      filename: 'my-first-file.jpg',
      isPublic: false
    });

    console.log('✅ File uploaded successfully!');
    console.log('File ID:', file.id);
    console.log('File name:', file.filename);
    console.log('File size:', file.size, 'bytes');

    // Get download URL
    const downloadUrl = await client.files.getDownloadUrl(file.id);
    console.log('Download URL:', downloadUrl);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

uploadFile();
```

### Using cURL

```bash
curl -X POST https://api.hypz.io/api/files/upload \
  -H "X-API-Key: your-api-key-here" \
  -F "file=@/path/to/your/file.jpg" \
  -F "filename=my-first-file.jpg"
```

### Using Postman

1. Download our [Postman Collection](https://api.hypz.io/postman-collection.json)
2. Import it into Postman
3. Set your API key in the collection variables
4. Try the "Upload File" request

## Next Steps

### Explore the Dashboard

- **Files**: View all your uploaded files
- **Usage**: Monitor your storage, bandwidth, and API usage
- **Billing**: Upgrade your plan for more storage
- **Docs**: Read detailed API documentation

### Common Tasks

#### List Your Files

```javascript
const files = await client.files.list({
  limit: 10,
  offset: 0
});

console.log(`You have ${files.length} files`);
files.forEach(file => {
  console.log(`- ${file.filename} (${file.size} bytes)`);
});
```

#### Download a File

```javascript
// Get signed download URL (valid for 1 hour)
const downloadUrl = await client.files.getDownloadUrl(fileId);

// Or download file content directly
const fileBuffer = await client.files.download(fileId);
```

#### Delete a File

```javascript
await client.files.delete(fileId);
console.log('File deleted successfully');
```

#### Check Your Usage

```javascript
const usage = await client.usage.getCurrent();

console.log('Storage used:', usage.current.storage, 'bytes');
console.log('Storage limit:', usage.limits.storage, 'bytes');
console.log('Usage percentage:', usage.percentage.storage, '%');
```

### Best Practices

1. **Keep your API key secure**
   - Don't commit it to version control
   - Use environment variables
   - Regenerate if compromised

2. **Set file expiration for temporary files**
   ```javascript
   await client.files.upload({
     file: './temp-file.jpg',
     filename: 'temp.jpg',
     expiresIn: 7 // Expires in 7 days
   });
   ```

3. **Use public URLs for public assets**
   ```javascript
   await client.files.upload({
     file: './logo.png',
     filename: 'logo.png',
     isPublic: true
   });
   ```

4. **Monitor your usage regularly**
   - Check dashboard for usage stats
   - Set up alerts for quota limits
   - Upgrade plan before hitting limits

5. **Handle errors gracefully**
   ```javascript
   try {
     await client.files.upload(/* ... */);
   } catch (error) {
     if (error.response?.status === 403) {
       console.error('Storage quota exceeded!');
     } else {
       console.error('Upload failed:', error.message);
     }
   }
   ```

### Integration Examples

#### Express.js File Upload

```javascript
const express = require('express');
const multer = require('multer');
const Hypz = require('@hypz/storage-sdk');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const hypzClient = new Hypz.Client(process.env.HYPZ_API_KEY);

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = await hypzClient.files.upload({
      file: req.file.buffer,
      filename: req.file.originalname
    });
    
    res.json({ success: true, fileId: file.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### React File Upload Component

```javascript
import { useState } from 'react';
import axios from 'axios';

function FileUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        'https://api.hypz.io/api/files/upload',
        formData,
        {
          headers: {
            'X-API-Key': process.env.REACT_APP_HYPZ_API_KEY
          }
        }
      );

      alert('File uploaded: ' + response.data.data.filename);
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
```

### Upgrade Your Plan

Start with the **Free plan** (1GB) and upgrade when you need more:

- **Pro Plan** (₹499/month): 100GB storage, 500GB bandwidth
- **Enterprise Plan** (₹2,999/month): 1TB storage, 5TB bandwidth

Visit [Billing](https://hypz.io/billing) to upgrade.

### Get Help

Need assistance?

- 📖 Read the [API Documentation](api.md)
- ❓ Check the [FAQ](faq.md)
- 📧 Email: support@hypz.io
- 💬 Discord: https://discord.gg/hypz

### Join the Community

- 🐦 Twitter: [@HypzStorage](https://twitter.com/HypzStorage)
- 📱 Discord: [Join our server](https://discord.gg/hypz)
- 💻 GitHub: [Star us on GitHub](https://github.com/hypz/storage)

## Troubleshooting

### "Invalid API Key" Error

- Check that you're using the correct API key
- Make sure there are no extra spaces
- Regenerate your key if needed

### "Storage Quota Exceeded"

- Check your usage in the dashboard
- Delete unnecessary files
- Upgrade to a higher plan

### "Rate Limit Exceeded"

- You've made too many requests
- Wait 15 minutes before retrying
- Upgrade for higher rate limits

### File Upload Fails

- Check file size limits for your plan
- Ensure file is not corrupted
- Verify your internet connection
- Check Backblaze B2 status

---

**Ready to build something amazing? Start uploading now! 🚀**
