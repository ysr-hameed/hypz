#!/usr/bin/env node
/**
 Use local Node SDK to run end-to-end operations including signed URL
*/
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { HypzSDK } = require('../hypz-sdk/nodejs/index.js');

const BASE = process.env.HYPZ_BASE_URL || 'http://localhost:5000/api/v1';

(async () => {
  const client = axios.create({ baseURL: BASE, validateStatus: () => true });
  const stamp = Date.now();
  const email = `sdk+t${stamp}@example.com`;
  const password = 'DocsTest123';

  // Register or login via REST to obtain JWT for API key creation
  let res = await client.post('/auth/register', { email, password, firstName: 'SDK', lastName: 'Tester' });
  let token;
  if (res.status === 201 && res.data?.data?.token) token = res.data.data.token;
  if (!token) {
    res = await client.post('/auth/login', { email, password });
    if (res.status === 200) token = res.data.data.token;
  }
  if (!token) throw new Error('Failed to get JWT');

  const authed = axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true });
  res = await authed.post('/api-keys', { name: 'SDK Test', permissions: { read: true, write: true, delete: true } });
  if (res.status !== 201) throw new Error('API key creation failed');
  const apiKey = res.data.data.apiKey;

  // Initialize SDK with API key
  const hypz = new HypzSDK({ apiKey, baseURL: BASE });

  // Create bucket (private)
  console.log('→ SDK create private bucket');
  const bucket = await hypz.buckets.create({ name: `sdk-bucket-${stamp}`, visibility: 'private' });

  // Upload a small file buffer
  console.log('→ SDK upload');
  const buffer = Buffer.from('hi from sdk ' + new Date().toISOString());
  const uploaded = await hypz.files.upload({ bucketId: bucket.data?.id || bucket.id, file: buffer, fileName: 'hello.txt', isPublic: false });
  const fileId = uploaded.data?.id || uploaded.id;

  // Signed URL (1 hour)
  console.log('→ SDK get signed URL');
  const signedUrl = await hypz.files.getSignedURL(fileId, 3600);
  if (!signedUrl) throw new Error('No signed URL');

  // Try downloading via signed URL
  console.log('→ Download via signed URL');
  const dl = await axios.get(signedUrl, { responseType: 'arraybuffer', validateStatus: () => true });
  if (dl.status !== 200) throw new Error('Signed URL download failed: ' + dl.status);

  // Cleanup
  console.log('→ Cleanup');
  await hypz.files.delete(fileId);

  console.log('\nSDK flow completed successfully.');
})().catch((e) => {
  console.error('SDK test failed:', e.message);
  process.exit(1);
});
