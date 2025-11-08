import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from '../config/config.js';
import { query } from '../config/database.js';

const createTestUserAndApiKey = async () => {
  try {
    // Create a test user
    const email = 'sdk-test@example.com';
    const plainPassword = 'Test1234!';
    const passwordHash = await bcrypt.hash(plainPassword, config.BCRYPT_ROUNDS);

    // If a previous test user exists, remove it (cleanup) so script is idempotent
    try {
      await query(`DELETE FROM users WHERE email = $1`, [email]);
      console.log('Removed existing test user if present');
    } catch (delErr) {
      console.warn('Failed to remove existing test user (continuing):', delErr.message || delErr);
    }

    const userRes = await query(
      `INSERT INTO users (email, password, first_name, last_name, role, plan_id) \
       VALUES ($1, $2, $3, $4, 'user', $5) RETURNING id, email`,
      [email, passwordHash, 'SDK', 'Test', 'pro_monthly']
    );

    const user = userRes.rows[0];

    // Generate API key (format: sk_live_<random>)
    const apiKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyPrefix = apiKey.substring(0, 12) + '...';
    const keyHash = await bcrypt.hash(apiKey, config.BCRYPT_ROUNDS);

    // Give broader test permissions so SDK live tests can create buckets, upload files, and read usage
    const permissions = JSON.stringify([
      'files:read',
      'files:write',
      'buckets:read',
      'buckets:write',
      'usage:read',
      'files:delete',
      'buckets:delete'
    ]);

    const apiRes = await query(
      `INSERT INTO api_keys (user_id, name, key_hash, key_prefix, permissions) \
       VALUES ($1, $2, $3, $4, $5) RETURNING id, key_prefix, created_at`,
      [user.id, 'SDK Test Key', keyHash, keyPrefix, permissions]
    );

    console.log('\n✅ Test user and API key created successfully');
    console.log('User:', user.email, '| id:', user.id);
    console.log('API Key (save this securely):', apiKey);
    console.log('API Key Prefix (stored):', apiRes.rows[0].key_prefix);
    console.log('\nYou can now use this API key with the SDK or curl commands.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create test user and API key:', err);
    process.exit(1);
  }
};

createTestUserAndApiKey();
