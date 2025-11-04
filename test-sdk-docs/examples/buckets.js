/**
 * Bucket Examples from Documentation
 * Tests all bucket operations shown in the docs
 */

require('dotenv').config();
const { HypzSDK } = require('../../hypz-sdk/nodejs');

async function testBuckets() {
  console.log('🗂️  Testing Bucket Examples\n');

  const hypz = new HypzSDK({
    apiKey: process.env.HYPZ_API_KEY,
    baseURL: process.env.HYPZ_BASE_URL || 'http://localhost:5000/api/v1'
  });

  let testBucketId = null;

  try {
    // Example 1: Create a new bucket (from documentation)
    console.log('✅ Example 1: Create bucket');
    const bucket = await hypz.buckets.create({
      name: 'test-docs-bucket-' + Date.now(),
      visibility: 'private',
      description: 'Store my app assets',
      region: 'us-east-1'
    });
    testBucketId = bucket.data?.id || bucket.id;
    console.log('   Bucket created:', bucket.data?.slug || bucket.slug);
    console.log('   Bucket ID:', testBucketId);
    console.log();

    // Example 2: List all buckets (from documentation)
    console.log('✅ Example 2: List buckets with pagination');
    const { buckets, pagination } = await hypz.buckets.list({
      page: 1,
      limit: 10,
      search: 'test-docs' // Optional search
    });
    console.log(`   Found ${buckets?.length || 0} buckets`);
    if (buckets && buckets.length > 0) {
      buckets.forEach(b => {
        console.log(`   - ${b.name}: ${b.file_count} files`);
      });
    }
    console.log();

    // Example 3: Get bucket details (from documentation)
    console.log('✅ Example 3: Get bucket details');
    const bucketDetails = await hypz.buckets.get(testBucketId);
    const bData = bucketDetails.data || bucketDetails;
    console.log('   Bucket:', bData.name);
    console.log('   Files:', bData.file_count);
    console.log('   Total size:', bData.total_size);
    console.log();

    // Example 4: Update bucket (from documentation)
    console.log('✅ Example 4: Update bucket settings');
    const updated = await hypz.buckets.update(testBucketId, {
      visibility: 'public',
      description: 'Updated description',
      corsEnabled: true,
      corsOrigins: ['https://myapp.com']
    });
    console.log('   Bucket updated:', updated.data?.name || updated.name);
    console.log();

    // Example 5: Get bucket statistics (from documentation)
    console.log('✅ Example 5: Get bucket statistics');
    const stats = await hypz.buckets.getStats(testBucketId);
    const sData = stats.data || stats;
    console.log('   Total files:', sData.total_files);
    console.log('   Total size:', sData.total_size);
    console.log('   Total downloads:', sData.total_downloads);
    if (sData.typeDistribution && sData.typeDistribution.length > 0) {
      console.log('   File types:', sData.typeDistribution.slice(0, 3));
    }
    console.log();

    // Example 6: Delete empty bucket (from documentation - safety check)
    console.log('✅ Example 6: Delete empty bucket (safe mode)');
    await hypz.buckets.delete(testBucketId);
    console.log('   Bucket deleted successfully (safe mode)');
    console.log();

    // Create another bucket for force delete test
    console.log('✅ Example 7: Force delete bucket with files');
    const bucket2 = await hypz.buckets.create({
      name: 'test-force-delete-' + Date.now(),
      visibility: 'private'
    });
    const bucket2Id = bucket2.data?.id || bucket2.id;
    console.log('   Created bucket for force delete test');

    // Force delete (from documentation)
    await hypz.buckets.delete(bucket2Id, true);
    console.log('   Bucket force deleted (use with caution!)');
    console.log();

    console.log('✅ All bucket examples passed!\n');
  } catch (error) {
    console.error('❌ Bucket operation failed:', error.message);
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
  testBuckets()
    .then(() => {
      console.log('✅ Bucket tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Bucket tests failed');
      process.exit(1);
    });
}

module.exports = { testBuckets };
