import { useState } from 'react';

const Documentation = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'php', name: 'PHP', icon: '🐘' },
    { id: 'curl', name: 'cURL', icon: '🔄' }
  ];

  const codeExamples = {
    javascript: `npm install hypz-storage

const { HypzClient } = require('hypz-storage');
const client = new HypzClient({ apiKey: 'your_api_key' });

const result = await client.upload({
  file: fileBuffer,
  bucket: 'my-bucket',
  visibility: 'public'
});`,
    python: `pip install hypz-storage

from hypz_storage import HypzClient
client = HypzClient(api_key='your_api_key')

result = client.upload(
    file=file,
    bucket='my-bucket',
    visibility='public'
)`,
    php: `composer require hypz/storage

use Hypz\\Storage\\HypzClient;
$client = new HypzClient(['apiKey' => 'your_api_key']);

$result = $client->upload([
    'file' => fopen('image.jpg', 'r'),
    'bucket' => 'my-bucket'
]);`,
    curl: `curl -X POST https://api.hypz.io/v1/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@image.jpg" \\
  -F "bucket=my-bucket"`
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📚 Documentation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Everything you need to integrate HYPZ Storage
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          🚀 Quick Start
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              1. Get Your API Key
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Go to <a href="/api-keys" className="text-blue-600 hover:underline">API Keys</a> and create a new key.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              2. Choose Your Language
            </h3>
            <div className="flex gap-2 mb-4">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedLanguage === lang.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {lang.icon} {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              3. Install & Upload
            </h3>
            <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm text-gray-300">{codeExamples[selectedLanguage]}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          API Reference
        </h2>
        <div className="space-y-3">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold mr-3">POST</span>
              <code className="text-sm">/v1/upload</code>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload a file to bucket</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-bold mr-3">GET</span>
              <code className="text-sm">/v1/files/:fileId</code>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Download file</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-bold mr-3">DELETE</span>
              <code className="text-sm">/v1/files/:fileId</code>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Delete a file</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">
          💬 Need Help?
        </h2>
        <p className="text-blue-800 dark:text-blue-300 mb-4">
          Join our community or contact support
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Discord
          </button>
          <button className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 border border-blue-300 rounded-lg">
            Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
