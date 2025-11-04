import { useState } from 'react';
import { Book, Code as CodeIcon, Key, Database, Upload, Download, Shield, Link2, Terminal, Copy, FileText, Zap, Settings } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function Code({ language, code }) {
  return (
    <div className="relative group">
      <button
        onClick={() => navigator.clipboard.writeText(code)}
        className="absolute right-2 top-2 p-1.5 rounded bg-zinc-800/80 text-zinc-200 opacity-0 group-hover:opacity-100 transition z-10"
        aria-label="Copy code"
      >
        <Copy size={16} />
      </button>
      <SyntaxHighlighter 
        language={language} 
        style={vscDarkPlus} 
        customStyle={{ margin: 0, borderRadius: 8, fontSize: 13, padding: '1rem' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
        <Icon size={20} className="text-blue-600" />
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

export default function Documentation() {
  const [activeTab, setActiveTab] = useState('REST API');

  const tabs = ['REST API', 'Node.js', 'Python', 'Java', 'cURL'];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Book className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Hypz Developer Documentation
            </h1>
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Complete guide to integrating Hypz Cloud Storage into your applications
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <CodeIcon size={16} />
              {tab}
            </button>
          ))}
        </div>

        {/* REST API Tab */}
        {activeTab === 'REST API' && (
          <div>
            <Section icon={Key} title="Authentication">
              <p className="text-zinc-700 dark:text-zinc-300 mb-3">
                Hypz API supports two authentication methods:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">API Key (Recommended)</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">For server-to-server communication</p>
                  <code className="text-xs bg-zinc-900 dark:bg-zinc-950 text-green-400 px-2 py-1 rounded">
                    X-API-Key: sk_live_your_key
                  </code>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">JWT Token</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">For dashboard-authenticated requests</p>
                  <code className="text-xs bg-zinc-900 dark:bg-zinc-950 text-green-400 px-2 py-1 rounded">
                    Authorization: Bearer &lt;jwt&gt;
                  </code>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Base URL:</strong> <code>http://localhost:5000/api/v1</code> (local) or <code>https://api.hypz.io/api/v1</code> (production)
                </p>
              </div>
            </Section>

            <Section icon={Database} title="Endpoints">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-zinc-900 dark:text-zinc-100">Buckets</h3>
                  <div className="space-y-2">
                    <EndpointRow method="GET" path="/buckets" description="List all buckets" />
                    <EndpointRow method="POST" path="/buckets" description="Create a new bucket" />
                    <EndpointRow method="GET" path="/buckets/:id" description="Get bucket details" />
                    <EndpointRow method="PUT" path="/buckets/:id" description="Update bucket" />
                    <EndpointRow method="DELETE" path="/buckets/:id" description="Delete bucket" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-zinc-900 dark:text-zinc-100">Files</h3>
                  <div className="space-y-2">
                    <EndpointRow method="POST" path="/files/:bucketId/upload" description="Upload file (multipart/form-data)" />
                    <EndpointRow method="GET" path="/files/:bucketId/files" description="List files in bucket" />
                    <EndpointRow method="GET" path="/files/file/:fileId" description="Get file details" />
                    <EndpointRow method="GET" path="/files/file/:fileId/download" description="Download file (requires auth)" />
                    <EndpointRow method="GET" path="/files/public/:fileId/download" description="Download public file" />
                    <EndpointRow method="POST" path="/files/file/:fileId/signed-url" description="Generate signed URL (max 7 days)" />
                    <EndpointRow method="GET" path="/files/file/:fileId/download-signed?token=..." description="Download via signed URL" />
                    <EndpointRow method="PATCH" path="/files/file/:fileId" description="Update file metadata" />
                    <EndpointRow method="DELETE" path="/files/file/:fileId" description="Delete file" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-zinc-900 dark:text-zinc-100">API Keys (JWT required)</h3>
                  <div className="space-y-2">
                    <EndpointRow method="GET" path="/api-keys" description="List API keys" />
                    <EndpointRow method="POST" path="/api-keys" description="Create API key" />
                    <EndpointRow method="GET" path="/api-keys/:keyId" description="Get API key details" />
                    <EndpointRow method="PUT" path="/api-keys/:keyId" description="Update API key" />
                    <EndpointRow method="DELETE" path="/api-keys/:keyId" description="Delete API key" />
                    <EndpointRow method="POST" path="/api-keys/:keyId/regenerate" description="Regenerate API key" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-zinc-900 dark:text-zinc-100">Usage & Analytics</h3>
                  <div className="space-y-2">
                    <EndpointRow method="GET" path="/usage/current" description="Get current usage stats" />
                    <EndpointRow method="GET" path="/usage/history" description="Get usage history" />
                    <EndpointRow method="GET" path="/usage/analytics" description="Get detailed analytics" />
                  </div>
                </div>
              </div>
            </Section>

            <Section icon={Terminal} title="Quick Start Examples">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Create a Private Bucket</h3>
                  <Code language="bash" code={`curl -X POST http://localhost:5000/api/v1/buckets \\
  -H "X-API-Key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"my-bucket","visibility":"private"}'`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Upload a File</h3>
                  <Code language="bash" code={`curl -X POST http://localhost:5000/api/v1/files/{bucketId}/upload \\
  -H "X-API-Key: sk_live_your_key" \\
  -F file=@document.pdf`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Generate Signed URL (1 hour)</h3>
                  <Code language="bash" code={`curl -X POST http://localhost:5000/api/v1/files/file/{fileId}/signed-url \\
  -H "X-API-Key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"expiresIn":3600}'`} />
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* Node.js Tab */}
        {activeTab === 'Node.js' && (
          <div>
            <Section icon={Terminal} title="Installation">
              <Code language="bash" code="npm install @hypz/sdk" />
            </Section>

            <Section icon={Settings} title="Initialize SDK">
              <Code language="javascript" code={`const { HypzSDK } = require('@hypz/sdk');

const hypz = new HypzSDK({
  apiKey: process.env.HYPZ_API_KEY,
  baseURL: 'http://localhost:5000/api/v1'
});

// Or use JWT for dashboard-authenticated requests
const hypzJWT = new HypzSDK({
  jwt: process.env.HYPZ_JWT,
  baseURL: 'http://localhost:5000/api/v1'
});`} />
            </Section>

            <Section icon={Database} title="Bucket Operations">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Create Bucket</h3>
                  <Code language="javascript" code={`const bucket = await hypz.buckets.create({
  name: 'my-bucket',
  visibility: 'private'
});`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">List Buckets</h3>
                  <Code language="javascript" code={`const buckets = await hypz.buckets.list();`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Update Bucket</h3>
                  <Code language="javascript" code={`await hypz.buckets.update(bucketId, {
  name: 'renamed-bucket',
  visibility: 'public'
});`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Delete Bucket</h3>
                  <Code language="javascript" code={`await hypz.buckets.delete(bucketId);`} />
                </div>
              </div>
            </Section>

            <Section icon={Upload} title="File Operations">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Upload File (Buffer)</h3>
                  <Code language="javascript" code={`const file = await hypz.files.upload({
  bucketId: bucket.id,
  file: Buffer.from('Hello Hypz!'),
  fileName: 'hello.txt'
});`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Upload File (Stream)</h3>
                  <Code language="javascript" code={`const fs = require('fs');
const stream = fs.createReadStream('document.pdf');
const file = await hypz.files.upload({
  bucketId: bucket.id,
  file: stream,
  fileName: 'document.pdf'
});`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">List Files</h3>
                  <Code language="javascript" code={`const files = await hypz.files.list(bucketId);`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Download File</h3>
                  <Code language="javascript" code={`const data = await hypz.files.download(fileId);
fs.writeFileSync('downloaded.pdf', data);`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Delete File</h3>
                  <Code language="javascript" code={`await hypz.files.delete(fileId);`} />
                </div>
              </div>
            </Section>

            <Section icon={Shield} title="Private Access: Signed URLs">
              <p className="text-zinc-700 dark:text-zinc-300 mb-3">
                Generate time-limited URLs for secure access to private files (max 7 days).
              </p>
              <Code language="javascript" code={`// Generate signed URL (1 hour)
const signedUrl = await hypz.files.getSignedURL(fileId, 3600);

// Client can now download without API key
const response = await fetch(signedUrl);
const blob = await response.blob();`} />
            </Section>

            <Section icon={Zap} title="Error Handling">
              <Code language="javascript" code={`try {
  const file = await hypz.files.get(fileId);
} catch (error) {
  if (error.name === 'HypzError') {
    console.error('API Error:', error.statusCode, error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}`} />
            </Section>
          </div>
        )}

        {/* Python Tab */}
        {activeTab === 'Python' && (
          <div>
            <Section icon={Terminal} title="Installation">
              <Code language="bash" code="pip install hypz-sdk" />
            </Section>

            <Section icon={Settings} title="Initialize Client">
              <Code language="python" code={`from hypz_sdk import Hypz

client = Hypz(
    api_key="sk_live_your_key",
    base_url="http://localhost:5000/api/v1"
)

# Or use JWT
client_jwt = Hypz(
    jwt="your_jwt_token",
    base_url="http://localhost:5000/api/v1"
)`} />
            </Section>

            <Section icon={Database} title="Bucket Operations">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Create Bucket</h3>
                  <Code language="python" code={`bucket = client.buckets.create(
    name="my-bucket",
    visibility="private"
)`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">List Buckets</h3>
                  <Code language="python" code={`buckets = client.buckets.list()`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Update Bucket</h3>
                  <Code language="python" code={`client.buckets.update(
    bucket_id,
    name="renamed-bucket",
    visibility="public"
)`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Delete Bucket</h3>
                  <Code language="python" code={`client.buckets.delete(bucket_id)`} />
                </div>
              </div>
            </Section>

            <Section icon={Upload} title="File Operations">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Upload File (Bytes)</h3>
                  <Code language="python" code={`file = client.files.upload(
    bucket_id=bucket["id"],
    data=b"Hello Hypz!",
    filename="hello.txt"
)`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Upload File (Path)</h3>
                  <Code language="python" code={`file = client.files.upload_path(
    bucket_id=bucket["id"],
    file_path="/path/to/document.pdf",
    filename="document.pdf"
)`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">List Files</h3>
                  <Code language="python" code={`files = client.files.list(bucket_id)`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Download File</h3>
                  <Code language="python" code={`data = client.files.download(file_id)
with open("downloaded.pdf", "wb") as f:
    f.write(data)`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Delete File</h3>
                  <Code language="python" code={`client.files.delete(file_id)`} />
                </div>
              </div>
            </Section>

            <Section icon={Shield} title="Private Access: Signed URLs">
              <p className="text-zinc-700 dark:text-zinc-300 mb-3">
                Generate time-limited URLs for secure access to private files (max 7 days).
              </p>
              <Code language="python" code={`# Generate signed URL (1 hour)
signed_url = client.files.get_signed_url(file_id, expires_in=3600)

# Download using the signed URL
import requests
response = requests.get(signed_url)
with open("downloaded.pdf", "wb") as f:
    f.write(response.content)`} />
            </Section>

            <Section icon={Zap} title="Error Handling">
              <Code language="python" code={`from hypz_sdk import HypzError

try:
    file = client.files.get(file_id)
except HypzError as e:
    print(f"API Error: {e.status_code} - {e.message}")
except Exception as e:
    print(f"Unexpected error: {e}")`} />
            </Section>
          </div>
        )}

        {/* Java Tab */}
        {activeTab === 'Java' && (
          <div>
            <Section icon={Terminal} title="Installation">
              <p className="text-zinc-700 dark:text-zinc-300 mb-3">
                Add to your <code className="text-sm bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">build.gradle</code>:
              </p>
              <Code language="gradle" code={`dependencies {
    implementation 'io.hypz:hypz-sdk:1.0.1'
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'com.google.code.gson:gson:2.10.1'
}`} />
            </Section>

            <Section icon={Settings} title="Initialize Client">
              <Code language="java" code={`import io.hypz.HypzClient;
import java.util.Map;

HypzClient client = new HypzClient.Builder()
    .setApiKey(System.getenv("HYPZ_API_KEY"))
    .setBaseUrl("http://localhost:5000/api/v1")
    .build();

// Or use JWT
HypzClient clientJWT = new HypzClient.Builder()
    .setJwt(System.getenv("HYPZ_JWT"))
    .setBaseUrl("http://localhost:5000/api/v1")
    .build();`} />
            </Section>

            <Section icon={Database} title="Bucket Operations">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Create Bucket</h3>
                  <Code language="java" code={`Map<String, Object> bucket = client.buckets().create(
    "my-bucket",
    "private"
);`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">List Buckets</h3>
                  <Code language="java" code={`List<Map<String, Object>> buckets = client.buckets().list();`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Update Bucket</h3>
                  <Code language="java" code={`client.buckets().update(
    bucketId,
    "renamed-bucket",
    "public"
);`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Delete Bucket</h3>
                  <Code language="java" code={`client.buckets().delete(bucketId);`} />
                </div>
              </div>
            </Section>

            <Section icon={Upload} title="File Operations">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Upload File (Bytes)</h3>
                  <Code language="java" code={`byte[] data = "Hello Hypz!".getBytes(StandardCharsets.UTF_8);
Map<String, Object> file = client.files().upload(
    bucketId,
    data,
    "hello.txt"
);`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Upload File (Path)</h3>
                  <Code language="java" code={`File file = new File("/path/to/document.pdf");
Map<String, Object> uploaded = client.files().uploadFile(
    bucketId,
    file,
    "document.pdf"
);`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">List Files</h3>
                  <Code language="java" code={`List<Map<String, Object>> files = client.files().list(bucketId);`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Download File</h3>
                  <Code language="java" code={`byte[] data = client.files().download(fileId);
Files.write(Paths.get("downloaded.pdf"), data);`} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Delete File</h3>
                  <Code language="java" code={`client.files().delete(fileId);`} />
                </div>
              </div>
            </Section>

            <Section icon={Shield} title="Private Access: Signed URLs">
              <p className="text-zinc-700 dark:text-zinc-300 mb-3">
                Generate time-limited URLs for secure access to private files (max 7 days).
              </p>
              <Code language="java" code={`// Generate signed URL (1 hour - 3600 seconds)
String signedUrl = client.files().getSignedUrl(fileId, 3600);

// Client can download using the signed URL
// URL url = new URL(signedUrl);
// byte[] data = url.openStream().readAllBytes();`} />
            </Section>

            <Section icon={Zap} title="Error Handling">
              <Code language="java" code={`try {
    Map<String, Object> file = client.files().get(fileId);
} catch (HypzException e) {
    System.err.println("API Error: " + e.getStatusCode() + " - " + e.getMessage());
} catch (Exception e) {
    System.err.println("Unexpected error: " + e.getMessage());
}`} />
            </Section>
          </div>
        )}

        {/* cURL Tab */}
        {activeTab === 'cURL' && (
          <div>
            <Section icon={Terminal} title="Complete cURL Examples">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-zinc-900 dark:text-zinc-100">Bucket Operations</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Create Bucket</h4>
                      <Code language="bash" code={`curl -X POST http://localhost:5000/api/v1/buckets \\
  -H "X-API-Key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my-bucket",
    "visibility": "private",
    "description": "My private bucket"
  }'`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">List Buckets</h4>
                      <Code language="bash" code={`curl -X GET http://localhost:5000/api/v1/buckets \\
  -H "X-API-Key: sk_live_your_key"`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Get Bucket</h4>
                      <Code language="bash" code={`curl -X GET http://localhost:5000/api/v1/buckets/{bucketId} \\
  -H "X-API-Key: sk_live_your_key"`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Update Bucket</h4>
                      <Code language="bash" code={`curl -X PUT http://localhost:5000/api/v1/buckets/{bucketId} \\
  -H "X-API-Key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "renamed-bucket", "visibility": "public"}'`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Delete Bucket</h4>
                      <Code language="bash" code={`curl -X DELETE http://localhost:5000/api/v1/buckets/{bucketId} \\
  -H "X-API-Key: sk_live_your_key"`} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-zinc-900 dark:text-zinc-100">File Operations</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Upload File</h4>
                      <Code language="bash" code={`curl -X POST http://localhost:5000/api/v1/files/{bucketId}/upload \\
  -H "X-API-Key: sk_live_your_key" \\
  -F "file=@/path/to/document.pdf"`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">List Files</h4>
                      <Code language="bash" code={`curl -X GET http://localhost:5000/api/v1/files/{bucketId}/files \\
  -H "X-API-Key: sk_live_your_key"`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Get File Details</h4>
                      <Code language="bash" code={`curl -X GET http://localhost:5000/api/v1/files/file/{fileId} \\
  -H "X-API-Key: sk_live_your_key"`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Download File (Authenticated)</h4>
                      <Code language="bash" code={`curl -X GET http://localhost:5000/api/v1/files/file/{fileId}/download \\
  -H "X-API-Key: sk_live_your_key" \\
  -o downloaded.pdf`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Download Public File</h4>
                      <Code language="bash" code={`curl -X GET http://localhost:5000/api/v1/files/public/{fileId}/download \\
  -o downloaded.pdf`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Generate Signed URL</h4>
                      <Code language="bash" code={`curl -X POST http://localhost:5000/api/v1/files/file/{fileId}/signed-url \\
  -H "X-API-Key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"expiresIn": 3600}'`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Download via Signed URL</h4>
                      <Code language="bash" code={`curl -X GET "http://localhost:5000/api/v1/files/file/{fileId}/download-signed?token={token}" \\
  -o downloaded.pdf`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Update File Metadata</h4>
                      <Code language="bash" code={`curl -X PATCH http://localhost:5000/api/v1/files/file/{fileId} \\
  -H "X-API-Key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"isPublic": true, "tags": ["public", "image"]}'`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Delete File</h4>
                      <Code language="bash" code={`curl -X DELETE http://localhost:5000/api/v1/files/file/{fileId} \\
  -H "X-API-Key: sk_live_your_key"`} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-zinc-900 dark:text-zinc-100">API Key Management (JWT Required)</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Create API Key</h4>
                      <Code language="bash" code={`curl -X POST http://localhost:5000/api/v1/api-keys \\
  -H "Authorization: Bearer {jwt_token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production Key",
    "permissions": ["files:read", "files:write", "files:delete"]
  }'`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">List API Keys</h4>
                      <Code language="bash" code={`curl -X GET http://localhost:5000/api/v1/api-keys \\
  -H "Authorization: Bearer {jwt_token}"`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Revoke API Key</h4>
                      <Code language="bash" code={`curl -X DELETE http://localhost:5000/api/v1/api-keys/{keyId} \\
  -H "Authorization: Bearer {jwt_token}"`} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-zinc-900 dark:text-zinc-100">Usage & Analytics</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Get Current Usage</h4>
                      <Code language="bash" code={`curl -X GET http://localhost:5000/api/v1/usage/current \\
  -H "X-API-Key: sk_live_your_key"`} />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">Get Usage History</h4>
                      <Code language="bash" code={`curl -X GET http://localhost:5000/api/v1/usage/history \\
  -H "X-API-Key: sk_live_your_key"`} />
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
          <div className="flex items-start gap-3">
            <Link2 className="text-blue-600 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Important Notes
              </h3>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
                <li>• All signed URLs have a maximum expiry of 7 days (604800 seconds)</li>
                <li>• Use API keys for server-to-server communication</li>
                <li>• Use JWT tokens for dashboard-authenticated requests</li>
                <li>• Private files require authentication or signed URLs for access</li>
                <li>• Public files can be downloaded without authentication</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Links */}
        <div className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            Need help? Email us at{' '}
            <a href="mailto:support@hypz.io" className="text-blue-600 hover:underline">
              support@hypz.io
            </a>
            {' '}or visit our{' '}
            <a href="https://github.com/ysr-hameed/hypz/issues" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              GitHub Issues
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function EndpointRow({ method, path, description }) {
  const methodColors = {
    GET: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    POST: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
    PATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <span className={`px-2.5 py-1 text-xs font-semibold rounded ${methodColors[method]}`}>
        {method}
      </span>
      <div className="flex-1 min-w-0">
        <code className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
          {path}
        </code>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
