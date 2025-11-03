// Test script for @hypz/sdk
import { Hypz } from './dist/index.esm.js';

// Replace with your actual API key from the dashboard
const API_KEY = 'hypz_your_api_key_here';

const hypz = new Hypz({
  apiKey: API_KEY,
  baseURL: 'http://localhost:5000/api/v1'
});

async function testSDK() {
  console.log('🧪 Testing Hypz SDK...\n');

  try {
    // Test 1: List buckets
    console.log('1️⃣  Testing listBuckets()...');
    const buckets = await hypz.listBuckets();
    console.log(`✅ Found ${buckets.length} buckets`);
    if (buckets.length > 0) {
      console.log(`   First bucket: ${buckets[0].name}`);
    }
    console.log('');

    // Test 2: Get usage
    console.log('2️⃣  Testing getUsage()...');
    const usage = await hypz.getUsage();
    console.log(`✅ Storage used: ${(usage.storage_used / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Bandwidth: ${(usage.bandwidth_used / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   API calls: ${usage.api_calls}`);
    console.log(`   Files: ${usage.files_count}`);
    console.log('');

    // Test 3: Create a bucket (optional)
    console.log('3️⃣  Testing createBucket()...');
    try {
      const newBucket = await hypz.createBucket({
        name: `test-bucket-${Date.now()}`,
        visibility: 'public',
        description: 'Test bucket from SDK'
      });
      console.log(`✅ Created bucket: ${newBucket.name} (ID: ${newBucket.id})`);
      console.log('');
    } catch (error) {
      if (error.statusCode === 409) {
        console.log('⚠️  Bucket already exists (409), skipping...\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 All tests passed!\n');
    console.log('✨ SDK is working correctly!');
    console.log('📚 Check the README.md for more examples.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response);
    }
    if (error.statusCode === 401) {
      console.error('\n⚠️  API Key Error:');
      console.error('   1. Make sure you created an API key in the dashboard');
      console.error('   2. Copy the key and replace API_KEY in this test file');
      console.error('   3. Ensure the API key has the correct permissions');
    }
    process.exit(1);
  }
}

testSDK();
