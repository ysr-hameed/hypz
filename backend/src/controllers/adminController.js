import { query } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';

// Get all admin settings
export const getSettings = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, key, value, description, category, is_public, updated_at FROM admin_settings ORDER BY category, key'
  );

  // Group settings by category
  const settingsByCategory = result.rows.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push({
      id: setting.id,
      key: setting.key,
      value: setting.value,
      description: setting.description,
      isPublic: setting.is_public,
      updatedAt: setting.updated_at
    });
    return acc;
  }, {});

  successResponse(res, settingsByCategory);
});

// Get single setting by key
export const getSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const result = await query(
    'SELECT id, key, value, description, category, is_public FROM admin_settings WHERE key = $1',
    [key]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Setting not found', 404);
  }

  successResponse(res, result.rows[0]);
});

// Update setting
export const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  // Check if setting exists
  const existingResult = await query(
    'SELECT id FROM admin_settings WHERE key = $1',
    [key]
  );

  if (existingResult.rows.length === 0) {
    return errorResponse(res, 'Setting not found', 404);
  }

  // Update setting
  const result = await query(
    `UPDATE admin_settings 
     SET value = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE key = $2 
     RETURNING id, key, value, description, category`,
    [JSON.stringify(value), key]
  );

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action, resource_type, details) 
     VALUES ($1, $2, $3, $4)`,
    [req.user.id, 'admin_setting_updated', 'admin_settings', JSON.stringify({ key, value })]
  );

  successResponse(res, result.rows[0], 'Setting updated successfully');
});

// Get all users (admin only)
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
  
  const offset = (page - 1) * limit;

  let whereConditions = [];
  let params = [];
  let paramCounter = 1;

  if (search) {
    whereConditions.push(`(email ILIKE $${paramCounter} OR first_name ILIKE $${paramCounter} OR last_name ILIKE $${paramCounter})`);
    params.push(`%${search}%`);
    paramCounter++;
  }

  if (role) {
    whereConditions.push(`role = $${paramCounter}`);
    params.push(role);
    paramCounter++;
  }

  if (status) {
    whereConditions.push(`is_active = $${paramCounter}`);
    params.push(status === 'active');
    paramCounter++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Get users
  const usersResult = await query(
    `SELECT id, email, first_name, last_name, email_verified, plan_id, role, 
     is_active, two_factor_enabled, last_login, created_at 
     FROM users 
     ${whereClause}
     ORDER BY created_at DESC 
     LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`,
    [...params, limit, offset]
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) FROM users ${whereClause}`,
    params
  );

  successResponse(res, {
    users: usersResult.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(countResult.rows[0].count / limit)
    }
  });
});

// Update user status (activate/deactivate)
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const result = await query(
    `UPDATE users 
     SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING id, email, is_active`,
    [isActive, userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'User not found', 404);
  }

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) 
     VALUES ($1, $2, $3, $4, $5)`,
    [req.user.id, 'user_status_updated', 'users', userId, JSON.stringify({ isActive })]
  );

  successResponse(res, result.rows[0], `User ${isActive ? 'activated' : 'deactivated'} successfully`);
});

// Get system stats (dashboard)
export const getSystemStats = asyncHandler(async (req, res) => {
  // Get user counts
  const usersResult = await query(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d,
      COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
      COUNT(CASE WHEN two_factor_enabled = true THEN 1 END) as users_with_2fa
    FROM users
  `);

  // Get storage stats
  const storageResult = await query(`
    SELECT 
      COUNT(*) as total_files,
      COALESCE(SUM(size), 0) as total_storage_bytes
    FROM files WHERE deleted_at IS NULL
  `);

  // Get bucket stats
  const bucketsResult = await query('SELECT COUNT(*) as total_buckets FROM buckets');

  // Get recent activity
  const activityResult = await query(`
    SELECT COUNT(*) as total_activities
    FROM activity_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours'
  `);

  // Get revenue stats
  const revenueResult = await query(`
    SELECT 
      COUNT(*) as total_payments,
      COALESCE(SUM(amount), 0) as total_revenue,
      COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN amount ELSE 0 END), 0) as revenue_30d
    FROM payments WHERE status = 'completed'
  `);

  successResponse(res, {
    users: usersResult.rows[0],
    storage: storageResult.rows[0],
    buckets: bucketsResult.rows[0],
    activity: activityResult.rows[0],
    revenue: revenueResult.rows[0]
  });
});

