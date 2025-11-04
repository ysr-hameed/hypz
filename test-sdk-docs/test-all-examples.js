/**
 * Master Test Runner
 * Runs all documentation examples in sequence
 */

require('dotenv').config();
const { testAuthentication } = require('./examples/authentication');
const { testBuckets } = require('./examples/buckets');
const { testFiles } = require('./examples/files');
const { testBulkOperations } = require('./examples/bulk-operations');
const { testAPIKeys } = require('./examples/api-keys');
const { testAdvanced } = require('./examples/advanced');

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🧪 Hypz SDK Documentation Test Suite');
  console.log('  Testing all code examples from documentation page');
  console.log('═══════════════════════════════════════════════════════════\n');

  const startTime = Date.now();
  let passedTests = 0;
  let failedTests = 0;

  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Buckets', fn: testBuckets },
    { name: 'Files', fn: testFiles },
    { name: 'Bulk Operations', fn: testBulkOperations },
    { name: 'API Keys', fn: testAPIKeys },
    { name: 'Advanced Features', fn: testAdvanced }
  ];

  for (const test of tests) {
    try {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`Running: ${test.name}`);
      console.log('─'.repeat(60));
      await test.fn();
      passedTests++;
      console.log(`✅ ${test.name} - PASSED\n`);
    } catch (error) {
      failedTests++;
      console.error(`❌ ${test.name} - FAILED`);
      console.error(`   Error: ${error.message}\n`);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  📊 Test Summary');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Total Tests:  ${tests.length}`);
  console.log(`  ✅ Passed:     ${passedTests}`);
  console.log(`  ❌ Failed:     ${failedTests}`);
  console.log(`  ⏱️  Duration:   ${duration}s`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (failedTests === 0) {
    console.log('🎉 All tests passed! Documentation examples are working correctly.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
