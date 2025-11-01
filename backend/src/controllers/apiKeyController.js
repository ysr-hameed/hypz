import { query } from '../config/database.js';
import { generateApiKey, hashApiKey, successResponse, errorResponse } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';

// Create API key
export const createApiKey = asyncHandler(async (req, res) => {
  const { name, permissions = { read: true, write: true, delete: false }, rateLimit = 1000, expiresIn } = req.body;
  const userId = req.user.id;

  // Generate API key
  const apiKey = generateApiKey('sk_live');
  const keyPrefix = apiKey.substring(0, 12) + '...';

  // Hash the API key for storage
  const keyHash = await hashApiKey(apiKey);

  // Calculate expiration date if provided
  let expiresAt = null;
  if (expiresIn) {
    expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000); // days to milliseconds
  }

  // Store in database
  const result = await query(
    `INSERT INTO api_keys (user_id, name, key_hash, key_prefix, permissions, rate_limit, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, key_prefix, permissions, rate_limit, expires_at, created_at`,
    [userId, name, keyHash, keyPrefix, JSON.stringify(permissions), rateLimit, expiresAt]
  );

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
    [userId, 'api_key_created', 'api_key', result.rows[0].id]
  );

  // Return the plain API key ONLY ONCE
  successResponse(res, {
    ...result.rows[0],
    apiKey, // Only returned during creation
    warning: 'Please save this API key securely. You will not be able to see it again.'
  }, 'API key created successfully', 201);
});

// Get all API keys for user
export const getApiKeys = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT id, name, key_prefix, permissions, rate_limit, expires_at, 
            last_used_at, last_used_ip, is_active, created_at
     FROM api_keys
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  successResponse(res, result.rows);
});

// Get single API key
export const getApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const userId = req.user.id;

  const result = await query(
    `SELECT id, name, key_prefix, permissions, rate_limit, expires_at,
            last_used_at, last_used_ip, is_active, created_at
     FROM api_keys
     WHERE id = $1 AND user_id = $2`,
    [keyId, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'API key not found', 404);
  }

  successResponse(res, result.rows[0]);
});

// Update API key
export const updateApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const userId = req.user.id;
  const { name, permissions, rateLimit, isActive } = req.body;

  const updates = [];
  const params = [keyId, userId];
  let paramIndex = 3;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    params.push(name);
  }
  if (permissions !== undefined) {
    updates.push(`permissions = $${paramIndex++}`);
    params.push(JSON.stringify(permissions));
  }
  if (rateLimit !== undefined) {
    updates.push(`rate_limit = $${paramIndex++}`);
    params.push(rateLimit);
  }
  if (isActive !== undefined) {
    updates.push(`is_active = $${paramIndex++}`);
    params.push(isActive);
  }

  if (updates.length === 0) {
    return errorResponse(res, 'No fields to update', 400);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  const result = await query(
    `UPDATE api_keys SET ${updates.join(', ')}
     WHERE id = $1 AND user_id = $2
     RETURNING id, name, key_prefix, permissions, rate_limit, is_active, updated_at`,
    params
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'API key not found', 404);
  }

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
    [userId, 'api_key_updated', 'api_key', keyId]
  );

  successResponse(res, result.rows[0], 'API key updated successfully');
});

// Delete API key
export const deleteApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const userId = req.user.id;

  const result = await query(
    'DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING id',
    [keyId, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'API key not found', 404);
  }

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
    [userId, 'api_key_deleted', 'api_key', keyId]
  );

  successResponse(res, null, 'API key deleted successfully');
});

// Regenerate API key
export const regenerateApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const userId = req.user.id;

  // Check if key exists
  const existing = await query(
    'SELECT id FROM api_keys WHERE id = $1 AND user_id = $2',
    [keyId, userId]
  );

  if (existing.rows.length === 0) {
    return errorResponse(res, 'API key not found', 404);
  }

  // Generate new API key
  const apiKey = generateApiKey('sk_live');
  const keyPrefix = apiKey.substring(0, 12) + '...';
  const keyHash = await hashApiKey(apiKey);

  // Update in database
  const result = await query(
    `UPDATE api_keys 
     SET key_hash = $1, key_prefix = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 AND user_id = $4
     RETURNING id, name, key_prefix, permissions, rate_limit, created_at`,
    [keyHash, keyPrefix, keyId, userId]
  );

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)',
    [userId, 'api_key_regenerated', 'api_key', keyId]
  );

  successResponse(res, {
    ...result.rows[0],
    apiKey, // Only returned during regeneration
    warning: 'Please save this API key securely. The old key is now invalid.'
  }, 'API key regenerated successfully');
});
