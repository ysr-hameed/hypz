import { Link } from 'react-router-dom';
import { Code, Book, Zap, Key, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import SEO from '../components/SEO';

const Api = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const apiConfig = {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    productionUrl: 'https://api.hypz.io/v1'
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'APIReference',
    name: 'Hypz API',
    description: 'RESTful API for object storage operations',
    url: 'https://hypz.io/api',
    provider: {
      '@type': 'Organization',
      name: 'Hypz'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <SEO
        title="API Reference - Hypz Object Storage | REST API Endpoints"
        description="Complete REST API reference for Hypz object storage. Learn about authentication, endpoints, request/response formats, and error handling."
        keywords="rest api, api reference, api endpoints, storage api, http api, api authentication, api documentation"
        url="/api"
        structuredData={structuredData}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <Code className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            API Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Complete reference for all working Hypz Storage API endpoints
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://github.com/hypz/hypz-storage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <ExternalLink size={18} />
              GitHub
            </a>
            <Link
              to="/dashboard/api-keys"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Key size={18} />
              Get API Keys
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">13</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Endpoint Groups</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">80+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">API Endpoints</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">REST</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Architecture</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">JSON</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Response Format</div>
          </div>
        </div>

        {/* API Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            API Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            The Hypz API is a RESTful API that allows you to programmatically manage cloud storage, 
            files, subscriptions, payments, and more. All requests use HTTPS and return JSON responses.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-500 mb-2">Base URL</div>
              <code className="text-xs text-primary-600 dark:text-primary-400 font-mono break-all">
                {apiConfig.baseUrl}
              </code>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-500 mb-2">Authentication</div>
              <code className="text-xs text-primary-600 dark:text-primary-400 font-mono">
                Bearer Token / API Key
              </code>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-500 mb-2">Rate Limit</div>
              <code className="text-xs text-primary-600 dark:text-primary-400 font-mono">
                100 req/15min
              </code>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🔐 Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            All API requests require authentication using either JWT Bearer Token or API Key:
          </p>
          <div className="space-y-3">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-2">JWT Bearer Token:</div>
              <code className="text-green-400 font-mono text-sm">
                Authorization: Bearer your_jwt_token
              </code>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-2">API Key (Header):</div>
              <code className="text-green-400 font-mono text-sm">
                X-API-Key: your_api_key
              </code>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-2">API Key (Query):</div>
              <code className="text-green-400 font-mono text-sm">
                GET /endpoint?api_key=your_api_key
              </code>
            </div>
          </div>
        </div>

        {/* Endpoint Groups */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📚 Endpoint Groups
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'Authentication', count: 8, icon: '🔐', color: 'blue' },
              { name: 'User Management', count: 5, icon: '👤', color: 'green' },
              { name: 'OAuth', count: 4, icon: '🔗', color: 'purple' },
              { name: 'Two-Factor Auth', count: 4, icon: '🔒', color: 'red' },
              { name: 'Plans & Subscriptions', count: 9, icon: '💳', color: 'yellow' },
              { name: 'Payments & Billing', count: 3, icon: '💰', color: 'green' },
              { name: 'Buckets', count: 6, icon: '🗂️', color: 'blue' },
              { name: 'Files', count: 8, icon: '📁', color: 'purple' },
              { name: 'API Keys', count: 6, icon: '🔑', color: 'orange' },
              { name: 'Usage Tracking', count: 3, icon: '📊', color: 'pink' },
              { name: 'Notifications', count: 4, icon: '🔔', color: 'indigo' },
              { name: 'Admin', count: 8, icon: '👑', color: 'red' }
            ].map((group, idx) => (
              <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{group.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                      <p className="text-xs text-gray-500">{group.count} endpoints</p>
                    </div>
                  </div>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Endpoints */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🚀 Popular Endpoints
          </h2>
          
          <div className="space-y-4">
            {/* Authentication */}
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
                  POST
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /auth/register
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Register a new user account with email validation
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
                  POST
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /auth/login
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Authenticate with email/password, get JWT token
              </p>
            </div>

            {/* Subscriptions */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                  GET
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /subscriptions/usage-cost
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get detailed usage breakdown with 9 metrics and cost calculations (PAYG)
              </p>
            </div>

                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded">
                      POST
                    </span>
                    <code className="text-sm font-mono text-gray-900 dark:text-white">
                      /subscriptions/subscribe
                    </code>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create new subscription with LemonSqueezy checkout
                  </p>
                </div>            {/* Files */}
            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded">
                  POST
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /files/:bucketId/upload
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload file with multipart/form-data (supports tags, metadata, public/private)
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
                  GET
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /files/:bucketId/files
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                List all files in bucket with pagination, search, and filters
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                  GET
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /files/file/:fileId/download
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download file as binary stream with proper headers
              </p>
            </div>

            {/* Buckets */}
            <div className="border-l-4 border-indigo-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded">
                  POST
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /buckets
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create new storage bucket with custom configuration
              </p>
            </div>

            <div className="border-l-4 border-pink-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-xs font-bold rounded">
                  POST
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /api-keys
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create API key with custom permissions and rate limits
              </p>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            💻 Code Examples
          </h2>
          
          {/* Example 1: Login */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Login & Authentication</h3>
            <div className="relative">
              <button
                onClick={() => copyToClipboard(`const response = await fetch('${apiConfig.baseUrl}/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
const token = data.data.token;
logger.log('JWT Token:', token);`, 'login')}
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition"
              >
                {copiedCode === 'login' ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm"><code className="text-gray-300 font-mono">{`const response = await fetch('${apiConfig.baseUrl}/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
const token = data.data.token;
logger.log('JWT Token:', token);`}</code></pre>
              </div>
            </div>
          </div>

          {/* Example 2: File Upload */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Upload File</h3>
            <div className="relative">
              <button
                onClick={() => copyToClipboard(`const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('tags', JSON.stringify(['image', 'profile']));

const response = await fetch('${apiConfig.baseUrl}/files/BUCKET_ID/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});

const data = await response.json();
logger.log('File uploaded:', data.data.url);
// Note: File visibility automatically matches bucket visibility`, 'upload')}
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition"
              >
                {copiedCode === 'upload' ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm"><code className="text-gray-300 font-mono">{`const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('tags', JSON.stringify(['image', 'profile']));

const response = await fetch('${apiConfig.baseUrl}/files/BUCKET_ID/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});

const data = await response.json();
logger.log('File uploaded:', data.data.url);`}</code></pre>
              </div>
            </div>
          </div>

          {/* Example 3: Get Usage & Costs */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Get Usage & Costs (PAYG)</h3>
            <div className="relative">
              <button
                onClick={() => copyToClipboard(`const response = await fetch('${apiConfig.baseUrl}/subscriptions/usage-cost', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const data = await response.json();
logger.log('Usage:', data.data.usage);
logger.log('Costs:', data.data.costs);
logger.log('Total:', data.data.costs.total);`, 'usage')}
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition"
              >
                {copiedCode === 'usage' ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm"><code className="text-gray-300 font-mono">{`const response = await fetch('${apiConfig.baseUrl}/subscriptions/usage-cost', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const data = await response.json();
logger.log('Usage:', data.data.usage);
logger.log('Costs:', data.data.costs);
logger.log('Total:', data.data.costs.total);`}</code></pre>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ⚡ Rate Limits
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Endpoint Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Rate Limit</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Window</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-300">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">Authentication</td>
                  <td className="py-3 px-4 font-mono">5 requests</td>
                  <td className="py-3 px-4">15 minutes</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">File Upload</td>
                  <td className="py-3 px-4 font-mono">50 requests</td>
                  <td className="py-3 px-4">1 minute</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">File Download</td>
                  <td className="py-3 px-4 font-mono">100 requests</td>
                  <td className="py-3 px-4">1 minute</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">General API</td>
                  <td className="py-3 px-4 font-mono">100 requests</td>
                  <td className="py-3 px-4">15 minutes</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Admin API</td>
                  <td className="py-3 px-4 font-mono">200 requests</td>
                  <td className="py-3 px-4">15 minutes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Rate limit headers are included in every response: <code className="text-primary-600 dark:text-primary-400">X-RateLimit-Limit</code>, 
            <code className="text-primary-600 dark:text-primary-400"> X-RateLimit-Remaining</code>, 
            <code className="text-primary-600 dark:text-primary-400"> X-RateLimit-Reset</code>
          </p>
        </div>

        {/* Status Codes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📋 HTTP Status Codes
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10">
              <div className="font-mono font-bold text-green-700 dark:text-green-400 mb-1">200 OK</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Request successful</div>
            </div>
            <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10">
              <div className="font-mono font-bold text-green-700 dark:text-green-400 mb-1">201 Created</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resource created successfully</div>
            </div>
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
              <div className="font-mono font-bold text-yellow-700 dark:text-yellow-400 mb-1">400 Bad Request</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Validation error or invalid request</div>
            </div>
            <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10">
              <div className="font-mono font-bold text-orange-700 dark:text-orange-400 mb-1">401 Unauthorized</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Missing or invalid authentication</div>
            </div>
            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
              <div className="font-mono font-bold text-red-700 dark:text-red-400 mb-1">403 Forbidden</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Not authorized for this resource</div>
            </div>
            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
              <div className="font-mono font-bold text-red-700 dark:text-red-400 mb-1">404 Not Found</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resource not found</div>
            </div>
            <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/10">
              <div className="font-mono font-bold text-purple-700 dark:text-purple-400 mb-1">429 Too Many Requests</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rate limit exceeded</div>
            </div>
            <div className="p-4 border-l-4 border-gray-500 bg-gray-50 dark:bg-gray-900/10">
              <div className="font-mono font-bold text-gray-700 dark:text-gray-400 mb-1">500 Internal Server Error</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Server error occurred</div>
            </div>
          </div>
        </div>

        {/* Full Documentation Link */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center">
          <Book className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Complete API Reference</h2>
          <p className="mb-6 opacity-90 max-w-2xl mx-auto">
            View the complete API documentation with detailed request/response examples, 
            authentication flows, and integration guides.
          </p>
          <a
            href={`${window.location.origin}/backend/API_DOCS.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            <Book size={20} />
            View Full Documentation
          </a>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center space-x-4 text-sm">
          <Link to="/dashboard/api-keys" className="text-primary-600 hover:text-primary-700 font-medium">
            Get API Keys
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/pricing" className="text-primary-600 hover:text-primary-700 font-medium">
            View Plans
          </Link>
          <span className="text-gray-400">•</span>
          <a href="mailto:support@hypz.io" className="text-primary-600 hover:text-primary-700 font-medium">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default Api;
