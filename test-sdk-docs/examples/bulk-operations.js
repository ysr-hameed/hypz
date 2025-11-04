/**
 * Bulk Operations Examples from Documentation
 * Tests all bulk operations shown in the docs
 */

require('dotenv').config();
const { HypzSDK } = require('../../hypz-sdk/nodejs');

async function testBulkOperations() {
  console.log('📦 Testing Bulk Operations Examples\n');

  const hypz = new HypzSDK({
    apiKey: process.env.HYPZ_API_KEY,
    baseURL: process.env.HYPZ_BASE_URL || 'http://localhost:5000/api/v1'
  });

  let testBucketId = null;
  let testBucket2Id = null;
  let testFileIds = [];

  try {
    // Setup: Create test buckets and files
    console.log('Setup: Creating test bucket and files...');
    const bucket = await hypz.buckets.create({
      name: 'test-bulk-ops-' + Date.now(),
      visibility: 'private'
    });
    testBucketId = bucket.data?.id || bucket.id;

    const bucket2 = await hypz.buckets.create({
      name: 'test-bulk-target-' + Date.now(),
      visibility: 'private'
    });
    testBucket2Id = bucket2.data?.id || bucket2.id;

    // Upload multiple test files
    for (let i = 1; i <= 5; i++) {
      const file = await hypz.files.upload({
        bucketId: testBucketId,
        file: Buffer.from(`Test file ${i} content`),
        fileName: `test-file-${i}.txt`,
        isPublic: false
      });
      testFileIds.push(file.data?.id || file.id);
    }
    console.log(`   Created ${testFileIds.length} test files`);
    console.log();

    // Example 1: Bulk Delete (from documentation)
    console.log('✅ Example 1: Bulk delete files');
    const deleteResult = await hypz.files.bulkDelete([testFileIds[0], testFileIds[1]]);
    const delData = deleteResult.data || deleteResult;
    console.log(`   Deleted ${delData.deletedCount} files`);
    console.log(`   Freed ${delData.totalSize} bytes`);
    console.log();

    // Remove deleted files from tracking
    testFileIds = testFileIds.slice(2);

    // Example 2: Bulk Update (from documentation)
    console.log('✅ Example 2: Bulk update files');
    const updateResult = await hypz.files.bulkUpdate({
      fileIds: [testFileIds[0], testFileIds[1]],
      isPublic: true,
      tags: ['archived', '2024'],
      metadata: { processed: true }
    });
    const updData = updateResult.data || updateResult;
    console.log(`   Updated ${updData.updatedCount} files`);
    console.log();

    // Example 3: Bulk Download (from documentation)
    console.log('✅ Example 3: Bulk download - get URLs');
    const downloadResult = await hypz.files.bulkDownload([testFileIds[0], testFileIds[1]]);
    const dlData = downloadResult.data || downloadResult;
    console.log(`   Generated download URLs for ${dlData.files?.length || 0} files`);
    if (dlData.files && dlData.files.length > 0) {
      dlData.files.forEach(file => {
        console.log(`   - ${file.filename}: ${file.downloadUrl.substring(0, 50)}...`);
      });
    }
    console.log();

    // Example 4: Bulk Move (from documentation)
    console.log('✅ Example 4: Bulk move files to another bucket');
    const moveResult = await hypz.files.bulkMove({
      fileIds: [testFileIds[0], testFileIds[1]],
      targetBucketId: testBucket2Id
    });
    const mvData = moveResult.data || moveResult;
    console.log(`   Moved ${mvData.movedCount} files`);
    console.log();

    // Cleanup: Delete test buckets
    console.log('Cleanup: Deleting test buckets...');
    await hypz.buckets.delete(testBucketId, true);
    await hypz.buckets.delete(testBucket2Id, true);
    console.log('   Test buckets deleted');
    console.log();

    console.log('✅ All bulk operation examples passed!\n');
  } catch (error) {
    console.error('❌ Bulk operation failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    
    // Cleanup on error
    if (testBucketId) {
      try {
        await hypz.buckets.delete(testBucketId, true);
      } catch (e) {}
    }
    if (testBucket2Id) {
      try {
        await hypz.buckets.delete(testBucket2Id, true);
      } catch (e) {}
    }
    
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  testBulkOperations()
    .then(() => {
      console.log('✅ Bulk operation tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Bulk operation tests failed');
      process.exit(1);
    });
}

module.exports = { testBulkOperations };
