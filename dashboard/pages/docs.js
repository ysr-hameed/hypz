import Navbar from '../components/Navbar';
import { Book, Code, Key, Upload, Download } from 'lucide-react';

export default function Docs() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Documentation
        </h1>

        {/* Quick Start */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <Book className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quick Start
            </h2>
          </div>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>Get started with Hypz Storage in just a few steps:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Create your free account</li>
              <li>Get your API key from the dashboard</li>
              <li>Install the SDK: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">npm install @hypz/storage-sdk</code></li>
              <li>Start uploading files!</li>
            </ol>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <Key className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Authentication
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Include your API key in the request headers:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`X-API-Key: your-api-key-here

// or use Bearer token
Authorization: Bearer your-jwt-token`}</code>
            </pre>
          </div>
        </div>

        {/* Upload File */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload File
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Upload a file using multipart/form-data:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`POST /api/files/upload

// Using JavaScript SDK
const hypz = require('@hypz/storage-sdk');
const client = new hypz.Client('your-api-key');

const file = await client.files.upload({
  file: fileBuffer,
  filename: 'example.jpg',
  isPublic: false,
  expiresIn: 30 // days (optional)
});

console.log(file.id); // File ID`}</code>
            </pre>
          </div>
        </div>

        {/* Download File */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm mb-8">
          <div className="flex items-center mb-4">
            <Download className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Download File
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Get a signed URL to download a file:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`GET /api/files/:fileId/download

// Using JavaScript SDK
const downloadUrl = await client.files.getDownloadUrl(fileId);
console.log(downloadUrl); // Signed URL valid for 1 hour`}</code>
            </pre>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
          <div className="flex items-center mb-4">
            <Code className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              SDK Examples
            </h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Node.js
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{`const Hypz = require('@hypz/storage-sdk');
const client = new Hypz.Client('your-api-key');

// Upload a file
const file = await client.files.upload({
  file: fs.readFileSync('image.jpg'),
  filename: 'image.jpg'
});

// List files
const files = await client.files.list({ limit: 10 });

// Delete a file
await client.files.delete(file.id);`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Python (Coming Soon)
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{`import hypz

client = hypz.Client('your-api-key')

# Upload a file
file = client.files.upload(
    file=open('image.jpg', 'rb'),
    filename='image.jpg'
)`}</code>
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
