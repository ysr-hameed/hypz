import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  BookOpenIcon, 
  CodeBracketIcon, 
  CubeIcon, 
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
import { useNavigate } from 'react-router-dom';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeLanguage, setActiveLanguage] = useState('javascript');
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check theme
    const theme = localStorage.getItem('theme') || 'light';
    setIsDark(theme === 'dark');
    
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
          const parentSection = sections.id;
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
    { 
      id: 'javascript', 
      name: 'JavaScript/Node.js', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
        </svg>
      )
    },
    { 
      id: 'python', 
      name: 'Python', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
        </svg>
      )
    },
    { 
      id: 'java', 
      name: 'Java', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639"/>
        </svg>
      )
    },
    { 
      id: 'curl', 
      name: 'cURL', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zM3.05 12c0 4.95 4 8.95 8.95 8.95s8.95-4 8.95-8.95-4-8.95-8.95-8.95-8.95 4-8.95 8.95zM8.5 9.5l-1.5 1.5 1.5 1.5 1.5-1.5-1.5-1.5zm7 0l-1.5 1.5 1.5 1.5 1.5-1.5-1.5-1.5zM12 16c-2 0-3.5-1.5-3.5-3.5h7c0 2-1.5 3.5-3.5 3.5z"/>
        </svg>
      )
    }
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
      subsections: ['upload-file', 'list-files', 'get-file', 'download-file', 'update-file', 'delete-file']
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
  baseURL: 'https://api.hypz.io/api/v1' // Optional
});

// Test connection
const user = await hypz.auth.getCurrentUser();
console.log('Connected as:', user.data.email);`,

      createBucket: `// Create a new bucket
const bucket = await hypz.buckets.create({
  name: 'my-awesome-bucket',
  visibility: 'private', // or 'public'
  description: 'Store my app assets',
  region: 'us-east-1'
});

console.log('Bucket created:', bucket.data.slug);`,

      listBuckets: `// List all buckets with pagination
const { buckets, pagination } = await hypz.buckets.list({
  page: 1,
  limit: 10,
  search: 'my-bucket' // Optional search
});

