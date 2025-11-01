import { Link } from 'react-router-dom';
import { Code, Book, Zap, Key } from 'lucide-react';

const Api = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <Code className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            API Reference
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Complete documentation for the Hypz Cloud Storage API
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/docs"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition group"
          >
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <Book className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition">
              Full Documentation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comprehensive guides, tutorials, and examples
            </p>
          </Link>

          <Link
            to="/api-keys"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition group"
          >
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <Key className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition">
              Get API Keys
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage your API authentication keys
            </p>
          </Link>

          <Link
            to="/register"
            className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">
              Get Started Free
            </h3>
            <p className="text-sm opacity-90">
              Sign up and start using the API in minutes
            </p>
          </Link>
        </div>

        {/* API Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            API Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            The Hypz API is a RESTful API that allows you to programmatically upload, download, and manage files 
            in your cloud storage. All requests use HTTPS and return JSON responses.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-500 mb-1">Base URL</div>
              <code className="text-sm text-primary-600 dark:text-primary-400 font-mono">
                https://api.hypz.com/v1
              </code>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-500 mb-1">Authentication</div>
              <code className="text-sm text-primary-600 dark:text-primary-400 font-mono">
                Bearer Token
              </code>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-500 mb-1">Response Format</div>
              <code className="text-sm text-primary-600 dark:text-primary-400 font-mono">
                JSON
              </code>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            All API requests require authentication using an API key. Include your API key in the Authorization header:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <code className="text-green-400 font-mono text-sm">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Core Endpoints
          </h2>
          
          <div className="space-y-6">
            {/* Upload File */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                  POST
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /files/upload
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a file to a bucket. Supports multipart/form-data.
              </p>
            </div>

            {/* Get File */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
                  GET
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /files/:fileId
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Retrieve file metadata and download URL.
              </p>
            </div>

            {/* List Files */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
                  GET
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /buckets/:bucketId/files
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                List all files in a bucket with pagination support.
              </p>
            </div>

            {/* Delete File */}
            <div className="border-l-4 border-red-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded">
                  DELETE
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /files/:fileId
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Permanently delete a file from storage.
              </p>
            </div>

            {/* Create Bucket */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                  POST
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /buckets
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a new storage bucket with custom configuration.
              </p>
            </div>

            {/* List Buckets */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
                  GET
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">
                  /buckets
                </code>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                List all buckets in your account.
              </p>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Example
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Here's a simple example of uploading a file using JavaScript:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm"><code className="text-gray-300 font-mono">{`const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('bucket', 'my-bucket');

const response = await fetch('https://api.hypz.com/v1/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const data = await response.json();
console.log('File uploaded:', data.url);`}</code></pre>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Rate Limits
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Rate Limit</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Burst</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-300">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">Free</td>
                  <td className="py-3 px-4">100 requests/minute</td>
                  <td className="py-3 px-4">150 requests</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">Pay-as-you-go</td>
                  <td className="py-3 px-4">1,000 requests/minute</td>
                  <td className="py-3 px-4">2,000 requests</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SDKs */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">Official SDKs</h2>
          <p className="mb-6 opacity-90">
            Use our official SDKs to integrate Hypz into your application with minimal code.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">📦</div>
              <div className="font-semibold">Node.js</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🐍</div>
              <div className="font-semibold">Python</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">☕</div>
              <div className="font-semibold">Java</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🔷</div>
              <div className="font-semibold">Go</div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center space-x-4">
          <Link to="/docs" className="text-primary-600 hover:text-primary-700 font-medium">
            Full Documentation
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Get Started
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Api;