// Get activity logs
export const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, userId = '', action = '' } = req.query;
  
  const offset = (page - 1) * limit;

  let whereConditions = [];
  let params = [];
  let paramCounter = 1;

  if (userId) {
    whereConditions.push(`user_id = $${paramCounter}`);
    params.push(userId);
    paramCounter++;
  }

  if (action) {
    whereConditions.push(`action = $${paramCounter}`);
    params.push(action);
    paramCounter++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT a.*, u.email, u.first_name, u.last_name
     FROM activity_logs a
     LEFT JOIN users u ON a.user_id = u.id
     ${whereClause}
     ORDER BY a.created_at DESC 
     LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`,
    [...params, limit, offset]
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM activity_logs ${whereClause}`,
    params
  );

  successResponse(res, {
    logs: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(countResult.rows[0].count / limit)
    }
  });
});

// ============ PLAN MANAGEMENT ============

// Get all plans (admin view with subscribers count)
export const getAllPlans = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT p.*, COUNT(u.id) as subscriber_count
    FROM plans p
    LEFT JOIN users u ON p.id = u.plan_id
    GROUP BY p.id
    ORDER BY p.price_usd ASC
  `);

  successResponse(res, result.rows);
});

// Create new plan
export const createPlan = asyncHandler(async (req, res) => {
  const {
    id,
    name,
    type,
    price_usd,
    storage_gb,
    bandwidth_gb,
    api_calls,
    max_buckets,
    max_file_size_mb,
    features
  } = req.body;

  // Check if plan ID already exists
  const existingPlan = await query('SELECT id FROM plans WHERE id = $1', [id]);
  if (existingPlan.rows.length > 0) {
    return errorResponse(res, 'Plan with this ID already exists', 400);
  }

  const result = await query(
    `INSERT INTO plans 
     (id, name, type, price_usd, storage_gb, bandwidth_gb, api_calls, max_buckets, max_file_size_mb, features)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [id, name, type, price_usd, storage_gb, bandwidth_gb, api_calls, max_buckets, max_file_size_mb, JSON.stringify(features)]
  );

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action, resource_type, details) 
     VALUES ($1, $2, $3, $4)`,
    [req.user.id, 'plan_created', 'plans', JSON.stringify({ planId: id })]
  );

  successResponse(res, result.rows[0], 'Plan created successfully', 201);
});

// Update plan
export const updatePlan = asyncHandler(async (req, res) => {
  const { planId } = req.params;
  const {
    name,
    type,
    price_usd,
    storage_gb,
    bandwidth_gb,
    api_calls,
    max_buckets,
    max_file_size_mb,
    features
  } = req.body;

  const result = await query(
    `UPDATE plans 
     SET name = $1, type = $2, price_usd = $3, storage_gb = $4, 
         bandwidth_gb = $5, api_calls = $6, max_buckets = $7, 
         max_file_size_mb = $8, features = $9, updated_at = CURRENT_TIMESTAMP
     WHERE id = $10
     RETURNING *`,
    [name, type, price_usd, storage_gb, bandwidth_gb, api_calls, max_buckets, max_file_size_mb, JSON.stringify(features), planId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Plan not found', 404);
  }

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) 
     VALUES ($1, $2, $3, $4, $5)`,
    [req.user.id, 'plan_updated', 'plans', planId, JSON.stringify(req.body)]
  );

  successResponse(res, result.rows[0], 'Plan updated successfully');
});

// Delete plan
export const deletePlan = asyncHandler(async (req, res) => {
  const { planId } = req.params;

  // Check if any users are on this plan
  const usersOnPlan = await query('SELECT COUNT(*) FROM users WHERE plan_id = $1', [planId]);
  if (parseInt(usersOnPlan.rows[0].count) > 0) {
    return errorResponse(res, `Cannot delete plan - ${usersOnPlan.rows[0].count} users are currently subscribed`, 400);
  }

  const result = await query('DELETE FROM plans WHERE id = $1 RETURNING id', [planId]);

  if (result.rows.length === 0) {
    return errorResponse(res, 'Plan not found', 404);
  }

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) 
     VALUES ($1, $2, $3, $4, $5)`,
    [req.user.id, 'plan_deleted', 'plans', planId, JSON.stringify({ planId })]
  );

  successResponse(res, null, 'Plan deleted successfully');
});

// ============ WEBHOOK MANAGEMENT ============

// Get all webhook subscriptions (all users)
export const getAllWebhooks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  const result = await query(`
    SELECT 
      es.*,
      u.email as user_email,
      u.first_name,
      u.last_name,
      b.name as bucket_name,
      COUNT(wd.id) as total_deliveries,
      COUNT(CASE WHEN wd.status = 'success' THEN 1 END) as successful_deliveries,
      COUNT(CASE WHEN wd.status = 'failed' THEN 1 END) as failed_deliveries
    FROM event_subscriptions es
    JOIN users u ON es.user_id = u.id
    LEFT JOIN buckets b ON es.bucket_id = b.id
    LEFT JOIN webhook_deliveries wd ON es.id = wd.subscription_id
    GROUP BY es.id, u.email, u.first_name, u.last_name, b.name
    ORDER BY es.created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  const countResult = await query('SELECT COUNT(*) FROM event_subscriptions');

  successResponse(res, {
    webhooks: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(countResult.rows[0].count / limit)
    }
  });
});

