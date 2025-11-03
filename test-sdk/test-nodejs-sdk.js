// Comprehensive test for Hypz Node.js SDK
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_KEY = 'sk_live_UXHEakqYuGlKDkMZVKSXIoFyweDIytkl';
const BASE_URL = 'http://localhost:5000/api/v1';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`)
};

// API Client
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-API-Key': API_KEY
  }
});

let testBucketId = null;
let testFileId = null;

// Test functions
async function testBucketCreate() {
  log.section('TEST 1: Create Bucket');
  try {
    const response = await api.post('/buckets', {
      name: `test-bucket-${Date.now()}`,
      description: 'Test bucket from Node.js SDK',
      visibility: 'private'
    });
    
    testBucketId = response.data.data.id;
    log.success('Bucket created successfully');
    log.info(`Bucket ID: ${testBucketId}`);
    log.info(`Bucket Name: ${response.data.data.name}`);
    return true;
  } catch (error) {
    log.error('Failed to create bucket');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testBucketList() {
  log.section('TEST 2: List Buckets');
  try {
    const response = await api.get('/buckets');
    log.success(`Retrieved ${response.data.data.buckets.length} bucket(s)`);
    response.data.data.buckets.forEach(bucket => {
      log.info(`  - ${bucket.name} (${bucket.visibility})`);
    });
    return true;
  } catch (error) {
    log.error('Failed to list buckets');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testBucketGet() {
  log.section('TEST 3: Get Bucket Details');
  try {
    const response = await api.get(`/buckets/${testBucketId}`);
    log.success('Retrieved bucket details');
    log.info(`Name: ${response.data.data.name}`);
    log.info(`Files: ${response.data.data.file_count || 0}`);
    return true;
  } catch (error) {
    log.error('Failed to get bucket details');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testFileUpload() {
  log.section('TEST 4: Upload File');
  try {
    // Create test file
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    const fileContent = `Test file created at ${new Date().toISOString()}\n` +
                       `This is a test file for Hypz Node.js SDK\n` +
                       `API Key: ${API_KEY.substring(0, 10)}...`;
    fs.writeFileSync(testFilePath, fileContent);
    
    // Upload file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('isPublic', 'false');
    formData.append('tags', JSON.stringify(['test', 'nodejs', 'sdk']));
    formData.append('metadata', JSON.stringify({
      source: 'nodejs_sdk_test',
      timestamp: new Date().toISOString()
    }));
    
    const response = await api.post(`/files/${testBucketId}/upload`, formData, {
      headers: formData.getHeaders()
    });
    
    testFileId = response.data.data.id;
    log.success('File uploaded successfully');
    log.info(`File ID: ${testFileId}`);
    log.info(`File Name: ${response.data.data.original_name}`);
    log.info(`File Size: ${response.data.data.size} bytes`);
    log.info(`URL: ${response.data.data.url}`);
    
    // Cleanup local file
    fs.unlinkSync(testFilePath);
    
    return true;
  } catch (error) {
    log.error('Failed to upload file');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testFileList() {
  log.section('TEST 5: List Files');
  try {
    // Add delay to ensure file is committed to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await api.get(`/files/${testBucketId}/files`);
    log.success(`Retrieved ${response.data.data.files.length} file(s)`);
    response.data.data.files.forEach(file => {
      log.info(`  - ${file.original_name} (${file.size} bytes)`);
    });
    return true;
  } catch (error) {
    log.error('Failed to list files');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testFileGet() {
  log.section('TEST 6: Get File Details');
  try {
    const response = await api.get(`/files/file/${testFileId}`);
    log.success('Retrieved file details');
    log.info(`Name: ${response.data.data.original_name}`);
    log.info(`MIME: ${response.data.data.mime_type}`);
    log.info(`Tags: ${response.data.data.tags.join(', ')}`);
    log.info(`Public: ${response.data.data.is_public}`);
    return true;
  } catch (error) {
    log.error('Failed to get file details');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testFileUpdate() {
  log.section('TEST 7: Update File Metadata');
  try {
    const response = await api.patch(`/files/file/${testFileId}`, {
      tags: ['test', 'nodejs', 'sdk', 'updated'],
      metadata: {
        source: 'nodejs_sdk_test',
        updated_at: new Date().toISOString(),
        version: '2.0'
      }
    });
    log.success('File metadata updated');
    log.info(`Updated tags: ${response.data.data.tags.join(', ')}`);
    return true;
  } catch (error) {
    log.error('Failed to update file');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testBucketStats() {
  log.section('TEST 8: Get Bucket Statistics');
  try {
    const response = await api.get(`/buckets/${testBucketId}/stats`);
    log.success('Retrieved bucket statistics');
    log.info(`Files: ${response.data.data.file_count}`);
    log.info(`Total Size: ${response.data.data.total_size} bytes`);
    return true;
  } catch (error) {
    log.error('Failed to get bucket stats');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testBucketUpdate() {
  log.section('TEST 9: Update Bucket');
  try {
    const response = await api.put(`/buckets/${testBucketId}`, {
      name: `test-bucket-${Date.now()}`,
      description: 'Updated description from Node.js SDK test'
    });
    log.success('Bucket updated successfully');
    log.info(`New description: ${response.data.data.description}`);
    return true;
  } catch (error) {
    log.error('Failed to update bucket');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testFileDelete() {
  log.section('TEST 10: Delete File');
  try {
    await api.delete(`/files/file/${testFileId}`);
    log.success('File deleted successfully');
    return true;
  } catch (error) {
    log.error('Failed to delete file');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function testBucketDelete() {
  log.section('TEST 11: Delete Bucket');
  try {
    await api.delete(`/buckets/${testBucketId}`);
    log.success('Bucket deleted successfully');
    return true;
  } catch (error) {
    log.error('Failed to delete bucket');
    console.error(error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║         Hypz Node.js SDK - Comprehensive Test Suite      ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  log.info(`API URL: ${BASE_URL}`);
  log.info(`API Key: ${API_KEY.substring(0, 15)}...`);
  
  const tests = [
    testBucketCreate,
    testBucketList,
    testBucketGet,
    testFileUpload,
    testFileList,
    testFileGet,
    testFileUpdate,
    testBucketStats,
    testBucketUpdate,
    testFileDelete,
    testBucketDelete
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  log.section('TEST RESULTS');
  log.success(`Passed: ${passed}/${tests.length}`);
  if (failed > 0) {
    log.error(`Failed: ${failed}/${tests.length}`);
  }
  
  if (passed === tests.length) {
    console.log(`\n${colors.green}🎉 ALL TESTS PASSED! Node.js SDK is working perfectly!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Please check the errors above.${colors.reset}\n`);
  }
}

// Run tests
runAllTests().catch(error => {
  log.error('Test suite failed');
  console.error(error);
  process.exit(1);
});