buckets.forEach(bucket => {
  console.log(\`\${bucket.name}: \${bucket.file_count} files\`);
});`,

      getBucket: `// Get bucket details
const bucket = await hypz.buckets.get(bucketId);

console.log('Bucket:', bucket.data.name);
console.log('Files:', bucket.data.file_count);
console.log('Total size:', bucket.data.total_size);`,

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

console.log('Total files:', stats.data.total_files);
console.log('Total size:', stats.data.total_size);
console.log('Total downloads:', stats.data.total_downloads);
console.log('File types:', stats.data.typeDistribution);`,

      uploadFile: `// Upload a file
const file = await hypz.files.upload({
  bucketId: bucketId,
  file: fileBuffer, // File buffer or stream
  fileName: 'image.jpg',
  isPublic: false,
  tags: ['profile', 'avatar'],
  metadata: { userId: '123', category: 'images' }
});

console.log('File uploaded:', file.data.url);
console.log('CDN URL:', file.data.cdn_url);`,

      listFiles: `// List files in bucket
const { files, pagination } = await hypz.files.list(bucketId, {
  page: 1,
  limit: 20,
  search: 'image',
  sortBy: 'created_at',
  order: 'DESC'
});

files.forEach(file => {
  console.log(\`\${file.original_name} - \${file.formattedSize}\`);
});`,

      getFile: `// Get file details
const file = await hypz.files.get(fileId);

console.log('Filename:', file.data.original_name);
console.log('Size:', file.data.size);
console.log('Downloads:', file.data.downloads);
console.log('URL:', file.data.url);`,

      downloadFile: `// Download file (works for both public and private files)
const fileData = await hypz.files.download(fileId);

// Save to disk
require('fs').writeFileSync('downloaded-file.jpg', fileData);

// Note: For private files, authentication is automatically handled 
// by the SDK using your API key. Public files don't require authentication.`,

      updateFile: `// Update file metadata
const updated = await hypz.files.update(fileId, {
  isPublic: true,
  tags: ['featured', 'homepage'],
  metadata: { priority: 'high' }
});`,

      deleteFile: `// Delete a file
await hypz.files.delete(fileId);

console.log('File deleted successfully');`,

      bulkDelete: `// Delete multiple files at once
const result = await hypz.files.bulkDelete([123, 456, 789]);

console.log(\`Deleted \${result.data.deletedCount} files\`);
console.log(\`Freed \${result.data.totalSize} bytes\`);`,

      bulkUpdate: `// Update multiple files at once
const result = await hypz.files.bulkUpdate({
  fileIds: [123, 456, 789],
  isPublic: true,
  tags: ['archived', '2024'],
  metadata: { processed: true }
});

console.log(\`Updated \${result.data.updatedCount} files\`);`,

      bulkDownload: `// Get download URLs for multiple files
const result = await hypz.files.bulkDownload([123, 456, 789]);

result.data.files.forEach(file => {
  console.log(\`\${file.filename}: \${file.downloadUrl}\`);
});`,

      bulkMove: `// Move multiple files to another bucket
const result = await hypz.files.bulkMove({
  fileIds: [123, 456, 789],
  targetBucketId: 42
});

console.log(\`Moved \${result.data.movedCount} files\`);`,

      bulkUpload: `// Upload multiple files at once (up to 20 files)
const fs = require('fs');

const result = await hypz.files.bulkUpload({
  bucketId: 'your-bucket-id',
  files: [
    { file: fs.createReadStream('./photo1.jpg'), filename: 'photo1.jpg' },
    { file: fs.createReadStream('./photo2.jpg'), filename: 'photo2.jpg' },
    { file: Buffer.from('content'), filename: 'data.txt' }
  ],
  isPublic: false,
  tags: ['batch-upload', '2024'],
  metadata: { source: 'bulk-import' }
});

console.log(\`Uploaded \${result.data.uploadedCount} files\`);
console.log(\`Total size: \${result.data.totalSize} bytes\`);

// Check for any errors
if (result.data.errors && result.data.errors.length > 0) {
  console.log(\`Errors: \${result.data.errorCount}\`);
  result.data.errors.forEach(err => {
    console.log(\`  - \${err.filename}: \${err.error}\`);
  });
}`,

      createApiKey: `// Create a new API key
const apiKey = await hypz.apiKeys.create({
  name: 'Production Server',
  permissions: ['files:read', 'files:write', 'buckets:read'],
  expiresAt: '2025-12-31'
});

console.log('API Key:', apiKey.data.key);
console.log('Keep this secure!');`,

      listApiKeys: `// List all API keys
const apiKeys = await hypz.apiKeys.list();

apiKeys.data.forEach(key => {
  console.log(\`\${key.name}: \${key.last_used_at || 'Never used'}\`);
});`,

      revokeApiKey: `// Revoke an API key
await hypz.apiKeys.revoke(apiKeyId);

console.log('API key revoked');`,

      signedUrls: `// Generate signed URL for temporary access (max 7 days = 604800 seconds)
const signedUrl = await hypz.files.getSignedURL(fileId, 3600); // 1 hour

console.log('Signed URL:', signedUrl.data.url);
console.log('Expires at:', signedUrl.data.expiresAt);
console.log('Expires in:', signedUrl.data.expiresIn, 'seconds');

// Maximum expiry: 7 days
const maxExpiryUrl = await hypz.files.getSignedURL(fileId, 604800);

// Exceeding 7 days will be automatically capped
const cappedUrl = await hypz.files.getSignedURL(fileId, 2592000); // 30 days requested
console.log('Actual expiry:', cappedUrl.data.expiresIn, 'seconds'); // Will be 604800`,

      publicFiles: `// Make a file publicly accessible
await hypz.files.update(fileId, { isPublic: true });

// Get public download URL (no auth required)
const publicUrl = \`https://api.hypz.io/api/v1/files/public/\${fileId}/download\`;`,

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
    console.log('Rate limit hit. Try again in:', error.retryAfter);
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
    base_url='https://api.hypz.io'  # Optional
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
with open('image.jpg', 'rb') as f:
    file = hypz.files.upload(bucket_id,
        file=f,
        filename='image.jpg',
        is_public=False,
        tags=['profile', 'avatar'],
        metadata={'user_id': '123', 'category': 'images'}
    )

print(f'File uploaded: {file["url"]}')
print(f'CDN URL: {file["cdn_url"]}')`,

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
updated = hypz.files.update(file_id,
    is_public=True,
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
    is_public=True,
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
        is_public=False,
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

      publicFiles: `# Make a file publicly accessible
hypz.files.update(file_id, is_public=True)

# Get public download URL (no auth required)
public_url = f'https://api.hypz.io/api/files/public/{file_id}/download'`,

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
    .baseUrl("https://api.hypz.io") // Optional
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
File localFile = new File("image.jpg");
FileUpload file = hypz.files().upload(bucketId,
    new UploadFileRequest()
        .file(localFile)
        .filename("image.jpg")
        .isPublic(false)
        .tags(Arrays.asList("profile", "avatar"))
        .metadata(Map.of("userId", "123", "category", "images"))
);

System.out.println("File uploaded: " + file.getUrl());
System.out.println("CDN URL: " + file.getCdnUrl());`,

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
FileInfo updated = hypz.files().update(fileId,
    new UpdateFileRequest()
        .isPublic(true)
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
        .isPublic(true)
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
import java.io.File;

BulkUploadResponse result = hypz.files().bulkUpload(
    new BulkUploadRequest()
        .bucketId("your-bucket-id")
        .addFile(new File("photo1.jpg"))
        .addFile(new File("photo2.jpg"))
        .addFile("data.txt", "content".getBytes())
        .isPublic(false)
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

      publicFiles: `// Make a file publicly accessible
hypz.files().update(fileId, 
    new UpdateFileRequest().isPublic(true)
);

// Get public download URL (no auth required)
String publicUrl = "https://api.hypz.io/api/files/public/" + 
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
     https://api.hypz.io/api/user

# Method 2: Using query parameter
curl "https://api.hypz.io/api/user?api_key=your-api-key-here"`,

      createBucket: `# Create a new bucket
curl -X POST https://api.hypz.io/api/buckets \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my-awesome-bucket",
    "visibility": "private",
    "description": "Store my app assets",
    "region": "us-east-1"
  }'`,

      listBuckets: `# List all buckets with pagination
curl -X GET "https://api.hypz.io/api/buckets?page=1&limit=10&search=my-bucket" \\
  -H "x-api-key: your-api-key-here"`,

      getBucket: `# Get bucket details
curl -X GET https://api.hypz.io/api/buckets/{bucketId} \\
  -H "x-api-key: your-api-key-here"`,

      updateBucket: `# Update bucket settings
curl -X PUT https://api.hypz.io/api/buckets/{bucketId} \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "visibility": "public",
    "description": "Updated description",
    "corsEnabled": true,
    "corsOrigins": ["https://myapp.com"]
  }'`,

      deleteBucket: `# Delete empty bucket (safe mode)
curl -X DELETE https://api.hypz.io/api/buckets/{bucketId} \\
  -H "x-api-key: your-api-key-here"

# Force delete bucket with files (use with caution!)
curl -X DELETE "https://api.hypz.io/api/buckets/{bucketId}?force=true" \\
  -H "x-api-key: your-api-key-here"`,

      bucketStats: `# Get bucket statistics
curl -X GET https://api.hypz.io/api/buckets/{bucketId}/stats \\
  -H "x-api-key: your-api-key-here"`,

      uploadFile: `# Upload a file
curl -X POST https://api.hypz.io/api/files/{bucketId}/upload \\
  -H "x-api-key: your-api-key-here" \\
  -F "file=@/path/to/image.jpg" \\
  -F "isPublic=false" \\
  -F "tags=profile,avatar" \\
  -F 'metadata={"userId":"123","category":"images"}'`,

      listFiles: `# List files in bucket
curl -X GET "https://api.hypz.io/api/files/{bucketId}/files?page=1&limit=20&search=image&sortBy=created_at&order=DESC" \\
  -H "x-api-key: your-api-key-here"`,

      getFile: `# Get file details
curl -X GET https://api.hypz.io/api/files/file/{fileId} \\
  -H "x-api-key: your-api-key-here"`,

      downloadFile: `# Download file (works for both public and private files)
curl -X GET https://api.hypz.io/api/files/file/{fileId}/download \\
  -H "x-api-key: your-api-key-here" \\
  --output downloaded-file.jpg

# Note: For private files, the x-api-key header is required for authentication.
# Public files don't require authentication but including it still works.`,

      updateFile: `# Update file metadata
curl -X PATCH https://api.hypz.io/api/files/file/{fileId} \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "isPublic": true,
    "tags": ["featured", "homepage"],
    "metadata": {"priority": "high"}
  }'`,

      deleteFile: `# Delete a file
curl -X DELETE https://api.hypz.io/api/files/file/{fileId} \\
  -H "x-api-key: your-api-key-here"`,

      bulkDelete: `# Delete multiple files at once
curl -X POST https://api.hypz.io/api/files/bulk/delete \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fileIds": [123, 456, 789]
  }'`,

      bulkUpdate: `# Update multiple files at once
curl -X POST https://api.hypz.io/api/files/bulk/update \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fileIds": [123, 456, 789],
    "isPublic": true,
    "tags": ["archived", "2024"],
    "metadata": {"processed": true}
  }'`,

      bulkDownload: `# Get download URLs for multiple files
curl -X POST https://api.hypz.io/api/files/bulk/download \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fileIds": [123, 456, 789]
  }'`,

      bulkMove: `# Move multiple files to another bucket
curl -X POST https://api.hypz.io/api/files/bulk/move \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fileIds": [123, 456, 789],
    "targetBucketId": 42
  }'`,

      bulkUpload: `# Upload multiple files at once (up to 20 files)
curl -X POST https://api.hypz.io/api/files/{bucketId}/bulk-upload \\
  -H "x-api-key: your-api-key-here" \\
  -F "files=@photo1.jpg" \\
  -F "files=@photo2.jpg" \\
  -F "files=@data.txt" \\
  -F "isPublic=false" \\
  -F "tags=[\\"batch-upload\\",\\"2024\\"]" \\
  -F "metadata={\\"source\\":\\"bulk-import\\"}"

# Response includes uploaded files and any errors:
# {
#   "uploadedCount": 2,
#   "errorCount": 1,
#   "totalSize": 2048576,
#   "files": [...],
#   "errors": [{"filename": "data.txt", "error": "File too large"}]
# }`,

      createApiKey: `# Create a new API key
curl -X POST https://api.hypz.io/api/api-keys \\
  -H "Authorization: Bearer your-jwt-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production Server",
    "permissions": ["files:read", "files:write", "buckets:read"],
    "expiresAt": "2025-12-31"
  }'`,

      listApiKeys: `# List all API keys
curl -X GET https://api.hypz.io/api/api-keys \\
  -H "Authorization: Bearer your-jwt-token"`,

      revokeApiKey: `# Revoke an API key
curl -X DELETE https://api.hypz.io/api/api-keys/{apiKeyId} \\
  -H "Authorization: Bearer your-jwt-token"`,

      signedUrls: `# Generate signed URL for temporary access (max 7 days = 604800 seconds)
curl -X POST https://api.hypz.io/api/files/file/{fileId}/signed-url \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "expiresIn": 3600
  }'

# Response includes URL and expiry information:
# {
#   "success": true,
#   "data": {
#     "url": "https://api.hypz.io/api/v1/files/file/{fileId}/download-signed?token=...",
#     "expiresAt": "2025-11-04T10:00:00.000Z",
#     "expiresIn": 3600,
#     "maxExpiresIn": 604800,
#     "isPrivate": true,
#     "note": "Maximum expiry time (7 days) applied" // If capped
#   }
# }

# Maximum expiry: 7 days (604800 seconds)
# Exceeding this value will be automatically capped`,

      publicFiles: `# Make a file publicly accessible
curl -X PATCH https://api.hypz.io/api/files/file/{fileId} \\
  -H "x-api-key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{"isPublic": true}'

# Download public file (no auth required)
curl -X GET https://api.hypz.io/api/files/public/{fileId}/download \\
  --output file.jpg`,

      cors: `# Enable CORS for a bucket
curl -X PUT https://api.hypz.io/api/buckets/{bucketId} \\
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
curl -X GET https://api.hypz.io/api/buckets \\
  -H "x-api-key: your-api-key-here" \\
  --retry 3 \\
  --retry-delay 5`
    }
  };

  const CodeBlock = ({ code, language }) => (
    <div className="relative group">
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
        }}
        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 z-10"
      >
        <DocumentTextIcon className="w-4 h-4" />
        Copy
      </button>
      <SyntaxHighlighter
        language={language === 'javascript' ? 'javascript' : language === 'python' ? 'python' : language === 'java' ? 'java' : 'bash'}
        style={isDark ? vscDarkPlus : vs}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          padding: '1.25rem'
        }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );

  const Section = ({ id, title, icon: Icon, children }) => (
    <div id={id} data-section={id} className="mb-12 scroll-mt-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );

  const SubSection = ({ id, title, description, codeKey, icon: Icon }) => (
    <div id={id} data-section={id} className="mb-8 scroll-mt-20">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      </div>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      )}
      {codeKey && codeExamples[activeLanguage][codeKey] && (
        <CodeBlock 
          code={codeExamples[activeLanguage][codeKey]} 
          language={activeLanguage === 'curl' ? 'bash' : activeLanguage}
        />
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Documentation - Hypz Cloud Storage</title>
        <meta name="description" content="Complete API documentation for Hypz Cloud Storage with examples in JavaScript, Python, Java, and cURL" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-3">
                  <BookOpenIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hypz Documentation</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Complete API Reference & Guides</p>
                  </div>
                </div>
              </div>
              
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                {languages.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setActiveLanguage(lang.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeLanguage === lang.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="mr-2">{lang.icon}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 sticky top-24 self-start">
              <nav className="space-y-1">
                {sections.map(section => (
                  <div key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                    {section.subsections && activeSection === section.id && (
                      <div className="ml-8 mt-1 space-y-1">
                        {section.subsections.map(sub => (
                          <button
                            key={sub}
                            onClick={() => scrollToSection(sub)}
                            className="w-full text-left px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {sub.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl">
              {/* Getting Started */}
              <Section id="getting-started" title="Getting Started" icon={RocketLaunchIcon}>
                <SubSection
                  id="introduction"
                  title="Introduction"
                  description="Hypz is a powerful cloud storage API that makes it easy to store, manage, and serve files. Built for developers who need reliable, scalable storage with a simple API."
                />
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">🚀 Quick Start</h4>
                  <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-400">
                    <li>Sign up for a free account at <a href="/register" className="underline">hypz.io</a></li>
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
                <p className="text-gray-600 dark:text-gray-400 mb-8">
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

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">⚠️ Safety First</h4>
                  <p className="text-yellow-800 dark:text-yellow-400">
                    The delete bucket endpoint includes a safety check - it will only delete empty buckets by default. 
                    This prevents accidental data loss. To force delete a bucket with files, use the <code className="bg-yellow-100 dark:bg-yellow-900 px-1.5 py-0.5 rounded">force=true</code> parameter.
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
                <p className="text-gray-600 dark:text-gray-400 mb-8">
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
                  id="list-files"
                  title="List Files"
                  icon={Squares2X2Icon}
                  description="List all files in a bucket with pagination, search, and sorting options."
                  codeKey="listFiles"
                />

                <SubSection
                  id="get-file"
                  title="Get File"
                  icon={DocumentTextIcon}
                  description="Retrieve detailed information about a specific file."
                  codeKey="getFile"
                />

                <SubSection
                  id="download-file"
                  title="Download File"
                  icon={CloudArrowDownIcon}
                  description="Download a file from your bucket."
                  codeKey="downloadFile"
                />

                <SubSection
                  id="update-file"
                  title="Update File"
                  icon={PencilSquareIcon}
                  description="Update file metadata, tags, or visibility settings."
                  codeKey="updateFile"
                />

                <SubSection
                  id="delete-file"
                  title="Delete File"
                  icon={TrashIcon}
                  description="Permanently delete a file from your bucket."
                  codeKey="deleteFile"
                />
              </Section>

              {/* Bulk Operations */}
              <Section id="bulk-operations" title="Bulk Operations" icon={Squares2X2Icon}>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Perform operations on multiple files at once for increased efficiency. All bulk operations support up to 100 files (50 for downloads).
                </p>

                <SubSection
                  id="bulk-delete"
                  title="Bulk Delete"
                  icon={TrashIcon}
                  description="Delete multiple files in a single request. Maximum 100 files per request."
                  codeKey="bulkDelete"
                />

                <SubSection
                  id="bulk-update"
                  title="Bulk Update"
                  icon={PencilSquareIcon}
                  description="Update metadata, tags, or visibility for multiple files at once. Maximum 100 files per request."
                  codeKey="bulkUpdate"
                />

                <SubSection
                  id="bulk-download"
                  title="Bulk Download"
                  icon={CloudArrowDownIcon}
                  description="Get download URLs for multiple files at once. Maximum 50 files per request. Private files require authentication when downloading."
                  codeKey="bulkDownload"
                />

                <SubSection
                  id="bulk-move"
                  title="Bulk Move"
                  icon={ArrowsRightLeftIcon}
                  description="Move multiple files to another bucket. Maximum 100 files per request."
                  codeKey="bulkMove"
                />

                <SubSection
                  id="bulk-upload"
                  title="Bulk Upload"
                  icon={CloudArrowUpIcon}
                  description="Upload multiple files at once. Maximum 20 files per request. Supports partial success - some files may succeed while others fail."
                  codeKey="bulkUpload"
                />

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">💡 Performance Tip</h4>
                  <p className="text-green-800 dark:text-green-400">
                    Bulk operations are significantly faster than individual requests when working with multiple files. 
                    Use them whenever possible to reduce API calls and improve performance.
                  </p>
                </div>
              </Section>

              {/* API Keys */}
              <Section id="api-keys" title="API Keys" icon={KeyIcon}>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Manage API keys for authentication. Each key can have specific permissions and expiration dates.
                </p>

                <SubSection
                  id="create-api-key"
                  title="Create API Key"
                  icon={KeyIcon}
                  description="Create a new API key with specific permissions. Note: API key creation requires JWT authentication."
                  codeKey="createApiKey"
                />

                <SubSection
                  id="list-api-keys"
                  title="List API Keys"
                  icon={Squares2X2Icon}
                  description="List all your API keys with their permissions and usage information."
                  codeKey="listApiKeys"
                />

                <SubSection
                  id="revoke-api-key"
                  title="Revoke API Key"
                  icon={TrashIcon}
                  description="Revoke an API key to immediately disable its access."
                  codeKey="revokeApiKey"
                />

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">🔒 Security Best Practices</h4>
                  <ul className="list-disc list-inside space-y-1 text-red-800 dark:text-red-400">
                    <li>Never commit API keys to source control</li>
                    <li>Use environment variables to store API keys</li>
                    <li>Create separate keys for development and production</li>
                    <li>Set appropriate permissions for each key</li>
                    <li>Rotate keys periodically</li>
                    <li>Revoke unused or compromised keys immediately</li>
                  </ul>
                </div>
              </Section>

              {/* Advanced */}
              <Section id="advanced" title="Advanced" icon={ShieldCheckIcon}>
                <SubSection
                  id="signed-urls"
                  title="Signed URLs"
                  icon={ShieldCheckIcon}
                  description="Generate temporary, secure URLs for file access without requiring API keys. Perfect for sharing files with time-limited access."
                  codeKey="signedUrls"
                />

                <SubSection
                  id="public-files"
                  title="Public Files"
                  icon={CloudArrowDownIcon}
                  description="Make files publicly accessible without authentication. Useful for serving static assets like images, videos, and documents."
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

                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-4">📊 Rate Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">100</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Requests / Minute</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">1,000</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Requests / Hour</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10 GB</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Upload / Day</div>
                    </div>
                  </div>
                </div>
              </Section>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Need Help?</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li><a href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">Contact Support</a></li>
                      <li><a href="https://github.com/ysr-hameed/hypz" className="hover:text-blue-600 dark:hover:text-blue-400">GitHub Repository</a></li>
                      <li><a href="/api" className="hover:text-blue-600 dark:hover:text-blue-400">API Reference</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">SDKs</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li><a href="https://www.npmjs.com/package/hypz-sdk" className="hover:text-blue-600 dark:hover:text-blue-400">JavaScript/Node.js</a></li>
                      <li><a href="https://pypi.org/project/hypz-sdk/" className="hover:text-blue-600 dark:hover:text-blue-400">Python</a></li>
                      <li><a href="https://github.com/ysr-hameed/hypz/tree/main/hypz-sdk/java" className="hover:text-blue-600 dark:hover:text-blue-400">Java</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Resources</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li><a href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400">Pricing</a></li>
                      <li><a href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</a></li>
                      <li><a href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400">Blog</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Documentation;