// Get webhook deliveries for admin
export const getWebhookDeliveries = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const { page = 1, limit = 100 } = req.query;
  const offset = (page - 1) * limit;

  const result = await query(`
    SELECT 
      wd.*,
      es.name as subscription_name,
      u.email as user_email
    FROM webhook_deliveries wd
    JOIN event_subscriptions es ON wd.subscription_id = es.id
    JOIN users u ON es.user_id = u.id
    WHERE wd.subscription_id = $1
    ORDER BY wd.created_at DESC
    LIMIT $2 OFFSET $3
  `, [subscriptionId, limit, offset]);

  const countResult = await query(
    'SELECT COUNT(*) FROM webhook_deliveries WHERE subscription_id = $1',
    [subscriptionId]
  );

  successResponse(res, {
    deliveries: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(countResult.rows[0].count / limit)
    }
  });
});

// Disable webhook subscription (admin)
export const disableWebhook = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  const result = await query(
    'UPDATE event_subscriptions SET enabled = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
    [subscriptionId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Webhook subscription not found', 404);
  }

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) 
     VALUES ($1, $2, $3, $4, $5)`,
    [req.user.id, 'webhook_disabled', 'event_subscriptions', subscriptionId, JSON.stringify({ admin: true })]
  );

  successResponse(res, result.rows[0], 'Webhook disabled successfully');
});

// ============ API KEY MANAGEMENT ============

// Get all API keys (all users)
export const getAllApiKeys = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status = '' } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params = [limit, offset];

  if (status) {
    whereClause = 'WHERE ak.is_active = $3';
    params.push(status === 'active');
  }

  const result = await query(`
    SELECT 
      ak.*,
      u.email as user_email,
      u.first_name,
      u.last_name,
      COUNT(al.id) as total_uses
    FROM api_keys ak
    JOIN users u ON ak.user_id = u.id
    LEFT JOIN activity_logs al ON ak.id::text = al.details->>'apiKeyId'
    ${whereClause}
    GROUP BY ak.id, u.email, u.first_name, u.last_name
    ORDER BY ak.created_at DESC
    LIMIT $1 OFFSET $2
  `, params);

  const countResult = await query(`SELECT COUNT(*) FROM api_keys ${whereClause}`, status ? [params[2]] : []);

  successResponse(res, {
    apiKeys: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(countResult.rows[0].count / limit)
    }
  });
});

// Revoke API key (admin)
export const revokeApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;

  const result = await query(
    'UPDATE api_keys SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
    [keyId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'API key not found', 404);
  }

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) 
     VALUES ($1, $2, $3, $4, $5)`,
    [req.user.id, 'apikey_revoked', 'api_keys', keyId, JSON.stringify({ admin: true })]
  );

  successResponse(res, result.rows[0], 'API key revoked successfully');
});

// ============ FILE MANAGEMENT ============

// Get all files (all users)
export const getAllFiles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search = '' } = req.query;
  const offset = (page - 1) * limit;

  let whereConditions = ['f.deleted_at IS NULL'];
  let params = [limit, offset];
  let paramCounter = 3;

  if (search) {
    whereConditions.push(`f.name ILIKE $${paramCounter}`);
    params.push(`%${search}%`);
    paramCounter++;
  }

  const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

  const result = await query(`
    SELECT 
      f.*,
      u.email as user_email,
      u.first_name,
      u.last_name,
      b.name as bucket_name,
      b.visibility as bucket_visibility
    FROM files f
    JOIN users u ON f.user_id = u.id
    JOIN buckets b ON f.bucket_id = b.id
    ${whereClause}
    ORDER BY f.created_at DESC
    LIMIT $1 OFFSET $2
  `, params);

  const countResult = await query(`SELECT COUNT(*) FROM files f ${whereClause}`, params.slice(2));

  successResponse(res, {
    files: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(countResult.rows[0].count / limit)
    }
  });
});

// Delete file (admin)
export const deleteFileAdmin = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const result = await query(
    'UPDATE files SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING *',
    [fileId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'File not found', 404);
  }

  // Log activity
  await query(
    `INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) 
     VALUES ($1, $2, $3, $4, $5)`,
    [req.user.id, 'file_deleted', 'files', fileId, JSON.stringify({ admin: true, fileId })]
  );

  successResponse(res, null, 'File deleted successfully');
});
