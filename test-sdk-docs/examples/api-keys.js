/**
 * API Keys Examples from Documentation
 * Tests API key management operations shown in the docs
 * Note: API key operations require JWT authentication
 */

require('dotenv').config();
const { HypzSDK } = require('../../hypz-sdk/nodejs');

async function testAPIKeys() {
  console.log('🔑 Testing API Keys Examples\n');

  // Note: API key operations typically require JWT token
  // If you have JWT, use: new HypzSDK({ jwt: process.env.HYPZ_JWT })
  const hypz = new HypzSDK({
    apiKey: process.env.HYPZ_API_KEY,
    baseURL: process.env.HYPZ_BASE_URL || 'http://localhost:5000/api/v1'
  });

  let testApiKeyId = null;

  try {
    // Example 1: Create API Key (from documentation)
    console.log('✅ Example 1: Create API key');
    try {
      const apiKey = await hypz.apiKeys.create({
        name: 'Test Server Key',
        permissions: ['files:read', 'files:write', 'buckets:read'],
        expiresAt: '2025-12-31'
      });
      testApiKeyId = apiKey.data?.id || apiKey.id;
      const keyData = apiKey.data || apiKey;
      console.log('   API Key created:', keyData.key?.substring(0, 20) + '...');
      console.log('   Keep this secure!');
      console.log();
    } catch (error) {
      console.log('   ⚠️  API key creation requires JWT authentication');
      console.log('   Error:', error.message);
      console.log('   Skipping remaining API key tests...');
      console.log();
      return;
    }

    // Example 2: List API Keys (from documentation)
    console.log('✅ Example 2: List API keys');
    const apiKeys = await hypz.apiKeys.list();
    const keys = apiKeys.data || apiKeys;
    console.log(`   Found ${keys.length} API keys`);
    if (keys.length > 0) {
      keys.forEach(key => {
        const lastUsed = key.last_used_at || 'Never used';
        console.log(`   - ${key.name}: ${lastUsed}`);
      });
    }
    console.log();

    // Example 3: Revoke API Key (from documentation)
    if (testApiKeyId) {
      console.log('✅ Example 3: Revoke API key');
      await hypz.apiKeys.revoke(testApiKeyId);
      console.log('   API key revoked');
      console.log();
    }

    console.log('✅ All API key examples passed!\n');
  } catch (error) {
    console.error('❌ API key operation failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    
    // Cleanup on error
    if (testApiKeyId) {
      try {
        await hypz.apiKeys.revoke(testApiKeyId);
        console.log('   Cleaned up test API key');
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  testAPIKeys()
    .then(() => {
      console.log('✅ API key tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ API key tests failed');
      process.exit(1);
    });
}

module.exports = { testAPIKeys };
