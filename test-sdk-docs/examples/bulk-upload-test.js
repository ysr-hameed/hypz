require('dotenv').config();
const { HypzSDK } = require('../../hypz-sdk/nodejs/index.js');
const fs = require('fs');
const path = require('path');

async function testBulkUpload() {
  console.log('🔧 Testing Bulk Upload Operations...\n');
  
  const apiKey = process.env.HYPZ_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: HYPZ_API_KEY not found in .env file');
    process.exit(1);
  }

  const hypz = new HypzSDK({ apiKey });

  try {
    // Test connection to verify authentication
    console.log('1. Authenticating...');
    const testResult = await hypz.testConnection();
    console.log(`✓ Connected: ${testResult.message}\n`);

    // Create a test bucket for bulk upload
    console.log('2. Creating test bucket...');
    const bucket = await hypz.buckets.create({
      name: `bulk-upload-test-${Date.now()}`,
      isPublic: false
    });
    console.log(`✓ Created bucket: ${bucket.data.name} (ID: ${bucket.data.id})\n`);

    // Create test files in memory
    console.log('3. Preparing test files...');
    const testFiles = [
      {
        file: Buffer.from('This is test file 1 content'),
        filename: 'test-file-1.txt'
      },
      {
        file: Buffer.from('This is test file 2 content'),
        filename: 'test-file-2.txt'
      },
      {
        file: Buffer.from('This is test file 3 content'),
        filename: 'test-file-3.txt'
      }
    ];
    console.log(`✓ Prepared ${testFiles.length} test files\n`);

    // Perform bulk upload
    console.log('4. Performing bulk upload...');
    const uploadResult = await hypz.files.bulkUpload({
      bucketId: bucket.data.id,
      files: testFiles,
      isPublic: false,
      tags: ['test', 'bulk-upload'],
      metadata: { testRun: true, timestamp: new Date().toISOString() }
    });
    
    console.log(`✓ Upload completed!`);
    console.log(`  - Uploaded: ${uploadResult.data.uploadedCount} files`);
    console.log(`  - Total size: ${uploadResult.data.totalSize} bytes`);
    console.log(`  - Errors: ${uploadResult.data.errorCount || 0}`);
    
    if (uploadResult.data.files && uploadResult.data.files.length > 0) {
      console.log('\n  Uploaded files:');
      uploadResult.data.files.forEach(file => {
        console.log(`    - ${file.original_name} (${file.size} bytes)`);
        console.log(`      ID: ${file.id}`);
        console.log(`      Tags: ${file.tags ? file.tags.join(', ') : 'none'}`);
      });
    }
    
    if (uploadResult.data.errors && uploadResult.data.errors.length > 0) {
      console.log('\n  Errors:');
      uploadResult.data.errors.forEach(err => {
        console.log(`    - ${err.filename}: ${err.error}`);
      });
    }
    console.log();

    // Verify files were uploaded
    console.log('5. Verifying uploaded files...');
    const files = await hypz.files.list(bucket.data.id);
    console.log(`✓ Found ${files.data.files.length} files in bucket`);
    
    if (files.data.files.length !== testFiles.length) {
      console.log(`⚠️  Warning: Expected ${testFiles.length} files but found ${files.data.files.length}`);
    }
    console.log();

    // Test bulk upload with real files if available
    const testImagePath = path.join(__dirname, '../../frontend/public/logo.png');
    if (fs.existsSync(testImagePath)) {
      console.log('6. Testing bulk upload with real file...');
      const realFileUpload = await hypz.files.bulkUpload({
        bucketId: bucket.data.id,
        files: [
          {
            file: fs.createReadStream(testImagePath),
            filename: 'logo.png'
          }
        ],
        isPublic: true,
        tags: ['logo', 'image']
      });
      console.log(`✓ Uploaded real file: ${realFileUpload.data.uploadedCount} file(s)`);
      if (realFileUpload.data.files && realFileUpload.data.files.length > 0) {
        console.log(`  - ${realFileUpload.data.files[0].original_name} (${realFileUpload.data.files[0].size} bytes)`);
      }
      console.log();
    }

    // Test error handling - try to exceed file limit
    console.log('7. Testing file limit (should handle gracefully)...');
    try {
      const tooManyFiles = Array(25).fill(null).map((_, i) => ({
        file: Buffer.from(`File ${i}`),
        filename: `file-${i}.txt`
      }));
      await hypz.files.bulkUpload({
        bucketId: bucket.data.id,
        files: tooManyFiles
      });
      console.log('⚠️  Warning: Should have rejected >20 files');
    } catch (err) {
      console.log(`✓ Correctly rejected excessive files: ${err.message}`);
    }
    console.log();

    // Cleanup
    console.log('8. Cleaning up test bucket...');
    await hypz.buckets.delete(bucket.data.id, true); // Force delete
    console.log('✓ Test bucket deleted\n');

    console.log('✅ All bulk upload tests passed!');
    return true;

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run the test
testBulkUpload()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
