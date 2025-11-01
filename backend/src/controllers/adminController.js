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
