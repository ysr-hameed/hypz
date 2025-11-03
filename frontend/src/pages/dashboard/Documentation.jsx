import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Book, Code, Rocket, Key, Upload, Shield, Database, 
  Cloud, Terminal, Download, Settings, Zap, Copy, Check,
  ExternalLink, Package
} from 'lucide-react';

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('javascript');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.hypz.io/api/v1';

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const NavButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all ${
        activeTab === id
          ? 'bg-blue-500 text-white shadow-lg'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const Section = ({ title, children, icon: Icon }) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon className="text-blue-500" size={28} />}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );

  const CodeBlock = ({ code, language = 'javascript', id }) => (
    <div className="relative group">
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        <span className="text-xs text-gray-400 uppercase font-mono">{language}</span>
        <button
          onClick={() => copyCode(code, id)}
          className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          {copiedCode === id ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-300" />}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className="text-sm font-mono">{code}</code>
      </pre>
    </div>
  );

  const Endpoint = ({ method, path, description }) => (
    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
      <span className={`px-3 py-1 rounded-md text-xs font-bold ${
        method === 'GET' ? 'bg-green-100 text-green-700' :
        method === 'POST' ? 'bg-blue-100 text-blue-700' :
        method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
        'bg-red-100 text-red-700'
      }`}>
        {method}
      </span>
      <div className="flex-1">
        <code className="text-sm font-mono text-gray-900 dark:text-gray-100">{path}</code>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Developer API Documentation - Hypz Cloud Storage | S3-Compatible SDK</title>
        <meta name="description" content="Complete developer guide for integrating Hypz Cloud Storage into your applications. S3-compatible API with JavaScript SDK, RESTful endpoints, and code examples." />
        <meta name="keywords" content="hypz api, cloud storage api, s3 api, file storage sdk, developer documentation, rest api, javascript sdk" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Developer API Documentation - Hypz Cloud Storage" />
        <meta property="og:description" content="Integrate Hypz Cloud Storage into your apps with our S3-compatible API and JavaScript SDK" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Developer API Documentation - Hypz Cloud Storage" />
        <meta name="twitter:description" content="Integrate Hypz Cloud Storage into your apps with our S3-compatible API and JavaScript SDK" />
        
        {/* Schema.org for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": "Hypz Cloud Storage API Documentation for Developers",
            "description": "Complete API reference and SDK documentation for integrating Hypz S3-compatible cloud storage into your applications",
            "keywords": "API, SDK, Cloud Storage, S3, REST API, JavaScript, Developer Tools",
            "articleBody": "Developer documentation for Hypz Cloud Storage API - Learn how to integrate cloud storage into your applications using our RESTful API and JavaScript SDK"
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Code className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Developer Documentation
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                  Build powerful applications with Hypz S3-compatible cloud storage
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Zap className="text-blue-500 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">For Developers</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    This API is designed for developers who want to integrate Hypz cloud storage into their applications. 
                    Use our RESTful API or JavaScript SDK to build powerful file management features.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* Sidebar */}
            <div className="col-span-3">
              <div className="sticky top-4 space-y-2">
                <NavButton id="overview" icon={Book} label="Overview" />
                <NavButton id="quickstart" icon={Rocket} label="Quick Start" />
                <NavButton id="sdk" icon={Package} label="JavaScript SDK" />
                <NavButton id="authentication" icon={Shield} label="Authentication" />
                <NavButton id="buckets" icon={Database} label="Buckets" />
                <NavButton id="files" icon={Upload} label="Files" />
                <NavButton id="api-keys" icon={Key} label="API Keys" />
                <NavButton id="usage" icon={Settings} label="Usage & Stats" />
                <NavButton id="errors" icon={Terminal} label="Error Handling" />
              </div>
            </div>

            {/* Content */}
            <div className="col-span-9">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">

                {/* Overview */}
                {activeTab === 'overview' && (
                  <div>
                    <Section title="Overview" icon={Book}>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Hypz provides a developer-friendly S3-compatible cloud storage API that allows you to integrate 
                        file storage and management into your applications. Whether you're building a mobile app, web platform, 
                        or backend service, our API makes it easy to store, retrieve, and manage files.
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                          <Cloud className="text-blue-500 mb-2" size={24} />
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">S3-Compatible</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Familiar REST API similar to Amazon S3
                          </p>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                          <Zap className="text-green-500 mb-2" size={24} />
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Fast & Reliable</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Built on Backblaze B2 infrastructure
                          </p>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                          <Shield className="text-purple-500 mb-2" size={24} />
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Secure</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            API keys, JWT auth, and private buckets
                          </p>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                          <Code className="text-orange-500 mb-2" size={24} />
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Easy Integration</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            JavaScript SDK and REST API
                          </p>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Key Features</h3>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-6">
                        <li className="flex items-start gap-2">
                          <Check className="text-green-500 flex-shrink-0 mt-1" size={16} />
                          <span><strong>Bucket-based Privacy:</strong> Files inherit privacy from their bucket (public/private)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="text-green-500 flex-shrink-0 mt-1" size={16} />
                          <span><strong>Multiple Authentication:</strong> Use JWT tokens or API keys</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="text-green-500 flex-shrink-0 mt-1" size={16} />
                          <span><strong>File Metadata:</strong> Add custom tags and metadata to files</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="text-green-500 flex-shrink-0 mt-1" size={16} />
                          <span><strong>Usage Tracking:</strong> Monitor storage, bandwidth, and API calls</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="text-green-500 flex-shrink-0 mt-1" size={16} />
                          <span><strong>CDN Integration:</strong> Fast content delivery worldwide</span>
                        </li>
                      </ul>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Important: Bucket-Level Privacy</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          In Hypz, file privacy is determined by the bucket's visibility setting, not individual files. 
                          When you create a bucket with <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">visibility: "public"</code>, 
                          all files uploaded to that bucket will be publicly accessible. Private buckets require authentication for all file access.
                        </p>
                      </div>
                    </Section>

                    <Section title="Base URL">
                      <CodeBlock
                        id="base-url"
                        code={API_BASE_URL}
                        language="text"
                      />
                    </Section>
                  </div>
                )}

                {/* Quick Start */}
                {activeTab === 'quickstart' && (
                  <div>
                    <Section title="Quick Start" icon={Rocket}>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Get started with Hypz Cloud Storage in just 3 steps. This guide will help you make your first API call.
                      </p>

                      <div className="space-y-6">
                        {/* Step 1 */}
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            1. Get Your API Key
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            Sign up at Hypz and generate an API key from your dashboard.
                          </p>
                          <CodeBlock
                            id="step1"
                            code={`// Your API key will look like this
const apiKey = "hypz_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";`}
                            language="javascript"
                          />
                        </div>

                        {/* Step 2 */}
                        <div className="border-l-4 border-green-500 pl-4">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            2. Create Your First Bucket
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            Buckets are containers for your files. Create a public or private bucket.
                          </p>
                          <CodeBlock
                            id="step2"
                            code={`// Create a public bucket
const response = await fetch('${API_BASE_URL}/buckets', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'my-app-uploads',
    visibility: 'public', // or 'private'
    description: 'User uploads for my app'
  })
});

const bucket = await response.json();
console.log('Bucket created:', bucket.data.id);`}
                            language="javascript"
                          />
                        </div>

                        {/* Step 3 */}
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            3. Upload Your First File
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            Upload files to your bucket. File privacy inherits from the bucket.
                          </p>
                          <CodeBlock
                            id="step3"
                            code={`// Upload a file
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('tags', JSON.stringify(['user-avatar', 'profile']));

const uploadResponse = await fetch(\`${API_BASE_URL}/buckets/\${bucketId}/files\`, {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey
  },
  body: formData
});

const file = await uploadResponse.json();
console.log('File uploaded:', file.data.url);
console.log('CDN URL:', file.data.cdn_url);`}
                            language="javascript"
                          />
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                            <Check size={20} />
                            You're Ready!
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            That's it! You've successfully created a bucket and uploaded a file. 
                            Continue reading to learn about advanced features like the JavaScript SDK, file management, and usage tracking.
                          </p>
                        </div>
                      </div>
                    </Section>
                  </div>
                )}

                {/* JavaScript SDK */}
                {activeTab === 'sdk' && (
                  <div>
                    <Section title="JavaScript SDK" icon={Package}>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        The Hypz JavaScript SDK provides an easy-to-use interface for all API operations. 
                        It handles authentication, error handling, and provides TypeScript-friendly methods.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Installation</h3>
                      <div className="mb-6">
                        <CodeBlock
                          id="sdk-install-cdn"
                          code={`<!-- Via CDN (Browser) -->
<script src="${window.location.origin}/hypz-sdk.js"></script>`}
                          language="html"
                        />
                      </div>

                      <div className="mb-6">
                        <CodeBlock
                          id="sdk-install-download"
                          code={`// Or download hypz-sdk.js and include it in your project
// Available at: ${window.location.origin}/hypz-sdk.js`}
                          language="javascript"
                        />
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Initialize Client</h3>
                      <CodeBlock
                        id="sdk-init"
                        code={`// Initialize with API key
const client = new HypzClient({
  baseURL: '${API_BASE_URL}',
  apiKey: 'your_api_key_here'
});

// Or initialize with JWT token
const client = new HypzClient({
  baseURL: '${API_BASE_URL}',
  token: 'your_jwt_token_here'
});`}
                        language="javascript"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">SDK Examples</h3>

                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Create Bucket</h4>
                          <CodeBlock
                            id="sdk-create-bucket"
                            code={`const bucket = await client.createBucket({
  name: 'my-app-files',
  visibility: 'public', // Files in this bucket will be public
  description: 'Public files for my app'
});

console.log(bucket.data);`}
                            language="javascript"
                          />
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Upload File</h4>
                          <CodeBlock
                            id="sdk-upload"
                            code={`// Upload file (privacy determined by bucket)
const file = await client.uploadFile(bucketId, fileInput.files[0], {
  tags: ['avatar', 'user-profile'],
  metadata: { userId: '123', category: 'profile' }
});

console.log('File URL:', file.data.url);
console.log('CDN URL:', file.data.cdn_url);`}
                            language="javascript"
                          />
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">List Files</h4>
                          <CodeBlock
                            id="sdk-list-files"
                            code={`const files = await client.listFiles(bucketId, {
  page: 1,
  limit: 20,
  search: 'avatar',
  type: 'image/'
});

files.data.forEach(file => {
  console.log(file.original_name, file.size, file.url);
});`}
                            language="javascript"
                          />
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Delete File</h4>
                          <CodeBlock
                            id="sdk-delete"
                            code={`await client.deleteFile(fileId);
console.log('File deleted successfully');`}
                            language="javascript"
                          />
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Error Handling</h4>
                          <CodeBlock
                            id="sdk-errors"
                            code={`try {
  const file = await client.uploadFile(bucketId, file);
  console.log('Upload successful');
} catch (error) {
  if (error instanceof HypzError) {
    console.error('Status:', error.statusCode);
    console.error('Message:', error.message);
    console.error('Response:', error.response);
  }
}`}
                            language="javascript"
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                          <Download size={20} />
                          Download SDK
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                          Download the JavaScript SDK and start building immediately.
                        </p>
                        <a
                          href="/hypz-sdk.js"
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Download size={16} />
                          Download hypz-sdk.js
                        </a>
                      </div>
                    </Section>
                  </div>
                )}

                {/* Authentication */}
                {activeTab === 'authentication' && (
                  <div>
                    <Section title="Authentication" icon={Shield}>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Hypz supports two authentication methods: JWT tokens and API keys. Choose the method that best fits your use case.
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">JWT Tokens</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Best for user-facing applications. Short-lived and tied to user sessions.
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">API Keys</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Best for server-to-server communication. Long-lived with granular permissions.
                          </p>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Using JWT Tokens</h3>
                      <CodeBlock
                        id="auth-jwt"
                        code={`// Login to get JWT token
const response = await fetch('${API_BASE_URL}/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your_password'
  })
});

const { data } = await response.json();
const token = data.token;

// Use token in subsequent requests
fetch('${API_BASE_URL}/buckets', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});`}
                        language="javascript"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Using API Keys</h3>
                      <CodeBlock
                        id="auth-apikey"
                        code={`// Create API key (requires JWT token first)
const response = await fetch('${API_BASE_URL}/api-keys', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My App API Key',
    permissions: ['buckets:read', 'buckets:write', 'files:read', 'files:write']
  })
});

const { data } = await response.json();
const apiKey = data.key; // Save this securely!

// Use API key in requests
fetch('${API_BASE_URL}/buckets', {
  headers: {
    'X-API-Key': apiKey
  }
});`}
                        language="javascript"
                      />

                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-6">
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Security Warning</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Never expose your API keys in client-side code or public repositories. 
                          API keys are only shown once during creation. Store them securely in environment variables.
                        </p>
                      </div>
                    </Section>
                  </div>
                )}

                {/* Buckets */}
                {activeTab === 'buckets' && (
                  <div>
                    <Section title="Buckets" icon={Database}>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Buckets are containers for organizing your files. Each bucket has a visibility setting 
                        (public or private) that determines the privacy of all files within it.
                      </p>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Bucket Visibility</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          <strong>Public buckets:</strong> All files are publicly accessible via URL without authentication.<br/>
                          <strong>Private buckets:</strong> All files require authentication to access.
                        </p>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Endpoints</h3>
                      
                      <Endpoint
                        method="POST"
                        path="/buckets"
                        description="Create a new bucket"
                      />
                      
                      <Endpoint
                        method="GET"
                        path="/buckets"
                        description="List all buckets"
                      />
                      
                      <Endpoint
                        method="GET"
                        path="/buckets/:id"
                        description="Get bucket details"
                      />
                      
                      <Endpoint
                        method="PUT"
                        path="/buckets/:id"
                        description="Update bucket"
                      />
                      
                      <Endpoint
                        method="DELETE"
                        path="/buckets/:id"
                        description="Delete bucket"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Create Bucket</h3>
                      <CodeBlock
                        id="bucket-create"
                        code={`const response = await fetch('${API_BASE_URL}/buckets', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'my-public-files',
    visibility: 'public', // or 'private'
    description: 'Public files for my app',
    region: 'us-east-1'
  })
});

const bucket = await response.json();
console.log(bucket.data);`}
                        language="javascript"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">List Buckets</h3>
                      <CodeBlock
                        id="bucket-list"
                        code={`const response = await fetch('${API_BASE_URL}/buckets?page=1&limit=10', {
  headers: { 'X-API-Key': apiKey }
});

const { data, pagination } = await response.json();
data.forEach(bucket => {
  console.log(bucket.name, bucket.visibility, bucket.file_count);
});`}
                        language="javascript"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Update Bucket</h3>
                      <CodeBlock
                        id="bucket-update"
                        code={`const response = await fetch(\`${API_BASE_URL}/buckets/\${bucketId}\`, {
  method: 'PUT',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    visibility: 'private', // Change from public to private
    description: 'Updated description'
  })
});

const bucket = await response.json();`}
                        language="javascript"
                      />
                    </Section>
                  </div>
                )}

                {/* Files */}
                {activeTab === 'files' && (
                  <div>
                    <Section title="Files" icon={Upload}>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Upload, download, and manage files within buckets. File privacy is inherited from the bucket's visibility setting.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Endpoints</h3>
                      
                      <Endpoint
                        method="POST"
                        path="/buckets/:bucketId/files"
                        description="Upload file to bucket"
                      />
                      
                      <Endpoint
                        method="GET"
                        path="/buckets/:bucketId/files"
                        description="List files in bucket"
                      />
                      
                      <Endpoint
                        method="GET"
                        path="/files/:id"
                        description="Get file details"
                      />
                      
                      <Endpoint
                        method="GET"
                        path="/files/:id/download"
                        description="Get file download URL"
                      />
                      
                      <Endpoint
                        method="PUT"
                        path="/files/:id"
                        description="Update file metadata"
                      />
                      
                      <Endpoint
                        method="DELETE"
                        path="/files/:id"
                        description="Delete file"
                      />
                      
                      <Endpoint
                        method="POST"
                        path="/files/bulk-delete"
                        description="Delete multiple files"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Upload File</h3>
                      <CodeBlock
                        id="file-upload"
                        code={`// File privacy is determined by the bucket's visibility
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('tags', JSON.stringify(['user-upload', 'image']));
formData.append('metadata', JSON.stringify({ 
  userId: '123',
  category: 'profile'
}));

const response = await fetch(\`${API_BASE_URL}/buckets/\${bucketId}/files\`, {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey
  },
  body: formData
});

const file = await response.json();
console.log('File URL:', file.data.url);
console.log('CDN URL:', file.data.cdn_url);`}
                        language="javascript"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">List Files</h3>
                      <CodeBlock
                        id="file-list"
                        code={`const response = await fetch(\`${API_BASE_URL}/buckets/\${bucketId}/files?page=1&limit=20\`, {
  headers: { 'X-API-Key': apiKey }
});

const { data, pagination } = await response.json();
data.forEach(file => {
  console.log(file.original_name, file.size, file.url);
});`}
                        language="javascript"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Get Download URL</h3>
                      <CodeBlock
                        id="file-download"
                        code={`const response = await fetch(\`${API_BASE_URL}/files/\${fileId}/download\`, {
  headers: { 'X-API-Key': apiKey }
});

const { data } = await response.json();
console.log('Download URL:', data.download_url);

// Use the URL to download
window.location.href = data.download_url;`}
                        language="javascript"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Delete File</h3>
                      <CodeBlock
                        id="file-delete"
                        code={`const response = await fetch(\`${API_BASE_URL}/files/\${fileId}\`, {
  method: 'DELETE',
  headers: { 'X-API-Key': apiKey }
});

const result = await response.json();
console.log(result.message);`}
                        language="javascript"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Bulk Delete</h3>
                      <CodeBlock
                        id="file-bulk-delete"
                        code={`const response = await fetch('${API_BASE_URL}/files/bulk-delete', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileIds: ['file1_id', 'file2_id', 'file3_id']
  })
});

const result = await response.json();
console.log(\`Deleted \${result.data.deleted} files\`);`}
                        language="javascript"
                      />
                    </Section>
                  </div>
                )}

                {/* API Keys */}
                {activeTab === 'api-keys' && (
                  <div>
                    <Section title="API Keys" icon={Key}>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        API keys provide programmatic access to your Hypz account. Create keys with specific permissions 
                        for different applications or services.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Endpoints</h3>
                      
                      <Endpoint
                        method="POST"
                        path="/api-keys"
                        description="Create API key"
                      />
                      
                      <Endpoint
                        method="GET"
                        path="/api-keys"
                        description="List API keys"
                      />
                      
                      <Endpoint
                        method="DELETE"
                        path="/api-keys/:id"
                        description="Revoke API key"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Create API Key</h3>
                      <CodeBlock
                        id="apikey-create"
                        code={`const response = await fetch('${API_BASE_URL}/api-keys', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${jwtToken}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Production API Key',
    permissions: [
      'buckets:read',
      'buckets:write',
      'files:read',
      'files:write'
    ],
    expiresAt: '2025-12-31' // Optional
  })
});

const { data } = await response.json();
console.log('API Key:', data.key); // Save this securely!
console.log('Key ID:', data.id);`}
                        language="javascript"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Available Permissions</h3>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <code className="text-sm">buckets:read</code>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <code className="text-sm">buckets:write</code>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <code className="text-sm">files:read</code>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <code className="text-sm">files:write</code>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <code className="text-sm">files:delete</code>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <code className="text-sm">usage:read</code>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">List API Keys</h3>
                      <CodeBlock
                        id="apikey-list"
                        code={`const response = await fetch('${API_BASE_URL}/api-keys', {
  headers: {
    'Authorization': \`Bearer \${jwtToken}\`
  }
});

const { data } = await response.json();
data.forEach(key => {
  console.log(key.name, key.permissions, key.created_at);
  // Note: The actual key value is not returned for security
});`}
                        language="javascript"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Revoke API Key</h3>
                      <CodeBlock
                        id="apikey-revoke"
                        code={`const response = await fetch(\`${API_BASE_URL}/api-keys/\${keyId}\`, {
  method: 'DELETE',
  headers: {
    'Authorization': \`Bearer \${jwtToken}\`
  }
});

const result = await response.json();
console.log(result.message);`}
                        language="javascript"
                      />
                    </Section>
                  </div>
                )}

                {/* Usage */}
                {activeTab === 'usage' && (
                  <div>
                    <Section title="Usage & Stats" icon={Settings}>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Monitor your storage usage, bandwidth consumption, and API activity. Track metrics to optimize your application.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Endpoints</h3>
                      
                      <Endpoint
                        method="GET"
                        path="/usage"
                        description="Get usage statistics"
                      />
                      
                      <Endpoint
                        method="GET"
                        path="/usage/current"
                        description="Get current usage stats"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Get Current Usage</h3>
                      <CodeBlock
                        id="usage-current"
                        code={`const response = await fetch('${API_BASE_URL}/usage/current', {
  headers: { 'X-API-Key': apiKey }
});

const { data } = await response.json();
console.log('Storage Used:', data.storage_used);
console.log('Bandwidth Used:', data.bandwidth_used);
console.log('API Calls:', data.api_calls);
console.log('Files Count:', data.files_count);`}
                        language="javascript"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Available Metrics</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">storage_used</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total storage in bytes</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">bandwidth_used</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Bandwidth in bytes</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">api_calls</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total API requests</p>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">files_count</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Number of files</p>
                        </div>
                        <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">buckets_count</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Number of buckets</p>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">uploads_count</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total uploads</p>
                        </div>
                      </div>
                    </Section>
                  </div>
                )}

                {/* Error Handling */}
                {activeTab === 'errors' && (
                  <div>
                    <Section title="Error Handling" icon={Terminal}>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Hypz uses standard HTTP status codes and returns consistent error responses to help you handle errors gracefully.
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Error Response Format</h3>
                      <CodeBlock
                        id="error-format"
                        code={`{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}`}
                        language="json"
                      />

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">HTTP Status Codes</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">200</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">OK</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Request successful</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">201</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Created</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Resource created successfully</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">400</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Bad Request</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Invalid request parameters</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">401</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Unauthorized</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Missing or invalid authentication</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">404</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Not Found</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Resource does not exist</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded">429</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Too Many Requests</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Rate limit exceeded</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
                          <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded">500</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Internal Server Error</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Server error occurred</p>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Rate Limits</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">Plan</th>
                              <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">Requests/Hour</th>
                              <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">Burst</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-600 dark:text-gray-300">
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="p-3">Free</td>
                              <td className="p-3">1,000</td>
                              <td className="p-3">100/min</td>
                            </tr>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="p-3">Pro</td>
                              <td className="p-3">10,000</td>
                              <td className="p-3">500/min</td>
                            </tr>
                            <tr>
                              <td className="p-3">Enterprise</td>
                              <td className="p-3">Unlimited</td>
                              <td className="p-3">Custom</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">Example Error Handling</h3>
                      <CodeBlock
                        id="error-handling"
                        code={`async function uploadFile(bucketId, file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(\`${API_BASE_URL}/buckets/\${bucketId}/files\`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey },
      body: formData
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // Handle specific errors
      if (response.status === 401) {
        console.error('Invalid API key');
      } else if (response.status === 404) {
        console.error('Bucket not found');
      } else if (response.status === 429) {
        console.error('Rate limit exceeded');
      } else {
        console.error('Error:', result.message);
      }
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}`}
                        language="javascript"
                      />
                    </Section>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Documentation;
