/**
 * Advanced Examples from Documentation
 * Tests signed URLs, public files, CORS, and rate limits
 */

require('dotenv').config();
const { HypzSDK } = require('../../hypz-sdk/nodejs');

async function testAdvanced() {
  console.log('⚡ Testing Advanced Examples\n');

  const hypz = new HypzSDK({
    apiKey: process.env.HYPZ_API_KEY,
    baseURL: process.env.HYPZ_BASE_URL || 'http://localhost:5000/api/v1'
  });

  let testBucketId = null;
  let testFileId = null;

  try {
    // Setup: Create test bucket and file
    console.log('Setup: Creating test bucket and file...');
    const bucket = await hypz.buckets.create({
      name: 'test-advanced-' + Date.now(),
      visibility: 'private'
    });
    testBucketId = bucket.data?.id || bucket.id;

    const file = await hypz.files.upload({
      bucketId: testBucketId,
      file: Buffer.from('Secret file content'),
      fileName: 'secret.txt',
      isPublic: false
    });
    testFileId = file.data?.id || file.id;
    console.log('   Test resources created');
    console.log();

    // Example 1: Signed URLs (from documentation)
    console.log('✅ Example 1: Generate signed URL (temporary, secure access)');
    const signedUrlResponse = await hypz.files.getSignedURL(testFileId, 3600); // 1 hour
    console.log('   Signed URL generated:', 
      typeof signedUrlResponse === 'string' 
        ? signedUrlResponse.substring(0, 80) + '...'
        : (signedUrlResponse.url || signedUrlResponse).substring(0, 80) + '...'
    );
    console.log('   Expires in: 1 hour (3600 seconds)');
    console.log('   Note: Max expiry is 7 days (604800 seconds)');
    console.log();

    // Example 2: Public Files (from documentation)
    console.log('✅ Example 2: Make file publicly accessible');
    await hypz.files.update(testFileId, { isPublic: true });
    console.log('   File is now public');
    
    const baseUrl = process.env.HYPZ_BASE_URL || 'http://localhost:5000/api/v1';
    const publicUrl = `${baseUrl}/files/public/${testFileId}/download`;
    console.log('   Public download URL (no auth required):');
    console.log('   ', publicUrl);
    console.log();

    // Example 3: CORS Configuration (from documentation)
    console.log('✅ Example 3: Enable CORS for bucket');
    await hypz.buckets.update(testBucketId, {
      corsEnabled: true,
      corsOrigins: [
        'https://myapp.com',
        'https://staging.myapp.com'
      ]
    });
    console.log('   CORS enabled for bucket');
    console.log('   Allowed origins: https://myapp.com, https://staging.myapp.com');
    console.log();

    // Example 4: Rate Limits (from documentation)
    console.log('✅ Example 4: Rate limits information');
    console.log('   Default limits:');
    console.log('   - 100 requests per minute per API key');
    console.log('   - 1000 requests per hour per API key');
    console.log('   - 10 GB upload per day');
    console.log();
    console.log('   The SDK automatically handles rate limits with retry logic');
    console.log('   When rate limited, you will receive a HypzError with:');
    console.log('   - statusCode: 429');
    console.log('   - message: "Rate limit exceeded"');
    console.log('   - data.retryAfter: seconds to wait');
    console.log();

    // Cleanup: Delete test bucket
    console.log('Cleanup: Deleting test bucket...');
    await hypz.buckets.delete(testBucketId, true);
    console.log('   Test bucket deleted');
    console.log();

    console.log('✅ All advanced examples passed!\n');
  } catch (error) {
    console.error('❌ Advanced operation failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    
    // Cleanup on error
    if (testBucketId) {
      try {
        await hypz.buckets.delete(testBucketId, true);
        console.log('   Cleaned up test bucket');
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  testAdvanced()
    .then(() => {
      console.log('✅ Advanced tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Advanced tests failed');
      process.exit(1);
    });
}

module.exports = { testAdvanced };
