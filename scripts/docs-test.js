#!/usr/bin/env node
/*
 End-to-end docs verification script
 - Registers a user (or logs in if exists)
 - Creates an API key (JWT)
 - Creates a bucket
 - Uploads a small file
 - Lists files
 - Downloads file
 - Deletes file
 - Fetches usage

 Requires backend running on localhost:5000
*/

const axios = require('axios');
const FormData = require('form-data');

const BASE = process.env.HYPZ_BASE_URL || 'http://localhost:5000/api/v1';

(async () => {
  const client = axios.create({ baseURL: BASE, validateStatus: () => true });

  const stamp = Date.now();
  const email = `docs+t${stamp}@example.com`;
  const password = 'DocsTest123';
  const firstName = 'Docs';
  const lastName = 'Tester';

  // Register
  let token;
  console.log('→ Registering user', email);
  let res = await client.post('/auth/register', { email, password, firstName, lastName });
  if (res.status === 201 && res.data?.data?.token) {
    token = res.data.data.token;
    console.log('  ✓ Registered');
  } else if (res.status === 400 && /already exists/i.test(res.data?.message || '')) {
    // Login
    console.log('→ User exists, logging in');
    res = await client.post('/auth/login', { email, password });
    if (res.status === 200 && res.data?.data?.token) {
      token = res.data.data.token;
      console.log('  ✓ Logged in');
    } else {
      throw new Error('Login failed: ' + JSON.stringify(res.data));
    }
  } else {
    throw new Error('Register failed: ' + JSON.stringify(res.data));
  }

  const auth = axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true });

  // Create API key
  console.log('→ Creating API key');
  res = await auth.post('/api-keys', {
    name: 'Docs Test Key',
    permissions: { read: true, write: true, delete: true, '*': true },
    rateLimit: 10000
  });
  if (res.status !== 201) throw new Error('API key create failed: ' + JSON.stringify(res.data));
  const apiKey = res.data.data.apiKey;
  console.log('  ✓ API key created');

  const api = axios.create({ baseURL: BASE, headers: { 'X-API-Key': apiKey }, validateStatus: () => true });

  // Create bucket
  console.log('→ Creating bucket');
  const bucketName = `docs-bucket-${stamp}`;
  res = await api.post('/buckets', { name: bucketName, visibility: 'private', description: 'Docs test bucket' });
  if (res.status !== 201) throw new Error('Bucket create failed: ' + JSON.stringify(res.data));
  const bucketId = res.data.data.id || res.data.data?.bucket?.id || res.data.data?.bucketId;
  console.log('  ✓ Bucket created', bucketId);

  // Upload file
  console.log('→ Uploading file');
  const form = new FormData();
  const content = Buffer.from('Hello from docs test at ' + new Date().toISOString());
  form.append('file', content, { filename: 'hello.txt', contentType: 'text/plain' });
  form.append('isPublic', 'true');
  res = await api.post(`/files/${bucketId}/upload`, form, { headers: form.getHeaders() });
  if (res.status !== 201) throw new Error('File upload failed: ' + JSON.stringify(res.data));
  const fileId = res.data.data.id;
  console.log('  ✓ File uploaded', fileId);

  // Inspect file metadata
  console.log('→ Fetching file metadata');
  res = await api.get(`/files/file/${fileId}`);
  console.log('  file meta:', JSON.stringify(res.data && res.data.data ? {
    id: res.data.data.id,
    path: res.data.data.path,
    url: res.data.data.url,
    b2: res.data.data.b2_file_id,
    is_public: res.data.data.is_public,
    bucket_id: res.data.data.bucket_id
  } : res.data, null, 2));

  // List files
  console.log('→ Listing files');
  res = await api.get(`/files/${bucketId}/files`);
  if (res.status !== 200) throw new Error('List files failed: ' + JSON.stringify(res.data));
  if (!Array.isArray(res.data.data?.files || res.data.data)) console.warn('  ! Unexpected list format');
  console.log('  ✓ Files listed');

  // Download file
  console.log('→ Downloading file');
  res = await api.get(`/files/file/${fileId}/download`, { responseType: 'arraybuffer', validateStatus: () => true });
  if (res.status !== 200) {
    const body = res.data && res.headers['content-type']?.includes('application/json')
      ? Buffer.from(res.data).toString('utf8')
      : (typeof res.data === 'string' ? res.data : '');
    throw new Error('Download failed: status ' + res.status + (body ? (', body: ' + body) : ''));
  }
  console.log('  ✓ File downloaded', res.headers['content-length'] || res.data?.length);

  // Delete file
  console.log('→ Deleting file');
  res = await api.delete(`/files/file/${fileId}`);
  if (res.status !== 200) throw new Error('Delete failed: ' + JSON.stringify(res.data));
  console.log('  ✓ File deleted');

  // Usage
  console.log('→ Fetching usage');
  res = await api.get('/usage/current');
  if (res.status !== 200) throw new Error('Usage failed: ' + JSON.stringify(res.data));
  console.log('  ✓ Usage fetched');

  console.log('\nAll documentation example operations succeeded.');
})().catch((e) => {
  console.error('\n✗ Docs test failed:', e.message);
  process.exit(1);
});
