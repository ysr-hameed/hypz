import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  CodeBracketIcon, 
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  TrashIcon,
  FolderIcon,
  KeyIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  CommandLineIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  FolderPlusIcon,
  ArrowsRightLeftIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import apiConfig from '../config/api';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeLanguage, setActiveLanguage] = useState('javascript');
  
  // Get the actual API URL from config
  const API_BASE_URL = apiConfig.API_URL;
  const APP_BASE_URL = API_BASE_URL.replace(/\/api\/v\d+$/i, '');
  const LAST_UPDATED = new Date().toISOString().split('T')[0];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Hypz Object Storage API Documentation',
    description: 'Complete API documentation for Hypz object storage with code examples in JavaScript, Python, Java, and cURL.',
    inLanguage: 'en-US',
    datePublished: LAST_UPDATED,
    dateModified: LAST_UPDATED,
    author: {
      '@type': 'Organization',
      name: 'Hypz',
      url: APP_BASE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hypz',
      url: APP_BASE_URL
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${APP_BASE_URL}/documentation`
    }
  };

  useEffect(() => {
    // Scroll spy - highlight active section based on scroll position
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let currentSection = 'getting-started';
      let minDistance = Infinity;
      
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - 150);
        
        // Find the section closest to the top of viewport (with header offset)
        if (rect.top <= 200 && distance < minDistance) {
          minDistance = distance;
          const sectionId = section.getAttribute('data-section');
          
          // Check if it's a subsection, if so set parent section as active
          sections.forEach(s => {
            const subsections = s.querySelectorAll('[data-section]');
            subsections.forEach(sub => {
              if (sub.getAttribute('data-section') === sectionId) {
                // Found parent, use the main section id
                currentSection = s.getAttribute('data-section') || sectionId;
                return;
              }
            });
          });
          
          // Check if this ID belongs to a main section
          const isMainSection = ['getting-started', 'buckets', 'files', 'bulk-operations', 'api-keys', 'advanced'].includes(sectionId);
          if (isMainSection) {
            currentSection = sectionId;
          } else {
            // It's a subsection, find its parent
            const mainSections = {
              'introduction': 'getting-started',
              'authentication': 'getting-started',
              'installation': 'getting-started',
              'create-bucket': 'buckets',
              'list-buckets': 'buckets',
              'get-bucket': 'buckets',
              'update-bucket': 'buckets',
              'delete-bucket': 'buckets',
              'bucket-stats': 'buckets',
              'upload-file': 'files',
              'list-files': 'files',
              'get-file': 'files',
              'download-file': 'files',
              'update-file': 'files',
              'delete-file': 'files',
              'bulk-delete': 'bulk-operations',
              'bulk-update': 'bulk-operations',
              'bulk-download': 'bulk-operations',
              'bulk-move': 'bulk-operations',
              'bulk-upload': 'bulk-operations',
              'create-api-key': 'api-keys',
              'list-api-keys': 'api-keys',
              'revoke-api-key': 'api-keys',
              'signed-urls': 'advanced',
              'public-files': 'advanced',
              'cors': 'advanced',
              'rate-limits': 'advanced'
            };
            currentSection = mainSections[sectionId] || currentSection;
          }
        }
      });
      
      setActiveSection(currentSection);
    };
    
    // Throttle scroll events for better performance
    let scrollTimeout;
    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 50);
    };
    
    // Add scroll listener
    window.addEventListener('scroll', throttledScroll);
    handleScroll(); // Check initial position
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  const languages = [
    { id: 'javascript', name: 'JavaScript/Node.js', icon: 'JS' },
    { id: 'python', name: 'Python', icon: 'Py' },
    { id: 'java', name: 'Java', icon: 'Java' },
    { id: 'curl', name: 'cURL', icon: 'cURL' }
  ];

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: RocketLaunchIcon,
      subsections: ['introduction', 'authentication', 'installation']
    },
    {
      id: 'buckets',
      title: 'Buckets',
      icon: FolderIcon,
      subsections: ['create-bucket', 'list-buckets', 'get-bucket', 'update-bucket', 'delete-bucket', 'bucket-stats']
    },
    {
      id: 'files',
      title: 'Files',
      icon: DocumentTextIcon,
      subsections: ['upload-file', 'presigned-upload', 'list-files', 'get-file', 'download-file', 'update-file', 'delete-file']
    },
    {
      id: 'bulk-operations',
      title: 'Bulk Operations',
      icon: Squares2X2Icon,
      subsections: ['bulk-delete', 'bulk-update', 'bulk-download', 'bulk-move']
    },
    {
      id: 'api-keys',
      title: 'API Keys',
      icon: KeyIcon,
      subsections: ['create-api-key', 'list-api-keys', 'revoke-api-key']
    },
    {
      id: 'advanced',
      title: 'Advanced',
      icon: ShieldCheckIcon,
      subsections: ['signed-urls', 'public-files', 'cors', 'rate-limits']
    }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Code examples for different languages
  const codeExamples = {
    javascript: {
      installation: `# Install via npm
npm install hypz-sdk

# Or using yarn
yarn add hypz-sdk

# Or using pnpm
pnpm add hypz-sdk`,
      
      authentication: `import Hypz from 'hypz-sdk';

// Initialize with API key
const hypz = new Hypz({
  apiKey: 'your-api-key-here',
  baseURL: '${API_BASE_URL}' // Your API base URL
});

// Test connection
const user = await hypz.auth.getCurrentUser();
logger.log('Connected as:', user.data.email);`,

      createBucket: `// Create a new bucket
const bucket = await hypz.buckets.create({
  name: 'my-awesome-bucket',
  visibility: 'private', // or 'public'
  description: 'Store my app assets',
  region: 'us-east-1'
});

logger.log('Bucket created:', bucket.data.slug);`,

      listBuckets: `// List all buckets with pagination
const { buckets, pagination } = await hypz.buckets.list({
  page: 1,
  limit: 10,
  search: 'my-bucket' // Optional search
});

buckets.forEach(bucket => {
  logger.log(\`\${bucket.name}: \${bucket.file_count} files\`);
});`,

      getBucket: `// Get bucket details
const bucket = await hypz.buckets.get(bucketId);

logger.log('Bucket:', bucket.data.name);
logger.log('Files:', bucket.data.file_count);
logger.log('Total size:', bucket.data.total_size);`,

      updateBucket: `// Update bucket settings
const updated = await hypz.buckets.update(bucketId, {
  visibility: 'public',
  description: 'Updated description',
  corsEnabled: true,
  corsOrigins: ['https://myapp.com']
});`,

      deleteBucket: `// Delete empty bucket (safe mode)
await hypz.buckets.delete(bucketId);

// Force delete bucket with files (use with caution!)
await hypz.buckets.delete(bucketId, true);`,

      bucketStats: `// Get bucket statistics
const stats = await hypz.buckets.getStats(bucketId);

logger.log('Total files:', stats.data.total_files);
logger.log('Total size:', stats.data.total_size);
logger.log('Total downloads:', stats.data.total_downloads);
logger.log('File types:', stats.data.typeDistribution);`,

      uploadFile: `// Upload a file
// Note: File visibility automatically matches bucket visibility
// - Public bucket → file is public
// - Private bucket → file is private (requires auth or signed URL)

const file = await hypz.files.upload({
  bucketId: bucketId,
  file: fileBuffer, // File buffer or stream
  fileName: 'image.jpg',
  tags: ['profile', 'avatar'],
  metadata: { userId: '123', category: 'images' }
});

logger.log('File uploaded:', file.data.url);
logger.log('CDN URL:', file.data.cdn_url);
logger.log('Is public:', file.data.is_public); // Matches bucket visibility`,

      presignedUpload: `// Presigned Upload - Direct Client-to-B2 Upload (Recommended for large files)
// Step 1: Initiate presigned upload
const { uploadUrl, uploadAuthToken, fileId, fileName } = await hypz.files.initiatePresignedUpload({
  bucketId: bucketId,
  fileName: 'large-video.mp4',
  fileSize: 104857600, // 100 MB in bytes
  mimeType: 'video/mp4',
  tags: ['video', 'media'],
  metadata: { category: 'videos' }
});

// Step 2: Calculate SHA1 hash (required by B2)
const calculateSHA1 = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const sha1 = await calculateSHA1(fileObject);

// Step 3: Upload directly to B2 (bypasses your server)
await fetch(uploadUrl, {
  method: 'POST',
  headers: {
    'Authorization': uploadAuthToken,
    'X-Bz-File-Name': fileName,
    'Content-Type': 'video/mp4',
    'Content-Length': '104857600',
    'X-Bz-Content-Sha1': sha1
  },
  body: fileObject // Direct file upload
});

// Step 4: Complete the upload on your server
const file = await hypz.files.completePresignedUpload(fileId, {
  sha1: sha1,
  finalSize: 104857600
});

logger.log('File uploaded:', file.data.url);
logger.log('Upload method: Direct to B2 (50-70% faster!)');`,

      listFiles: `// List files in bucket
const { files, pagination } = await hypz.files.list(bucketId, {
  page: 1,
  limit: 20,
  search: 'image',
  sortBy: 'created_at',
  order: 'DESC'
});

files.forEach(file => {
  logger.log(\`\${file.original_name} - \${file.formattedSize}\`);
});`,

      getFile: `// Get file details
const file = await hypz.files.get(fileId);

logger.log('Filename:', file.data.original_name);
logger.log('Size:', file.data.size);
logger.log('Downloads:', file.data.downloads);
logger.log('URL:', file.data.url);`,

      downloadFile: `// Download file (works for both public and private files)
const fileData = await hypz.files.download(fileId);

// Save to disk
require('fs').writeFileSync('downloaded-file.jpg', fileData);

// Note: For private files, authentication is automatically handled 
// by the SDK using your API key. Public files don't require authentication.`,

      updateFile: `// Update file metadata
// Note: Cannot change file visibility directly
// To change visibility, move file to a different bucket type

const updated = await hypz.files.update(fileId, {
  tags: ['featured', 'homepage'],
  metadata: { priority: 'high' }
});`,

      deleteFile: `// Delete a file
await hypz.files.delete(fileId);

logger.log('File deleted successfully');`,

      bulkDelete: `// Delete multiple files at once
const result = await hypz.files.bulkDelete([123, 456, 789]);

logger.log(\`Deleted \${result.data.deletedCount} files\`);
logger.log(\`Freed \${result.data.totalSize} bytes\`);`,

      bulkUpdate: `// Update multiple files at once
const result = await hypz.files.bulkUpdate({
  fileIds: [123, 456, 789],
  tags: ['archived', '2024'],
  metadata: { processed: true }
});

logger.log(\`Updated \${result.data.updatedCount} files\`);`,

      bulkDownload: `// Get download URLs for multiple files
const result = await hypz.files.bulkDownload([123, 456, 789]);

result.data.files.forEach(file => {
  logger.log(\`\${file.filename}: \${file.downloadUrl}\`);
});`,

      bulkMove: `// Move multiple files to another bucket
const result = await hypz.files.bulkMove({
  fileIds: [123, 456, 789],
  targetBucketId: 42
});

logger.log(\`Moved \${result.data.movedCount} files\`);`,

      bulkUpload: `// Upload multiple files at once (up to 20 files)
// File visibility matches bucket visibility
const fs = require('fs');

const result = await hypz.files.bulkUpload({
  bucketId: 'your-bucket-id',
  files: [
    { file: fs.createReadStream('./photo1.jpg'), filename: 'photo1.jpg' },
    { file: fs.createReadStream('./photo2.jpg'), filename: 'photo2.jpg' },
    { file: Buffer.from('content'), filename: 'data.txt' }
  ],
  tags: ['batch-upload', '2024'],
  metadata: { source: 'bulk-import' }
});

logger.log(\`Uploaded \${result.data.uploadedCount} files\`);
logger.log(\`Total size: \${result.data.totalSize} bytes\`);

// Check for any errors
if (result.data.errors && result.data.errors.length > 0) {
  logger.log(\`Errors: \${result.data.errorCount}\`);
  result.data.errors.forEach(err => {
    logger.log(\`  - \${err.filename}: \${err.error}\`);
  });
}`,

      createApiKey: `// Create a new API key
const apiKey = await hypz.apiKeys.create({
  name: 'Production Server',
  permissions: ['files:read', 'files:write', 'buckets:read'],
  expiresAt: '2025-12-31'
});

logger.log('API Key:', apiKey.data.key);
logger.log('Keep this secure!');`,

      listApiKeys: `// List all API keys
const apiKeys = await hypz.apiKeys.list();

apiKeys.data.forEach(key => {
  logger.log(\`\${key.name}: \${key.last_used_at || 'Never used'}\`);
});`,

      revokeApiKey: `// Revoke an API key
await hypz.apiKeys.revoke(apiKeyId);

logger.log('API key revoked');`,

      signedUrls: `// Generate signed URL for temporary access (max 7 days = 604800 seconds)
const signedUrl = await hypz.files.getSignedURL(fileId, 3600); // 1 hour

logger.log('Signed URL:', signedUrl.data.url);
logger.log('Expires at:', signedUrl.data.expiresAt);
logger.log('Expires in:', signedUrl.data.expiresIn, 'seconds');

// Maximum expiry: 7 days
const maxExpiryUrl = await hypz.files.getSignedURL(fileId, 604800);

// Exceeding 7 days will be automatically capped
const cappedUrl = await hypz.files.getSignedURL(fileId, 2592000); // 30 days requested
logger.log('Actual expiry:', cappedUrl.data.expiresIn, 'seconds'); // Will be 604800`,

      publicFiles: `// Public files are automatically accessible without auth
// File visibility is determined by bucket type:
// - Files in public buckets → public (no auth needed)
// - Files in private buckets → private (auth or signed URL required)

// Get public download URL for files in public buckets
const publicUrl = \`${API_BASE_URL}/v1/files/public/\${fileId}/download\`;

// To make files public, upload them to a public bucket:
const publicBucket = await hypz.buckets.create({
  name: 'public-assets',
  visibility: 'public'
});`,

      cors: `// Enable CORS for a bucket
await hypz.buckets.update(bucketId, {
  corsEnabled: true,
  corsOrigins: [
    'https://myapp.com',
    'https://staging.myapp.com'
  ]
});`,

      rateLimits: `// Rate limits are automatically handled by the SDK
// Default limits:
// - 100 requests per minute per API key
// - 1000 requests per hour per API key
// - 10 GB upload per day

// The SDK will automatically retry with exponential backoff
try {
  const file = await hypz.files.upload(bucketId, fileData);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    logger.log('Rate limit hit. Try again in:', error.retryAfter);
  }
}`
    },
    
    python: {
      installation: `# Install via pip
pip install hypz-sdk

# Or using poetry
poetry add hypz-sdk`,
      
      authentication: `from hypz import Hypz

# Initialize with API key
hypz = Hypz(
    api_key='your-api-key-here',
    base_url='${API_BASE_URL}'  # Your API base URL
)

# Test connection
user = hypz.auth.get_current_user()
print(f'Connected as: {user["email"]}')`,

      createBucket: `# Create a new bucket
bucket = hypz.buckets.create(
    name='my-awesome-bucket',
    visibility='private',  # or 'public'
    description='Store my app assets',
    region='us-east-1'
)

print(f'Bucket created: {bucket["slug"]}')`,

      listBuckets: `# List all buckets with pagination
response = hypz.buckets.list(
    page=1,
    limit=10,
    search='my-bucket'  # Optional search
)

for bucket in response['buckets']:
    print(f'{bucket["name"]}: {bucket["file_count"]} files')`,

      getBucket: `# Get bucket details
bucket = hypz.buckets.get(bucket_id)

print(f'Bucket: {bucket["name"]}')
print(f'Files: {bucket["file_count"]}')
print(f'Total size: {bucket["total_size"]}')`,

      updateBucket: `# Update bucket settings
updated = hypz.buckets.update(bucket_id,
    visibility='public',
    description='Updated description',
    cors_enabled=True,
    cors_origins=['https://myapp.com']
)`,

      deleteBucket: `# Delete empty bucket (safe mode)
hypz.buckets.delete(bucket_id)

# Force delete bucket with files (use with caution!)
hypz.buckets.delete(bucket_id, force=True)`,

      bucketStats: `# Get bucket statistics
stats = hypz.buckets.get_stats(bucket_id)

print(f'Total files: {stats["total_files"]}')
print(f'Total size: {stats["total_size"]}')
print(f'Total downloads: {stats["total_downloads"]}')
print(f'File types: {stats["typeDistribution"]}')`,

      uploadFile: `# Upload a file
# Note: File visibility automatically matches bucket visibility
with open('image.jpg', 'rb') as f:
    file = hypz.files.upload(bucket_id,
        file=f,
        filename='image.jpg',
        tags=['profile', 'avatar'],
        metadata={'user_id': '123', 'category': 'images'}
    )

print(f'File uploaded: {file["url"]}')
print(f'CDN URL: {file["cdn_url"]}')
print(f'Is public: {file["is_public"]}')  # Matches bucket visibility`,

      presignedUpload: `# Presigned Upload - Direct Client-to-B2 Upload (Recommended for large files)
import hashlib
import requests

# Step 1: Initiate presigned upload
response = hypz.files.initiate_presigned_upload({
    'bucketId': bucket_id,
    'fileName': 'large-video.mp4',
    'fileSize': 104857600,  # 100 MB in bytes
    'mimeType': 'video/mp4',
    'tags': ['video', 'media'],
    'metadata': {'category': 'videos'}
})

upload_url = response['uploadUrl']
upload_auth_token = response['uploadAuthToken']
file_id = response['fileId']
file_name = response['fileName']

# Step 2: Calculate SHA1 hash (required by B2)
sha1 = hashlib.sha1()
with open('large-video.mp4', 'rb') as f:
    while chunk := f.read(8192):
        sha1.update(chunk)
sha1_hex = sha1.hexdigest()

# Step 3: Upload directly to B2 (bypasses your server)
with open('large-video.mp4', 'rb') as f:
    response = requests.post(upload_url, 
        headers={
            'Authorization': upload_auth_token,
            'X-Bz-File-Name': file_name,
            'Content-Type': 'video/mp4',
            'Content-Length': '104857600',
            'X-Bz-Content-Sha1': sha1_hex
        },
        data=f
    )

# Step 4: Complete the upload on your server
file = hypz.files.complete_presigned_upload(file_id, {
    'sha1': sha1_hex,
    'finalSize': 104857600
})

print(f'File uploaded: {file["url"]}')
print('Upload method: Direct to B2 (50-70% faster!)')`,

      listFiles: `# List files in bucket
response = hypz.files.list(bucket_id,
    page=1,
    limit=20,
    search='image',
    sort_by='created_at',
    order='DESC'
)

for file in response['files']:
    print(f'{file["original_name"]} - {file["formattedSize"]}')`,

      getFile: `# Get file details
file = hypz.files.get(file_id)

print(f'Filename: {file["original_name"]}')
print(f'Size: {file["size"]}')
print(f'Downloads: {file["downloads"]}')
print(f'URL: {file["url"]}')`,

      downloadFile: `# Download file (works for both public and private files)
file_data = hypz.files.download(file_id)

# Save to disk
with open('downloaded-file.jpg', 'wb') as f:
    f.write(file_data)

# Note: For private files, authentication is automatically handled 
# by the SDK using your API key. Public files don't require authentication.`,

      updateFile: `# Update file metadata
# Note: Cannot change file visibility directly
updated = hypz.files.update(file_id,
    tags=['featured', 'homepage'],
    metadata={'priority': 'high'}
)`,

      deleteFile: `# Delete a file
hypz.files.delete(file_id)
print('File deleted successfully')`,

      bulkDelete: `# Delete multiple files at once
result = hypz.files.bulk_delete(
    file_ids=[123, 456, 789]
)

print(f'Deleted {result["deletedCount"]} files')
print(f'Freed {result["totalSize"]} bytes')`,

      bulkUpdate: `# Update multiple files at once
result = hypz.files.bulk_update(
    file_ids=[123, 456, 789],
    tags=['archived', '2024'],
    metadata={'processed': True}
)

print(f'Updated {result["updatedCount"]} files')`,

      bulkDownload: `# Get download URLs for multiple files
result = hypz.files.bulk_download(
    file_ids=[123, 456, 789]
)

for file in result['files']:
    print(f'{file["filename"]}: {file["downloadUrl"]}')`,

      bulkMove: `# Move multiple files to another bucket
result = hypz.files.bulk_move(
    file_ids=[123, 456, 789],
    target_bucket_id=42
)

print(f'Moved {result["movedCount"]} files')`,

      bulkUpload: `# Upload multiple files at once (up to 20 files)
with open('photo1.jpg', 'rb') as f1, open('photo2.jpg', 'rb') as f2:
    result = hypz.files.bulk_upload(
        bucket_id='your-bucket-id',
        files=[
            ('photo1.jpg', f1),
            ('photo2.jpg', f2),
            ('data.txt', b'content')
        ],
        tags=['batch-upload', '2024'],
        metadata={'source': 'bulk-import'}
    )

print(f'Uploaded {result["uploadedCount"]} files')
print(f'Total size: {result["totalSize"]} bytes')

# Check for any errors
if result.get('errors'):
    print(f'Errors: {result["errorCount"]}')
    for err in result['errors']:
        print(f'  - {err["filename"]}: {err["error"]}')`,

      createApiKey: `# Create a new API key
api_key = hypz.api_keys.create(
    name='Production Server',
    permissions=['files:read', 'files:write', 'buckets:read'],
    expires_at='2025-12-31'
)

print(f'API Key: {api_key["key"]}')
print('Keep this secure!')`,

      listApiKeys: `# List all API keys
api_keys = hypz.api_keys.list()

for key in api_keys:
    last_used = key['last_used_at'] or 'Never used'
    print(f'{key["name"]}: {last_used}')`,

      revokeApiKey: `# Revoke an API key
hypz.api_keys.revoke(api_key_id)
print('API key revoked')`,

      signedUrls: `# Generate signed URL for temporary access (max 7 days = 604800 seconds)
signed_url = hypz.files.create_signed_url(
    file_id,
    expires_in=3600  # 1 hour in seconds
)

print(f'Signed URL: {signed_url["url"]}')
print(f'Expires at: {signed_url["expiresAt"]}')
print(f'Expires in: {signed_url["expiresIn"]} seconds')

# Maximum expiry: 7 days (604800 seconds)
max_expiry_url = hypz.files.create_signed_url(file_id, expires_in=604800)

# Exceeding 7 days will be automatically capped
capped_url = hypz.files.create_signed_url(file_id, expires_in=2592000)  # 30 days
print(f'Actual expiry: {capped_url["expiresIn"]} seconds')  # Will be 604800`,

      publicFiles: `# Public files determined by bucket visibility
# Create a public bucket for public files
public_bucket = hypz.buckets.create(
    name='public-assets',
    visibility='public'
)

# Files uploaded to public buckets are automatically public
# Get public download URL (no auth required)
public_url = f'${API_BASE_URL}/files/public/{file_id}/download'`,

      cors: `# Enable CORS for a bucket
hypz.buckets.update(bucket_id,
    cors_enabled=True,
    cors_origins=[
        'https://myapp.com',
        'https://staging.myapp.com'
    ]
)`,

      rateLimits: `# Rate limits are automatically handled by the SDK
# Default limits:
# - 100 requests per minute per API key
# - 1000 requests per hour per API key
# - 10 GB upload per day

# The SDK will automatically retry with exponential backoff
try:
    file = hypz.files.upload(bucket_id, file_data)
except RateLimitError as error:
    print(f'Rate limit hit. Try again in: {error.retry_after}')`
    },

    java: {
      installation: `<!-- Add to your pom.xml -->
<dependency>
    <groupId>io.hypz</groupId>
    <artifactId>hypz-sdk</artifactId>
    <version>1.0.0</version>
</dependency>

<!-- Or for Gradle (build.gradle) -->
implementation 'io.hypz:hypz-sdk:1.0.0'`,
      
      authentication: `import io.hypz.Hypz;
import io.hypz.models.User;

// Initialize with API key
Hypz hypz = new Hypz.Builder()
    .apiKey("your-api-key-here")
    .baseUrl("${API_BASE_URL}") // Your API base URL
    .build();

// Test connection
User user = hypz.auth().getCurrentUser();
System.out.println("Connected as: " + user.getEmail());`,

      createBucket: `// Create a new bucket
Bucket bucket = hypz.buckets().create(
    new CreateBucketRequest()
        .name("my-awesome-bucket")
        .visibility(BucketVisibility.PRIVATE)
        .description("Store my app assets")
        .region("us-east-1")
);

System.out.println("Bucket created: " + bucket.getSlug());`,

      listBuckets: `// List all buckets with pagination
BucketListResponse response = hypz.buckets().list(
    new ListBucketsRequest()
        .page(1)
        .limit(10)
        .search("my-bucket") // Optional
);

for (Bucket bucket : response.getBuckets()) {
    System.out.println(bucket.getName() + ": " + 
                      bucket.getFileCount() + " files");
}`,

      getBucket: `// Get bucket details
Bucket bucket = hypz.buckets().get(bucketId);

System.out.println("Bucket: " + bucket.getName());
System.out.println("Files: " + bucket.getFileCount());
System.out.println("Total size: " + bucket.getTotalSize());`,

      updateBucket: `// Update bucket settings
Bucket updated = hypz.buckets().update(bucketId,
    new UpdateBucketRequest()
        .visibility(BucketVisibility.PUBLIC)
        .description("Updated description")
        .corsEnabled(true)
        .corsOrigins(Arrays.asList("https://myapp.com"))
);`,

      deleteBucket: `// Delete empty bucket (safe mode)
hypz.buckets().delete(bucketId);

// Force delete bucket with files (use with caution!)
hypz.buckets().delete(bucketId, true);`,

      bucketStats: `// Get bucket statistics
BucketStats stats = hypz.buckets().getStats(bucketId);

System.out.println("Total files: " + stats.getTotalFiles());
System.out.println("Total size: " + stats.getTotalSize());
System.out.println("Total downloads: " + stats.getTotalDownloads());`,

      uploadFile: `// Upload a file
// Note: File visibility automatically matches bucket visibility
File localFile = new File("image.jpg");
FileUpload file = hypz.files().upload(bucketId,
    new UploadFileRequest()
        .file(localFile)
        .filename("image.jpg")
        .tags(Arrays.asList("profile", "avatar"))
        .metadata(Map.of("userId", "123", "category", "images"))
);

System.out.println("File uploaded: " + file.getUrl());
System.out.println("CDN URL: " + file.getCdnUrl());
System.out.println("Is public: " + file.isPublic());`,

      presignedUpload: `// Presigned Upload - Direct Client-to-B2 Upload (Recommended for large files)
import java.security.MessageDigest;
import java.nio.file.Files;
import okhttp3.*;

// Step 1: Initiate presigned upload
PresignedUploadResponse response = hypz.files().initiatePresignedUpload(
    new PresignedUploadRequest()
        .bucketId(bucketId)
        .fileName("large-video.mp4")
        .fileSize(104857600L) // 100 MB in bytes
        .mimeType("video/mp4")
        .tags(Arrays.asList("video", "media"))
        .metadata(Map.of("category", "videos"))
);

String uploadUrl = response.getUploadUrl();
String uploadAuthToken = response.getUploadAuthToken();
Long fileId = response.getFileId();
String fileName = response.getFileName();

// Step 2: Calculate SHA1 hash (required by B2)
File file = new File("large-video.mp4");
MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
byte[] fileBytes = Files.readAllBytes(file.toPath());
sha1.update(fileBytes);
String sha1Hex = bytesToHex(sha1.digest());

// Step 3: Upload directly to B2 (bypasses your server - 50-70% faster!)
OkHttpClient client = new OkHttpClient();
RequestBody requestBody = RequestBody.create(fileBytes, MediaType.parse("video/mp4"));

Request uploadRequest = new Request.Builder()
    .url(uploadUrl)
    .post(requestBody)
    .addHeader("Authorization", uploadAuthToken)
    .addHeader("X-Bz-File-Name", fileName)
    .addHeader("Content-Type", "video/mp4")
    .addHeader("Content-Length", "104857600")
    .addHeader("X-Bz-Content-Sha1", sha1Hex)
    .build();

Response uploadResponse = client.newCall(uploadRequest).execute();

// Step 4: Complete the upload on your server
FileUpload completedFile = hypz.files().completePresignedUpload(fileId,
    new CompleteUploadRequest()
        .sha1(sha1Hex)
        .finalSize(104857600L)
);

System.out.println("File uploaded: " + completedFile.getUrl());
System.out.println("Upload method: Direct to B2 (50-70% faster!)");`,

      listFiles: `// List files in bucket
FileListResponse response = hypz.files().list(bucketId,
    new ListFilesRequest()
        .page(1)
        .limit(20)
        .search("image")
        .sortBy("created_at")
        .order(SortOrder.DESC)
);

for (FileInfo file : response.getFiles()) {
    System.out.println(file.getOriginalName() + " - " + 
                      file.getFormattedSize());
}`,

      getFile: `// Get file details
FileInfo file = hypz.files().get(fileId);

System.out.println("Filename: " + file.getOriginalName());
System.out.println("Size: " + file.getSize());
System.out.println("Downloads: " + file.getDownloads());
System.out.println("URL: " + file.getUrl());`,

      downloadFile: `// Download file (works for both public and private files)
byte[] fileData = hypz.files().download(fileId);

// Save to disk
Files.write(Paths.get("downloaded-file.jpg"), fileData);

// Note: For private files, authentication is automatically handled 
// by the SDK using your API key. Public files don't require authentication.`,

      updateFile: `// Update file metadata
// Note: Cannot change file visibility directly
FileInfo updated = hypz.files().update(fileId,
    new UpdateFileRequest()
        .tags(Arrays.asList("featured", "homepage"))
        .metadata(Map.of("priority", "high"))
);`,

      deleteFile: `// Delete a file
hypz.files().delete(fileId);
System.out.println("File deleted successfully");`,

      bulkDelete: `// Delete multiple files at once
BulkDeleteResponse result = hypz.files().bulkDelete(
    new BulkDeleteRequest()
        .fileIds(Arrays.asList(123, 456, 789))
);

System.out.println("Deleted " + result.getDeletedCount() + " files");
System.out.println("Freed " + result.getTotalSize() + " bytes");`,

      bulkUpdate: `// Update multiple files at once
BulkUpdateResponse result = hypz.files().bulkUpdate(
    new BulkUpdateRequest()
        .fileIds(Arrays.asList(123, 456, 789))
        .tags(Arrays.asList("archived", "2024"))
        .metadata(Map.of("processed", true))
);

System.out.println("Updated " + result.getUpdatedCount() + " files");`,

      bulkDownload: `// Get download URLs for multiple files
BulkDownloadResponse result = hypz.files().bulkDownload(
    new BulkDownloadRequest()
        .fileIds(Arrays.asList(123, 456, 789))
);

for (FileDownloadInfo file : result.getFiles()) {
    System.out.println(file.getFilename() + ": " + 
                      file.getDownloadUrl());
}`,

      bulkMove: `// Move multiple files to another bucket
BulkMoveResponse result = hypz.files().bulkMove(
    new BulkMoveRequest()
        .fileIds(Arrays.asList(123, 456, 789))
        .targetBucketId(42)
);

System.out.println("Moved " + result.getMovedCount() + " files");`,

      bulkUpload: `// Upload multiple files at once (up to 20 files)
// File visibility matches bucket visibility
import java.io.File;
import { logger } from '../utils/logger';

BulkUploadResponse result = hypz.files().bulkUpload(
    new BulkUploadRequest()
        .bucketId("your-bucket-id")
        .addFile(new File("photo1.jpg"))
        .addFile(new File("photo2.jpg"))
        .addFile("data.txt", "content".getBytes())
        .tags(Arrays.asList("batch-upload", "2024"))
        .metadata(Map.of("source", "bulk-import"))
);

System.out.println("Uploaded " + result.getUploadedCount() + " files");
System.out.println("Total size: " + result.getTotalSize() + " bytes");

// Check for any errors
if (result.getErrors() != null && !result.getErrors().isEmpty()) {
    System.out.println("Errors: " + result.getErrorCount());
    for (UploadError err : result.getErrors()) {
        System.out.println("  - " + err.getFilename() + ": " + err.getError());
    }
}`,

      createApiKey: `// Create a new API key
ApiKey apiKey = hypz.apiKeys().create(
    new CreateApiKeyRequest()
        .name("Production Server")
        .permissions(Arrays.asList(
            "files:read", "files:write", "buckets:read"
        ))
        .expiresAt("2025-12-31")
);

System.out.println("API Key: " + apiKey.getKey());
System.out.println("Keep this secure!");`,

      listApiKeys: `// List all API keys
List<ApiKey> apiKeys = hypz.apiKeys().list();

for (ApiKey key : apiKeys) {
    String lastUsed = key.getLastUsedAt() != null ? 
                     key.getLastUsedAt() : "Never used";
    System.out.println(key.getName() + ": " + lastUsed);
}`,

      revokeApiKey: `// Revoke an API key
hypz.apiKeys().revoke(apiKeyId);
System.out.println("API key revoked");`,

      signedUrls: `// Generate signed URL for temporary access (max 7 days = 604800 seconds)
SignedUrl signedUrl = hypz.files().createSignedUrl(fileId,
    new SignedUrlRequest()
        .expiresIn(3600) // 1 hour in seconds
);

System.out.println("Signed URL: " + signedUrl.getUrl());
System.out.println("Expires at: " + signedUrl.getExpiresAt());
System.out.println("Expires in: " + signedUrl.getExpiresIn() + " seconds");

// Maximum expiry: 7 days (604800 seconds)
SignedUrl maxExpiryUrl = hypz.files().createSignedUrl(fileId,
    new SignedUrlRequest().expiresIn(604800)
);

// Exceeding 7 days will be automatically capped
SignedUrl cappedUrl = hypz.files().createSignedUrl(fileId,
    new SignedUrlRequest().expiresIn(2592000) // 30 days requested
);
System.out.println("Actual expiry: " + cappedUrl.getExpiresIn() + " seconds"); // Will be 604800`,

      publicFiles: `// Public files determined by bucket visibility
// Upload to public bucket for public access

// Create a public bucket
Bucket publicBucket = hypz.buckets().create(
    new CreateBucketRequest()
        .name("public-assets")
        .visibility("public")
);

// Get public download URL (no auth required)
String publicUrl = "${API_BASE_URL}/files/public/" + 
                  fileId + "/download";`,

      cors: `// Enable CORS for a bucket
hypz.buckets().update(bucketId,
    new UpdateBucketRequest()
        .corsEnabled(true)
        .corsOrigins(Arrays.asList(
            "https://myapp.com",
            "https://staging.myapp.com"
        ))
);`,

      rateLimits: `// Rate limits are automatically handled by the SDK
// Default limits:
// - 100 requests per minute per API key
// - 1000 requests per hour per API key
// - 10 GB upload per day

// The SDK will automatically retry with exponential backoff
try {
    FileUpload file = hypz.files().upload(bucketId, fileData);
} catch (RateLimitException error) {
    System.out.println("Rate limit hit. Try again in: " + 
                      error.getRetryAfter());
}`
    },

    curl: {
      installation: `# cURL is pre-installed on most systems
# Check version:
curl --version

# For Windows, download from: https://curl.se/windows/`,
      
      authentication: `# All requests require an API key in the header
# Method 1: Using header (recommended)
curl -H "x-api-key: your-api-key-here" \\
     ${API_BASE_URL}/user

# Method 2: Using query parameter
curl "${API_BASE_URL}/user?api_key=your-api-key-here"`,

      createBucket: `# Create a new bucket
curl -X POST ${API_BASE_URL}/buckets \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my-awesome-bucket",
    "visibility": "private",
    "description": "Store my app assets",
    "region": "us-east-1"
  }'`,

      listBuckets: `# List all buckets with pagination
curl -X GET "${API_BASE_URL}/buckets?page=1&limit=10&search=my-bucket" \\
  -H "x-api-key: your-api-key-here"`,

      getBucket: `# Get bucket details
curl -X GET ${API_BASE_URL}/buckets/{bucketId} \\
  -H "x-api-key: your-api-key-here"`,

      updateBucket: `# Update bucket settings
curl -X PUT ${API_BASE_URL}/buckets/{bucketId} \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "visibility": "public",
    "description": "Updated description",
    "corsEnabled": true,
    "corsOrigins": ["https://myapp.com"]
  }'`,

      deleteBucket: `# Delete empty bucket (safe mode)
curl -X DELETE ${API_BASE_URL}/buckets/{bucketId} \\
  -H "x-api-key: your-api-key-here"

# Force delete bucket with files (use with caution!)
curl -X DELETE "${API_BASE_URL}/buckets/{bucketId}?force=true" \\
  -H "x-api-key: your-api-key-here"`,

      bucketStats: `# Get bucket statistics
curl -X GET ${API_BASE_URL}/buckets/{bucketId}/stats \\
  -H "x-api-key: your-api-key-here"`,

      uploadFile: `# Upload a file
# Note: File visibility automatically matches bucket visibility
curl -X POST ${API_BASE_URL}/files/{bucketId}/upload \\
  -H "x-api-key: your-api-key-here" \\
  -F "file=@/path/to/image.jpg" \\
  -F "tags=profile,avatar" \\
  -F 'metadata={"userId":"123","category":"images"}'`,

      presignedUpload: `# Presigned Upload - Direct Client-to-B2 Upload (Recommended for large files)
# Step 1: Initiate presigned upload
curl -X POST ${API_BASE_URL}/buckets/{bucketId}/files/presigned \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fileName": "large-video.mp4",
    "fileSize": 104857600,
    "mimeType": "video/mp4",
    "tags": ["video", "media"],
    "metadata": {"category": "videos"}
  }'

# Response:
# {
#   "success": true,
#   "message": "Presigned upload URL generated",
#   "data": {
#     "fileId": 123,
#     "uploadUrl": "https://s3.us-west-004.backblazeb2.com/...",
#     "uploadAuthToken": "4_001abc...",
#     "bucketId": 456,
#     "fileName": "large-video.mp4",
#     "downloadUrl": "https://f004.backblazeb2.com/file/..."
#   }
# }

# Step 2: Calculate SHA1 hash
SHA1=$(sha1sum large-video.mp4 | cut -d' ' -f1)

# Step 3: Upload directly to B2 (bypasses your server - 50-70% faster!)
curl -X POST "$UPLOAD_URL" \\
  -H "Authorization: $UPLOAD_AUTH_TOKEN" \\
  -H "X-Bz-File-Name: large-video.mp4" \\
  -H "Content-Type: video/mp4" \\
  -H "Content-Length: 104857600" \\
  -H "X-Bz-Content-Sha1: $SHA1" \\
  --data-binary @large-video.mp4

# Step 4: Complete the upload on your server
curl -X POST ${API_BASE_URL}/files/file/{fileId}/complete \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sha1": "'"$SHA1"'",
    "finalSize": 104857600
  }'`,

      listFiles: `# List files in bucket
curl -X GET "${API_BASE_URL}/files/{bucketId}/files?page=1&limit=20&search=image&sortBy=created_at&order=DESC" \\
  -H "x-api-key: your-api-key-here"`,

      getFile: `# Get file details
curl -X GET ${API_BASE_URL}/files/file/{fileId} \\
  -H "x-api-key: your-api-key-here"`,

      downloadFile: `# Download file (works for both public and private files)
curl -X GET ${API_BASE_URL}/files/file/{fileId}/download \\
  -H "x-api-key: your-api-key-here" \\
  --output downloaded-file.jpg

# Note: For private files, the x-api-key header is required for authentication.
# Public files don't require authentication but including it still works.`,

      updateFile: `# Update file metadata
# Note: File visibility is inherited from bucket and cannot be changed directly
curl -X PATCH ${API_BASE_URL}/files/file/{fileId} \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tags": ["featured", "homepage"],
    "metadata": {"priority": "high"}
  }'`,

      deleteFile: `# Delete a file
curl -X DELETE ${API_BASE_URL}/files/file/{fileId} \\
  -H "x-api-key: your-api-key-here"`,

      bulkDelete: `# Delete multiple files at once
curl -X POST ${API_BASE_URL}/files/bulk/delete \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fileIds": [123, 456, 789]
  }'`,

      bulkUpdate: `# Update multiple files at once
# Note: File visibility is inherited from bucket and cannot be changed directly
curl -X POST ${API_BASE_URL}/files/bulk/update \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fileIds": [123, 456, 789],
    "tags": ["archived", "2024"],
    "metadata": {"processed": true}
  }'`,

      bulkDownload: `# Get download URLs for multiple files
curl -X POST ${API_BASE_URL}/files/bulk/download \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fileIds": [123, 456, 789]
  }'`,

      bulkMove: `# Move multiple files to another bucket
curl -X POST ${API_BASE_URL}/files/bulk/move \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fileIds": [123, 456, 789],
    "targetBucketId": 42
  }'`,

      bulkUpload: `# Upload multiple files at once (up to 20 files)
# Note: File visibility automatically matches bucket visibility
curl -X POST ${API_BASE_URL}/files/{bucketId}/bulk-upload \\
  -H "x-api-key: your-api-key-here" \\
  -F "files=@photo1.jpg" \\
  -F "files=@photo2.jpg" \\
  -F "files=@data.txt" \\
  -F 'tags=["batch-upload","2024"]' \\
  -F 'metadata={"source":"bulk-import"}'

# Response includes uploaded files and any errors:
# {
#   "uploadedCount": 2,
#   "errorCount": 1,
#   "totalSize": 2048576,
#   "files": [...],
#   "errors": [{"filename": "data.txt", "error": "File too large"}]
# }`,

      createApiKey: `# Create a new API key
curl -X POST ${API_BASE_URL}/api-keys \\
  -H "Authorization: Bearer your-jwt-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production Server",
    "permissions": ["files:read", "files:write", "buckets:read"],
    "expiresAt": "2025-12-31"
  }'`,

      listApiKeys: `# List all API keys
curl -X GET ${API_BASE_URL}/api-keys \\
  -H "Authorization: Bearer your-jwt-token"`,

      revokeApiKey: `# Revoke an API key
curl -X DELETE ${API_BASE_URL}/api-keys/{apiKeyId} \\
  -H "Authorization: Bearer your-jwt-token"`,

      signedUrls: `# Generate signed URL for temporary access (max 7 days = 604800 seconds)
curl -X POST ${API_BASE_URL}/files/file/{fileId}/signed-url \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "expiresIn": 3600
  }'

# Response includes URL and expiry information:
# {
#   "success": true,
#   "data": {
#     "url": "${API_BASE_URL}/v1/files/file/{fileId}/download-signed?token=...",
#     "expiresAt": "2025-11-04T10:00:00.000Z",
#     "expiresIn": 3600,
#     "maxExpiresIn": 604800,
#     "isPrivate": true,
#     "note": "Maximum expiry time (7 days) applied" // If capped
#   }
# }

# Maximum expiry: 7 days (604800 seconds)
# Exceeding this value will be automatically capped`,

      publicFiles: `# To make files publicly accessible, upload them to a public bucket
# First, create a public bucket:
curl -X POST ${API_BASE_URL}/buckets \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "public-assets",
    "isPublicBucket": true
  }'

# Then upload files - they will automatically be public:
curl -X POST ${API_BASE_URL}/files/{bucketId}/upload \\
  -H "x-api-key: your-api-key-here" \\
  -F "file=@/path/to/image.jpg"

# Download public file (no auth required)
curl -X GET ${API_BASE_URL}/files/public/{fileId}/download \\
  --output file.jpg`,

      cors: `# Enable CORS for a bucket
curl -X PUT ${API_BASE_URL}/buckets/{bucketId} \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "corsEnabled": true,
    "corsOrigins": [
      "https://myapp.com",
      "https://staging.myapp.com"
    ]
  }'`,

      rateLimits: `# Rate limits information
# Default limits:
# - 100 requests per minute per API key
# - 1000 requests per hour per API key
# - 10 GB upload per day

# When rate limited, you'll receive:
# HTTP 429 Too Many Requests
# {
#   "error": "Rate limit exceeded",
#   "retryAfter": 60
# }

# Handle with retry logic:
curl -X GET ${API_BASE_URL}/buckets \\
  -H "x-api-key: your-api-key-here" \\
  --retry 3 \\
  --retry-delay 5`
    }
  };

  const CodeBlock = ({ code, language }) => (
    <div className="relative group">
      <button
        onClick={() => navigator.clipboard.writeText(code)}
        className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-100 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/20"
      >
        <DocumentTextIcon className="w-4 h-4" />
        Copy
      </button>
      <SyntaxHighlighter
        language={
          language === 'javascript'
            ? 'javascript'
            : language === 'python'
            ? 'python'
            : language === 'java'
            ? 'java'
            : 'bash'
        }
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '1rem',
          fontSize: '0.9rem',
          padding: '1.5rem',
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          border: '1px solid rgba(148, 163, 184, 0.15)'
        }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );

  const Section = ({ id, title, icon, children }) => {
    const IconComponent = icon;
    return (
      <section id={id} data-section={id} className="scroll-mt-28">
        <div className="rounded-3xl border border-white/10 bg-white/80 text-slate-900 shadow-xl backdrop-blur dark:bg-slate-900/70 dark:text-slate-100 dark:border-white/5 px-6 sm:px-10 py-8 sm:py-12 space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500 dark:text-blue-300">
              {IconComponent ? <IconComponent className="w-6 h-6" /> : null}
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Detailed guides, live-ready snippets, and best practices</p>
            </div>
          </div>
          <div className="space-y-8 text-slate-700 dark:text-slate-300">
            {children}
          </div>
        </div>
      </section>
    );
  };

  const SubSection = ({ id, title, description, codeKey, icon }) => {
    const IconComponent = icon;
    return (
      <div id={id} data-section={id} className="space-y-4 rounded-2xl border border-white/10 bg-white/70 px-5 py-6 shadow-sm backdrop-blur dark:bg-slate-900/60 dark:border-white/5">
        <div className="flex items-start gap-3">
          {IconComponent && (
            <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-300">
              <IconComponent className="w-4 h-4" />
            </span>
          )}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            {description && (
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
            )}
          </div>
        </div>
        {codeKey && codeExamples[activeLanguage][codeKey] && (
          <CodeBlock
            code={codeExamples[activeLanguage][codeKey]}
            language={activeLanguage === 'curl' ? 'bash' : activeLanguage}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <SEO
        title="Documentation - Hypz Object Storage API | Developer Guides"
        description="Complete API documentation for Hypz object storage with code examples in JavaScript, Python, Java, and cURL. Learn how to integrate S3-compatible storage into your applications."
        keywords="api documentation, object storage api, s3 api, rest api, storage sdk, developer guide, api reference, code examples, javascript sdk, python sdk"
        url="/documentation"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-slate-950 text-gray-100">
        <div className="relative overflow-hidden border-b border-white/10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/25 via-slate-900 to-slate-950" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.35),transparent_60%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] items-start">
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.45em] text-blue-300">Developer Documentation</p>
                <h1 className="mt-5 text-4xl sm:text-5xl font-bold text-white leading-tight">Build with Hypz Object Storage API</h1>
                <p className="mt-6 text-lg text-blue-100/85 max-w-3xl leading-relaxed">
                  Ship uploads, lifecycle automation, and analytics faster with end-to-end guides for JavaScript, Python, Java, and cURL. Everything here reflects your environment at{' '}
                  <span className="font-mono text-blue-50">{APP_BASE_URL}</span>.
                </p>
                <div className="mt-8 flex flex-wrap gap-4 text-sm">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-4 py-2 text-blue-100 border border-blue-500/30">
                    <CommandLineIcon className="w-4 h-4" />
                    <span>API Base: <code className="font-mono text-blue-50">{API_BASE_URL}</code></span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-slate-100 border border-white/20">
                    <ArrowPathIcon className="w-4 h-4" />
                    <span>Updated {LAST_UPDATED}</span>
                  </div>
                </div>
                <div className="mt-10 flex flex-wrap gap-4">
                  <button
                    onClick={() => scrollToSection('getting-started')}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
                  >
                    <RocketLaunchIcon className="w-4 h-4" />
                    Start Building
                  </button>
                  <a
                    href={`${APP_BASE_URL}/dashboard`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10"
                  >
                    <KeyIcon className="w-4 h-4" />
                    Open Dashboard
                  </a>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <h3 className="text-lg font-semibold text-white">Launch Checklist</h3>
                <ul className="mt-4 space-y-3 text-sm text-blue-100/80">
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold">1</span>
                    <span>Create an API key from <code className="font-mono">{APP_BASE_URL}/dashboard</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold">2</span>
                    <span>Install the SDK for your language and point it at <code className="font-mono">{API_BASE_URL}</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold">3</span>
                    <span>Use presigned uploads for large files to bypass your servers and cut latency</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-2">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setActiveLanguage(lang.id)}
                className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeLanguage === lang.id
                    ? 'border-blue-400 bg-blue-500/90 text-white shadow-lg shadow-blue-500/30'
                    : 'border-white/10 bg-white/5 text-blue-100 hover:bg-white/10'
                }`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                  {lang.icon}
                </span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      activeSection === section.id
                        ? 'border-blue-400 bg-blue-500/90 text-white shadow-lg shadow-blue-500/30'
                        : 'border-white/10 bg-white/5 text-blue-100 hover:bg-white/10'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    <span>{section.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <div className="space-y-12">
            {/* Getting Started */}
            <Section id="getting-started" title="Getting Started" icon={RocketLaunchIcon}>
              <SubSection
                id="introduction"
                title="Introduction"
                description="Hypz is a powerful cloud storage API that makes it easy to store, manage, and serve files. Built for developers who need reliable, scalable storage with a simple API."
              />

              <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 px-6 py-6 text-blue-50 shadow-inner">
                <h4 className="font-semibold text-blue-100 mb-2">🚀 Quick Start</h4>
                <ol className="list-decimal list-inside space-y-2 text-blue-100/80">
                  <li>Sign up for a free account at <a href={`${APP_BASE_URL}/register`} className="underline">{APP_BASE_URL}</a></li>
                  <li>Create an API key in your dashboard</li>
                  <li>Install the SDK for your preferred language</li>
                  <li>Start uploading files!</li>
                </ol>
              </div>

              <SubSection
                id="authentication"
                title="Authentication"
                icon={KeyIcon}
                description="All API requests require authentication using an API key. You can create API keys in your dashboard with specific permissions."
                codeKey="authentication"
              />

              <SubSection
                id="installation"
                title="Installation"
                icon={CodeBracketIcon}
                description="Install the Hypz SDK for your preferred programming language:"
                codeKey="installation"
              />
            </Section>

            {/* Buckets */}
            <Section id="buckets" title="Buckets" icon={FolderIcon}>
              <p className="text-sm leading-6 text-slate-200">
                Buckets are containers for organizing your files. Each bucket can have its own settings like visibility, CORS configuration, and more.
              </p>

              <SubSection
                id="create-bucket"
                title="Create Bucket"
                icon={FolderPlusIcon}
                description="Create a new bucket to store your files. Buckets can be either private or public."
                codeKey="createBucket"
              />

              <SubSection
                id="list-buckets"
                title="List Buckets"
                icon={Squares2X2Icon}
                description="Get a list of all your buckets with pagination and search support."
                codeKey="listBuckets"
              />

              <SubSection
                id="get-bucket"
                title="Get Bucket"
                icon={FolderIcon}
                description="Retrieve detailed information about a specific bucket including file count and total size."
                codeKey="getBucket"
              />

              <SubSection
                id="update-bucket"
                title="Update Bucket"
                icon={PencilSquareIcon}
                description="Update bucket settings such as visibility, description, and CORS configuration."
                codeKey="updateBucket"
              />

              <SubSection
                id="delete-bucket"
                title="Delete Bucket"
                icon={TrashIcon}
                description="Delete a bucket. By default, buckets can only be deleted if they're empty (safety check). Use force=true to delete bucket with files."
                codeKey="deleteBucket"
              />

              <div className="rounded-2xl border border-yellow-400/30 bg-yellow-500/10 px-6 py-6 text-yellow-100">
                <h4 className="font-semibold mb-2 text-yellow-50">⚠️ Safety First</h4>
                <p className="text-sm leading-6">
                  The delete bucket endpoint includes a safety check - it will only delete empty buckets by default. This prevents accidental data loss. To force delete a bucket with files, use the{' '}
                  <code className="rounded bg-yellow-500/20 px-1.5 py-0.5 font-mono">force=true</code> parameter.
                </p>
              </div>

              <SubSection
                id="bucket-stats"
                title="Bucket Statistics"
                icon={CheckCircleIcon}
                description="Get comprehensive statistics about a bucket including file count, total size, downloads, and file type distribution."
                codeKey="bucketStats"
              />
            </Section>

            {/* Files */}
            <Section id="files" title="Files" icon={DocumentTextIcon}>
              <p className="text-sm leading-6 text-slate-200">
                Upload, manage, and serve files with advanced features like tags, metadata, and public/private access control.
              </p>

              <SubSection
                id="upload-file"
                title="Upload File"
                icon={CloudArrowUpIcon}
                description="Upload files to a bucket with optional tags and metadata. Files can be made public or kept private."
                codeKey="uploadFile"
              />

              <SubSection
                id="presigned-upload"
                title="Presigned Upload (Recommended)"
                icon={RocketLaunchIcon}
                description="Direct client-to-B2 upload using presigned URLs. 50-70% faster for large files (>10MB) as it bypasses your server entirely. The file goes directly from the client to B2 storage."
                codeKey="presignedUpload"
              />

              <div className="rounded-2xl border border-green-400/30 bg-green-500/10 px-6 py-6 text-green-100">
                <h4 className="font-semibold text-green-50 mb-2">🚀 Why Use Presigned Uploads?</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Faster:</strong> 50-70% speed improvement by bypassing your server</li>
                  <li><strong>Scalable:</strong> No server bandwidth/memory usage for file uploads</li>
                  <li><strong>Cost-efficient:</strong> No egress costs for uploads through your server</li>
                </ul>
              </div>

              <SubSection
                id="list-files"
                title="List Files"
                icon={DocumentTextIcon}
                description="List files in a bucket with filters for search, sorting, tags, visibility, and metadata."
                codeKey="listFiles"
              />

              <SubSection
                id="get-file"
                title="Get File"
                icon={DocumentTextIcon}
                description="Retrieve detailed information about a specific file including download URLs and metadata."
                codeKey="getFile"
              />

              <SubSection
                id="download-file"
                title="Download File"
                icon={CloudArrowDownIcon}
                description="Download files securely. Private files require authentication or signed URLs, public files are accessible without auth."
                codeKey="downloadFile"
              />

              <SubSection
                id="update-file"
                title="Update File"
                icon={PencilSquareIcon}
                description="Update file metadata and tags. File visibility is inherited from the bucket and can't be changed directly."
                codeKey="updateFile"
              />

              <SubSection
                id="delete-file"
                title="Delete File"
                icon={TrashIcon}
                description="Delete a file from a bucket."
                codeKey="deleteFile"
              />

              <SubSection
                id="bulk-delete"
                title="Bulk Delete"
                icon={TrashIcon}
                description="Delete multiple files at once from a bucket."
                codeKey="bulkDelete"
              />

              <SubSection
                id="bulk-update"
                title="Bulk Update"
                icon={PencilSquareIcon}
                description="Update metadata and tags for multiple files simultaneously."
                codeKey="bulkUpdate"
              />

              <SubSection
                id="bulk-download"
                title="Bulk Download"
                icon={CloudArrowDownIcon}
                description="Generate download URLs for multiple files in one request."
                codeKey="bulkDownload"
              />

              <SubSection
                id="bulk-move"
                title="Bulk Move"
                icon={ArrowsRightLeftIcon}
                description="Move multiple files across buckets while preserving metadata."
                codeKey="bulkMove"
              />

              <SubSection
                id="bulk-upload"
                title="Bulk Upload"
                icon={FolderPlusIcon}
                description="Upload multiple files simultaneously with shared metadata and tags."
                codeKey="bulkUpload"
              />
            </Section>

            {/* Bulk Operations */}
            <Section id="bulk-operations" title="Bulk Operations" icon={Squares2X2Icon}>
              <p className="text-sm leading-6 text-slate-200">
                Handle multiple files efficiently with our bulk operation endpoints. Perfect for batch processing and automations.
              </p>

              <SubSection
                id="bulk-delete"
                title="Bulk Delete"
                icon={TrashIcon}
                description="Delete multiple files at once with a single API call."
                codeKey="bulkDelete"
              />

              <SubSection
                id="bulk-update"
                title="Bulk Update"
                icon={PencilSquareIcon}
                description="Update metadata and tags for multiple files simultaneously."
                codeKey="bulkUpdate"
              />

              <SubSection
                id="bulk-download"
                title="Bulk Download"
                icon={CloudArrowDownIcon}
                description="Generate download URLs for multiple files in one request."
                codeKey="bulkDownload"
              />

              <SubSection
                id="bulk-move"
                title="Bulk Move"
                icon={ArrowsRightLeftIcon}
                description="Move multiple files across buckets using a single request."
                codeKey="bulkMove"
              />
            </Section>

            {/* API Keys */}
            <Section id="api-keys" title="API Keys" icon={KeyIcon}>
              <p className="text-sm leading-6 text-slate-200">
                Manage API keys for your team, including creating keys with specific permissions, listing existing keys, and revoking compromised keys.
              </p>

              <SubSection
                id="create-api-key"
                title="Create API Key"
                icon={KeyIcon}
                description="Create an API key with specific permissions and optional expiration date."
                codeKey="createApiKey"
              />

              <SubSection
                id="list-api-keys"
                title="List API Keys"
                icon={KeyIcon}
                description="List all API keys, including last used timestamps and permission scopes."
                codeKey="listApiKeys"
              />

              <SubSection
                id="revoke-api-key"
                title="Revoke API Key"
                icon={KeyIcon}
                description="Revoke an API key to immediately invalidate it across all services."
                codeKey="revokeApiKey"
              />
            </Section>

            {/* Advanced */}
            <Section id="advanced" title="Advanced" icon={ShieldCheckIcon}>
              <p className="text-sm leading-6 text-slate-200">
                Advanced features for managing file access, security, and performance optimization.
              </p>

              <SubSection
                id="signed-urls"
                title="Signed URLs"
                icon={ShieldCheckIcon}
                description="Generate signed URLs for temporary access to private files with custom expiration times."
                codeKey="signedUrls"
              />

              <SubSection
                id="public-files"
                title="Public Files"
                icon={CommandLineIcon}
                description="Configure bucket visibility to control whether files are public or private."
                codeKey="publicFiles"
              />

              <SubSection
                id="cors"
                title="CORS Configuration"
                icon={ShieldCheckIcon}
                description="Configure Cross-Origin Resource Sharing (CORS) for your buckets to control which domains can access your files from browsers."
                codeKey="cors"
              />

              <SubSection
                id="rate-limits"
                title="Rate Limits"
                icon={CheckCircleIcon}
                description="Understand and work with API rate limits to ensure reliable application performance."
                codeKey="rateLimits"
              />

              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-sm text-slate-100">
                <h4 className="font-semibold mb-4">📊 Rate Limits</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">100</div>
                    <div className="text-xs uppercase tracking-wide text-slate-300">Requests / Minute</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">1,000</div>
                    <div className="text-xs uppercase tracking-wide text-slate-300">Requests / Hour</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">10 GB</div>
                    <div className="text-xs uppercase tracking-wide text-slate-300">Upload / Day</div>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-white mb-3">Need Help?</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/contact" className="hover:text-blue-300">Contact Support</a></li>
                  <li><a href="https://github.com/ysr-hameed/hypz" className="hover:text-blue-300">GitHub Repository</a></li>
                  <li><a href="/api" className="hover:text-blue-300">API Reference</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">SDKs</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://www.npmjs.com/package/hypz-sdk" className="hover:text-blue-300">JavaScript/Node.js</a></li>
                  <li><a href="https://pypi.org/project/hypz-sdk/" className="hover:text-blue-300">Python</a></li>
                  <li><a href="https://github.com/ysr-hameed/hypz/tree/main/hypz-sdk/java" className="hover:text-blue-300">Java</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/pricing" className="hover:text-blue-300">Pricing</a></li>
                  <li><a href="/dashboard" className="hover:text-blue-300">Dashboard</a></li>
                  <li><a href="/blog" className="hover:text-blue-300">Blog</a></li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Documentation;
