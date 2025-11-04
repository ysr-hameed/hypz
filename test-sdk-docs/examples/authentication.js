/**
 * Authentication Examples from Documentation
 * Tests authentication and connection setup
 */

require('dotenv').config();
const { HypzSDK } = require('../../hypz-sdk/nodejs');

async function testAuthentication() {
  console.log('🔐 Testing Authentication Examples\n');

  try {
    // Example 1: Initialize with API key (from documentation)
    console.log('✅ Example 1: Initialize with API key');
    const hypz = new HypzSDK({
      apiKey: process.env.HYPZ_API_KEY,
      baseURL: process.env.HYPZ_BASE_URL || 'http://localhost:5000/api/v1'
    });
    console.log('   SDK initialized successfully\n');

    // Example 2: Test connection (from documentation)
    console.log('✅ Example 2: Test connection');
    const testResult = await hypz.testConnection();
    console.log('   Connection test:', testResult.message);
    console.log();

    // Note: getCurrentUser() requires JWT token, not API key
    // If you have JWT token, uncomment below:
    // const user = await hypz.auth.getCurrentUser();
    // console.log('   Connected as:', user.data?.email || user.email);
    console.log('   ℹ️  Note: getCurrentUser() requires JWT authentication');
    console.log('   ℹ️  API key authentication works for all other operations');
    console.log();

    // Example 3: Alternative initialization syntax
    console.log('✅ Example 3: Alternative initialization (positional args)');
    const hypz2 = new HypzSDK(process.env.HYPZ_API_KEY, {
      baseURL: process.env.HYPZ_BASE_URL
    });
    const testConnection = await hypz2.testConnection();
    console.log('   Connection test:', testConnection.message);
    console.log();

    console.log('✅ All authentication examples passed!\n');
    return hypz;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  testAuthentication()
    .then(() => {
      console.log('✅ Authentication tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Authentication tests failed');
      process.exit(1);
    });
}

module.exports = { testAuthentication };
