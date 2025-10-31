import { useState } from 'react';
import { 
  BookOpenIcon, 
  CodeBracketIcon, 
  RocketLaunchIcon,
  KeyIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  LifebuoyIcon,
  AcademicCapIcon,
  VideoCameraIcon,
  CubeIcon,
  ServerIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  BeakerIcon,
  CommandLineIcon,
  CpuChipIcon,
  LockClosedIcon,
  ArrowDownTrayIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

const Documentation = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [activeSection, setActiveSection] = useState('quickstart');
  const [copiedCode, setCopiedCode] = useState(false);

  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: CodeBracketIcon, color: 'text-yellow-600' },
    { id: 'python', name: 'Python', icon: CpuChipIcon, color: 'text-blue-600' },
    { id: 'php', name: 'PHP', icon: ServerIcon, color: 'text-purple-600' },
    { id: 'java', name: 'Java', icon: CubeIcon, color: 'text-red-600' },
    { id: 'go', name: 'Go', icon: BoltIcon, color: 'text-cyan-600' },
    { id: 'ruby', name: 'Ruby', icon: BeakerIcon, color: 'text-red-500' },
    { id: 'csharp', name: 'C#', icon: CommandLineIcon, color: 'text-green-600' },
    { id: 'curl', name: 'cURL', icon: ArrowPathIcon, color: 'text-gray-600' }
  ];

  const codeExamples = {
    javascript: `// Install the HYPZ SDK
npm install @hypz/storage-sdk

// Import and initialize
import { HypzClient } from '@hypz/storage-sdk';

const client = new HypzClient({
  apiKey: 'your_api_key',
  region: 'india' // or 'global'
});

// Upload a file
const uploadFile = async (file) => {
  try {
    const result = await client.upload({
      file: file,
      bucket: 'my-bucket',
      path: 'uploads/image.jpg',
      visibility: 'public', // or 'private'
      metadata: {
        description: 'Profile picture',
        tags: ['user', 'avatar']
      }
    });
    
    console.log('File uploaded:', result.url);
    console.log('CDN URL:', result.cdnUrl);
    return result;
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};

// List files in bucket
const listFiles = async () => {
  const files = await client.listFiles('my-bucket', {
    limit: 50,
    prefix: 'uploads/'
  });
  return files;
};

// Delete a file
const deleteFile = async (fileId) => {
  await client.delete('my-bucket', fileId);
};

// Get file metadata
const getFileInfo = async (fileId) => {
  const info = await client.getMetadata('my-bucket', fileId);
  return info;
};`,

    python: `# Install the HYPZ SDK
pip install hypz-storage

# Import and initialize
from hypz_storage import HypzClient

client = HypzClient(
    api_key='your_api_key',
    region='india'  # or 'global'
)

# Upload a file
def upload_file(file_path):
    try:
        with open(file_path, 'rb') as file:
            result = client.upload(
                file=file,
                bucket='my-bucket',
                path='uploads/image.jpg',
                visibility='public',
                metadata={
                    'description': 'Profile picture',
                    'tags': ['user', 'avatar']
                }
            )
            
            print(f'File uploaded: {result["url"]}')
            print(f'CDN URL: {result["cdn_url"]}')
            return result
    except Exception as error:
        print(f'Upload failed: {str(error)}')

# List files in bucket
def list_files():
    files = client.list_files(
        bucket='my-bucket',
        limit=50,
        prefix='uploads/'
    )
    return files

# Delete a file
def delete_file(file_id):
    client.delete(bucket='my-bucket', file_id=file_id)

# Get file metadata
def get_file_info(file_id):
    info = client.get_metadata(
        bucket='my-bucket',
        file_id=file_id
    )
    return info`,

    php: `<?php
// Install via Composer
// composer require hypz/storage-sdk

require 'vendor/autoload.php';

use Hypz\\Storage\\HypzClient;

// Initialize client
$client = new HypzClient([
    'apiKey' => 'your_api_key',
    'region' => 'india' // or 'global'
]);

// Upload a file
function uploadFile($filePath) {
    global $client;
    
    try {
        $result = $client->upload([
            'file' => fopen($filePath, 'r'),
            'bucket' => 'my-bucket',
            'path' => 'uploads/image.jpg',
            'visibility' => 'public',
            'metadata' => [
                'description' => 'Profile picture',
                'tags' => ['user', 'avatar']
            ]
        ]);
        
        echo "File uploaded: " . $result['url'];
        echo "CDN URL: " . $result['cdnUrl'];
        return $result;
    } catch (Exception $e) {
        echo "Upload failed: " . $e->getMessage();
    }
}

// List files
function listFiles() {
    global $client;
    
    $files = $client->listFiles('my-bucket', [
        'limit' => 50,
        'prefix' => 'uploads/'
    ]);
    
    return $files;
}

// Delete file
function deleteFile($fileId) {
    global $client;
    $client->delete('my-bucket', $fileId);
}

// Get metadata
function getFileInfo($fileId) {
    global $client;
    return $client->getMetadata('my-bucket', $fileId);
}`,

    java: `// Add to pom.xml or build.gradle
// Maven: <dependency>
//   <groupId>io.hypz</groupId>
//   <artifactId>hypz-storage</artifactId>
//   <version>1.0.0</version>
// </dependency>

import io.hypz.storage.HypzClient;
import io.hypz.storage.UploadOptions;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class HypzExample {
    public static void main(String[] args) {
        // Initialize client
        HypzClient client = new HypzClient.Builder()
            .apiKey("your_api_key")
            .region("india")
            .build();
        
        // Upload file
        try {
            File file = new File("path/to/image.jpg");
            
            Map<String, String> metadata = new HashMap<>();
            metadata.put("description", "Profile picture");
            
            UploadOptions options = new UploadOptions.Builder()
                .bucket("my-bucket")
                .path("uploads/image.jpg")
                .visibility("public")
                .metadata(metadata)
                .build();
            
            UploadResult result = client.upload(file, options);
            
            System.out.println("File uploaded: " + result.getUrl());
            System.out.println("CDN URL: " + result.getCdnUrl());
        } catch (Exception e) {
            System.err.println("Upload failed: " + e.getMessage());
        }
        
        // List files
        ListOptions listOpts = new ListOptions.Builder()
            .limit(50)
            .prefix("uploads/")
            .build();
        
        List<FileInfo> files = client.listFiles("my-bucket", listOpts);
        
        // Delete file
        client.delete("my-bucket", "file-id");
    }
}`,

    go: `// Install the SDK
// go get github.com/hypz-storage/go-sdk

package main

import (
    "fmt"
    "os"
    hypz "github.com/hypz-storage/go-sdk"
)

func main() {
    // Initialize client
    client := hypz.NewClient(&hypz.Config{
        APIKey: "your_api_key",
        Region: "india", // or "global"
    })
    
    // Upload file
    file, err := os.Open("path/to/image.jpg")
    if err != nil {
        panic(err)
    }
    defer file.Close()
    
    result, err := client.Upload(&hypz.UploadOptions{
        File:       file,
        Bucket:     "my-bucket",
        Path:       "uploads/image.jpg",
        Visibility: "public",
        Metadata: map[string]string{
            "description": "Profile picture",
            "tags":        "user,avatar",
        },
    })
    
    if err != nil {
        fmt.Printf("Upload failed: %v\\n", err)
        return
    }
    
    fmt.Printf("File uploaded: %s\\n", result.URL)
    fmt.Printf("CDN URL: %s\\n", result.CDNURL)
    
    // List files
    files, err := client.ListFiles("my-bucket", &hypz.ListOptions{
        Limit:  50,
        Prefix: "uploads/",
    })
    
    // Delete file
    err = client.Delete("my-bucket", "file-id")
    
    // Get metadata
    info, err := client.GetMetadata("my-bucket", "file-id")
}`,

    ruby: `# Install the gem
# gem install hypz-storage

require 'hypz/storage'

# Initialize client
client = Hypz::Storage::Client.new(
  api_key: 'your_api_key',
  region: 'india' # or 'global'
)

# Upload a file
def upload_file(file_path)
  begin
    result = client.upload(
      file: File.open(file_path, 'rb'),
      bucket: 'my-bucket',
      path: 'uploads/image.jpg',
      visibility: 'public',
      metadata: {
        description: 'Profile picture',
        tags: ['user', 'avatar']
      }
    )
    
    puts "File uploaded: #{result[:url]}"
    puts "CDN URL: #{result[:cdn_url]}"
    result
  rescue => error
    puts "Upload failed: #{error.message}"
  end
end

# List files in bucket
def list_files
  files = client.list_files(
    bucket: 'my-bucket',
    limit: 50,
    prefix: 'uploads/'
  )
  files
end

# Delete a file
def delete_file(file_id)
  client.delete(
    bucket: 'my-bucket',
    file_id: file_id
  )
end

# Get file metadata
def get_file_info(file_id)
  info = client.get_metadata(
    bucket: 'my-bucket',
    file_id: file_id
  )
  info
end`,

    csharp: `// Install via NuGet
// Install-Package Hypz.Storage

using Hypz.Storage;
using System;
using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;

public class HypzExample
{
    private static HypzClient client;
    
    public static async Task Main(string[] args)
    {
        // Initialize client
        client = new HypzClient(new HypzConfig
        {
            ApiKey = "your_api_key",
            Region = "india" // or "global"
        });
        
        // Upload file
        try
        {
            var file = File.OpenRead("path/to/image.jpg");
            
            var result = await client.UploadAsync(new UploadOptions
            {
                File = file,
                Bucket = "my-bucket",
                Path = "uploads/image.jpg",
                Visibility = "public",
                Metadata = new Dictionary<string, string>
                {
                    { "description", "Profile picture" },
                    { "tags", "user,avatar" }
                }
            });
            
            Console.WriteLine($"File uploaded: {result.Url}");
            Console.WriteLine($"CDN URL: {result.CdnUrl}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Upload failed: {ex.Message}");
        }
        
        // List files
        var files = await client.ListFilesAsync("my-bucket", new ListOptions
        {
            Limit = 50,
            Prefix = "uploads/"
        });
        
        // Delete file
        await client.DeleteAsync("my-bucket", "file-id");
        
        // Get metadata
        var info = await client.GetMetadataAsync("my-bucket", "file-id");
    }
}`,

    curl: `# Upload a file
curl -X POST https://api.hypz.io/v1/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "X-Region: india" \\
  -F "file=@/path/to/image.jpg" \\
  -F "bucket=my-bucket" \\
  -F "path=uploads/image.jpg" \\
  -F "visibility=public" \\
  -F "metadata[description]=Profile picture" \\
  -F "metadata[tags]=user,avatar"

# Response:
# {
#   "success": true,
#   "data": {
#     "id": "file_1a2b3c4d",
#     "url": "https://storage.hypz.io/my-bucket/uploads/image.jpg",
#     "cdnUrl": "https://cdn.hypz.io/my-bucket/uploads/image.jpg",
#     "size": 245680,
#     "mimeType": "image/jpeg"
#   }
# }

# List files in bucket
curl -X GET "https://api.hypz.io/v1/buckets/my-bucket/files?limit=50&prefix=uploads/" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "X-Region: india"

# Get file metadata
curl -X GET "https://api.hypz.io/v1/files/file_1a2b3c4d" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Delete a file
curl -X DELETE "https://api.hypz.io/v1/files/file_1a2b3c4d" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Download file
curl -X GET "https://api.hypz.io/v1/files/file_1a2b3c4d/download" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o downloaded_file.jpg

# Update file metadata
curl -X PATCH "https://api.hypz.io/v1/files/file_1a2b3c4d" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "metadata": {
      "description": "Updated description",
      "tags": ["updated", "tag"]
    }
  }'`
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const apiEndpoints = [
    {
      method: 'POST',
      endpoint: '/v1/upload',
      description: 'Upload a file to a bucket',
      params: [
        { name: 'file', type: 'File', required: true, description: 'File to upload' },
        { name: 'bucket', type: 'string', required: true, description: 'Bucket name' },
        { name: 'path', type: 'string', required: false, description: 'File path in bucket' },
        { name: 'visibility', type: 'string', required: false, description: 'public or private' },
        { name: 'metadata', type: 'object', required: false, description: 'Custom metadata' }
      ],
      response: {
        id: 'file_1a2b3c4d',
        url: 'https://storage.hypz.io/bucket/file.jpg',
        cdnUrl: 'https://cdn.hypz.io/bucket/file.jpg',
        size: 245680,
        mimeType: 'image/jpeg'
      }
    },
    {
      method: 'GET',
      endpoint: '/v1/buckets/:bucket/files',
      description: 'List all files in a bucket',
      params: [
        { name: 'bucket', type: 'string', required: true, description: 'Bucket name' },
        { name: 'limit', type: 'number', required: false, description: 'Max results (1-100)' },
        { name: 'prefix', type: 'string', required: false, description: 'Filter by path prefix' },
        { name: 'cursor', type: 'string', required: false, description: 'Pagination cursor' }
      ],
      response: {
        files: [],
        nextCursor: 'cursor_token',
        hasMore: true
      }
    },
    {
      method: 'GET',
      endpoint: '/v1/files/:fileId',
      description: 'Get file metadata',
      params: [
        { name: 'fileId', type: 'string', required: true, description: 'File ID' }
      ],
      response: {
        id: 'file_1a2b3c4d',
        name: 'image.jpg',
        size: 245680,
        mimeType: 'image/jpeg',
        createdAt: '2024-01-01T00:00:00Z',
        metadata: {}
      }
    },
    {
      method: 'GET',
      endpoint: '/v1/files/:fileId/download',
      description: 'Download a file',
      params: [
        { name: 'fileId', type: 'string', required: true, description: 'File ID' }
      ],
      response: 'Binary file data'
    },
    {
      method: 'PATCH',
      endpoint: '/v1/files/:fileId',
      description: 'Update file metadata',
      params: [
        { name: 'fileId', type: 'string', required: true, description: 'File ID' },
        { name: 'metadata', type: 'object', required: true, description: 'New metadata' },
        { name: 'visibility', type: 'string', required: false, description: 'public or private' }
      ],
      response: {
        success: true,
        file: {}
      }
    },
    {
      method: 'DELETE',
      endpoint: '/v1/files/:fileId',
      description: 'Delete a file',
      params: [
        { name: 'fileId', type: 'string', required: true, description: 'File ID' }
      ],
      response: {
        success: true,
        message: 'File deleted successfully'
      }
    }
  ];

  const sections = [
    { id: 'quickstart', name: 'Quick Start', icon: RocketLaunchIcon },
    { id: 'authentication', name: 'Authentication', icon: ShieldCheckIcon },
    { id: 'sdks', name: 'SDKs & Libraries', icon: CubeIcon },
    { id: 'api', name: 'API Reference', icon: BookOpenIcon },
    { id: 'examples', name: 'Code Examples', icon: CodeBracketIcon },
    { id: 'errors', name: 'Error Handling', icon: LockClosedIcon },
    { id: 'support', name: 'Support', icon: LifebuoyIcon }
  ];

  return (
    <div className="flex gap-6 p-6">
      {/* Sidebar Navigation */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
            Navigation
          </h3>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {section.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <BookOpenIcon className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold mb-2">
                HYPZ Storage Documentation
              </h1>
              <p className="text-blue-100">
                Complete guide to integrating HYPZ Storage into your applications
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <RocketLaunchIcon className="w-5 h-5" />
                <span className="font-semibold">Quick Start</span>
              </div>
              <p className="text-sm text-blue-100">Get started in under 5 minutes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CodeBracketIcon className="w-5 h-5" />
                <span className="font-semibold">8+ SDKs</span>
              </div>
              <p className="text-sm text-blue-100">Support for all major languages</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <LifebuoyIcon className="w-5 h-5" />
                <span className="font-semibold">24/7 Support</span>
              </div>
              <p className="text-sm text-blue-100">Always here to help</p>
            </div>
          </div>
        </div>

        {/* Quick Start Section */}
        {activeSection === 'quickstart' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <RocketLaunchIcon className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Quick Start Guide
                </h2>
              </div>

              <div className="space-y-8">
                {/* Step 1 */}
                <div className="border-l-4 border-blue-600 pl-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                      1
                    </div>
                    <KeyIcon className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Get Your API Key
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Navigate to the <a href="/api-keys" className="text-blue-600 hover:underline font-medium">API Keys</a> section 
                    and create a new API key. Keep it secure and never commit it to version control.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      API Key Format: hypz_live_xxxxxxxxxxxxxxxxxxxxxxxx
                    </code>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border-l-4 border-green-600 pl-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm">
                      2
                    </div>
                    <FolderIcon className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Create a Bucket
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Go to <a href="/buckets" className="text-blue-600 hover:underline font-medium">Buckets</a> and 
                    create your first storage bucket. Choose a unique name and select your preferred region.
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <CheckCircleIcon className="w-4 h-4 inline mr-2" />
                      Bucket names must be unique and can contain lowercase letters, numbers, and hyphens
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border-l-4 border-purple-600 pl-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-sm">
                      3
                    </div>
                    <ArrowDownTrayIcon className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Install SDK
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Choose your preferred programming language and install the HYPZ SDK using your package manager.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {languages.slice(0, 4).map((lang) => {
                      const Icon = lang.icon;
                      return (
                        <div key={lang.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                          <Icon className={`w-6 h-6 ${lang.color} mx-auto mb-1`} />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{lang.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 4 */}
                <div className="border-l-4 border-orange-600 pl-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-600 text-white rounded-full font-bold text-sm">
                      4
                    </div>
                    <CloudArrowUpIcon className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Upload Your First File
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Use the SDK to upload files to your bucket. See the code examples below for your language.
                  </p>
                  <button
                    onClick={() => setActiveSection('examples')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <CodeBracketIcon className="w-5 h-5" />
                    View Code Examples
                  </button>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Best Practices
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Security</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Never expose API keys in client-side code</li>
                    <li>• Use environment variables for credentials</li>
                    <li>• Rotate API keys regularly</li>
                    <li>• Implement proper access control</li>
                  </ul>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <BoltIcon className="w-6 h-6 text-yellow-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Performance</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Use CDN URLs for public files</li>
                    <li>• Implement caching strategies</li>
                    <li>• Compress files before upload</li>
                    <li>• Choose the nearest region</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Section */}
        {activeSection === 'authentication' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Authentication
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  API Key Authentication
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  All API requests must include your API key in the Authorization header:
                </p>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400">
{`Authorization: Bearer hypz_live_your_api_key_here`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Region Selection
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Specify your region using the X-Region header:
                </p>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-blue-400">
{`X-Region: india  // or 'global'`}
                  </pre>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <LockClosedIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                      Security Best Practices
                    </h4>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                      <li>• Store API keys in environment variables</li>
                      <li>• Never commit keys to version control</li>
                      <li>• Use different keys for development and production</li>
                      <li>• Rotate keys regularly (recommended every 90 days)</li>
                      <li>• Revoke compromised keys immediately</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SDKs Section */}
        {activeSection === 'sdks' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <CubeIcon className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                SDKs & Libraries
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {languages.map((lang) => {
                const Icon = lang.icon;
                return (
                  <div key={lang.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className={`w-8 h-8 ${lang.color}`} />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {lang.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Official SDK
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedLanguage(lang.id);
                        setActiveSection('examples');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Documentation →
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Features Across All SDKs
              </h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>File upload with progress tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Automatic retry on failure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Multipart upload for large files</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Built-in error handling</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>CDN URL generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Metadata management</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Examples Section */}
        {activeSection === 'examples' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <CodeBracketIcon className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Code Examples
              </h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Language
              </label>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => {
                  const Icon = lang.icon;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLanguage(lang.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedLanguage === lang.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {lang.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => copyToClipboard(codeExamples[selectedLanguage])}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <pre className="text-sm text-gray-300 leading-relaxed">
                  {codeExamples[selectedLanguage]}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* API Reference Section */}
        {activeSection === 'api' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpenIcon className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  API Reference
                </h2>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Base URL
                </h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <code className="text-sm text-green-400">
                    https://api.hypz.io/v1
                  </code>
                </div>
              </div>

              <div className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        endpoint.method === 'PATCH' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono text-gray-900 dark:text-white">
                        {endpoint.endpoint}
                      </code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {endpoint.description}
                    </p>

                    {/* Parameters */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Parameters
                      </h4>
                      <div className="space-y-2">
                        {endpoint.params.map((param, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs font-mono">
                              {param.name}
                            </code>
                            <span className="text-gray-500 dark:text-gray-400">
                              {param.type}
                            </span>
                            {param.required && (
                              <span className="text-red-500 text-xs">*required</span>
                            )}
                            <span className="text-gray-600 dark:text-gray-400 flex-1">
                              {param.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Response */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Response
                      </h4>
                      <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                        <pre className="text-xs text-gray-300">
                          {typeof endpoint.response === 'string' 
                            ? endpoint.response 
                            : JSON.stringify(endpoint.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Handling Section */}
        {activeSection === 'errors' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <LockClosedIcon className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Error Handling
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  HTTP Status Codes
                </h3>
                <div className="space-y-2">
                  {[
                    { code: 200, name: 'OK', description: 'Request successful', color: 'green' },
                    { code: 201, name: 'Created', description: 'Resource created successfully', color: 'green' },
                    { code: 400, name: 'Bad Request', description: 'Invalid request parameters', color: 'yellow' },
                    { code: 401, name: 'Unauthorized', description: 'Invalid or missing API key', color: 'red' },
                    { code: 403, name: 'Forbidden', description: 'Insufficient permissions', color: 'red' },
                    { code: 404, name: 'Not Found', description: 'Resource not found', color: 'red' },
                    { code: 429, name: 'Too Many Requests', description: 'Rate limit exceeded', color: 'yellow' },
                    { code: 500, name: 'Internal Server Error', description: 'Server error occurred', color: 'red' }
                  ].map((status) => (
                    <div key={status.code} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className={`px-3 py-1 rounded font-mono text-sm font-bold ${
                        status.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {status.code}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          {status.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {status.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Error Response Format
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300">
{`{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid or expired",
    "details": {
      "timestamp": "2024-01-01T00:00:00Z",
      "requestId": "req_abc123"
    }
  }
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Common Error Codes
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { code: 'INVALID_API_KEY', desc: 'API key is invalid or expired' },
                    { code: 'BUCKET_NOT_FOUND', desc: 'Specified bucket does not exist' },
                    { code: 'FILE_TOO_LARGE', desc: 'File exceeds maximum size limit' },
                    { code: 'QUOTA_EXCEEDED', desc: 'Storage or bandwidth quota exceeded' },
                    { code: 'RATE_LIMIT_EXCEEDED', desc: 'Too many requests in a short time' },
                    { code: 'INVALID_FILE_TYPE', desc: 'File type not allowed' }
                  ].map((error) => (
                    <div key={error.code} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <code className="text-sm font-mono text-red-600 dark:text-red-400">
                        {error.code}
                      </code>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {error.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support Section */}
        {activeSection === 'support' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <LifebuoyIcon className="w-12 h-12" />
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Need Help?
                  </h2>
                  <p className="text-blue-100">
                    We're here to help you succeed with HYPZ Storage
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Live Chat Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get instant help from our support team. Available 24/7 for Pro and Business plans.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Start Chat
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <DocumentTextIcon className="w-8 h-8 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Documentation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Browse our comprehensive guides and tutorials to get the most out of HYPZ.
                </p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Browse Docs
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <VideoCameraIcon className="w-8 h-8 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Video Tutorials
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Watch step-by-step video guides to learn how to use HYPZ Storage effectively.
                </p>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Watch Videos
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <GlobeAltIcon className="w-8 h-8 text-orange-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Community Forum
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Join our community of developers. Ask questions and share your experiences.
                </p>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  Join Forum
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {[
                  {
                    q: 'How do I get started with HYPZ Storage?',
                    a: 'Create an account, get your API key, create a bucket, and start uploading files using our SDK or REST API.'
                  },
                  {
                    q: 'What file types are supported?',
                    a: 'HYPZ supports all file types including images, videos, documents, and more. File size limits depend on your plan.'
                  },
                  {
                    q: 'How is bandwidth calculated?',
                    a: 'Bandwidth is measured by the total data transferred when files are accessed or downloaded from your buckets.'
                  },
                  {
                    q: 'Can I use custom domains?',
                    a: 'Yes, custom domains are available on Starter, Pro, and Business plans. Configure them in the Settings page.'
                  }
                ].map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {faq.q}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentation;
