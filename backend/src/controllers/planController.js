import { query } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';

// Get all plans
export const getPlans = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT * FROM plans ORDER BY price_usd ASC`
  );

  successResponse(res, result.rows);
});

// Get single plan
export const getPlan = asyncHandler(async (req, res) => {
  const { planId } = req.params;

  const result = await query(
    'SELECT * FROM plans WHERE id = $1',
    [planId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 'Plan not found', 404);
  }

  successResponse(res, result.rows[0]);
});

// Get user's current plan
export const getUserPlan = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // First, check if user has a plan assigned - include subscription status
  let result = await query(
    `SELECT u.plan_id, u.plan_start_date, u.subscription_status, u.services_active, u.auto_renew, p.* 
     FROM users u
     LEFT JOIN plans p ON u.plan_id = p.id
     WHERE u.id = $1`,
    [userId]
  );

  // If user doesn't have a plan, assign free plan
  if (result.rows.length === 0 || !result.rows[0].plan_id) {
    // Get free plan
    const freePlanResult = await query(
      `SELECT * FROM plans WHERE type = 'free' OR id = 'free_forever' LIMIT 1`
    );

    if (freePlanResult.rows.length > 0) {
      const freePlan = freePlanResult.rows[0];
      
      // Assign free plan to user
      await query(
        `UPDATE users 
         SET plan_id = $1, plan_start_date = CURRENT_TIMESTAMP, subscription_status = 'active', services_active = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [freePlan.id, userId]
      );

      // Re-fetch user plan
      result = await query(
        `SELECT u.plan_id, u.plan_start_date, u.subscription_status, u.services_active, u.auto_renew, p.* 
         FROM users u
         JOIN plans p ON u.plan_id = p.id
         WHERE u.id = $1`,
        [userId]
      );
    } else {
      return errorResponse(res, 'No plans available', 500);
    }
  }

  // Get current usage
  const usageResult = await query(
    `SELECT 
       COALESCE(SUM(storage_bytes), 0) as storage_used,
       COALESCE(SUM(bandwidth_bytes), 0) as bandwidth_used,
       COALESCE(SUM(api_calls), 0) as api_calls_used
     FROM usage_records
     WHERE user_id = $1 
     AND date >= date_trunc('month', CURRENT_DATE)`,
    [userId]
  );

  // Get actual storage
  const storageResult = await query(
    `SELECT COALESCE(SUM(size), 0) as total_storage
     FROM files
     WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );

  const planData = result.rows[0];
  const usage = usageResult.rows[0];
  const actualStorage = parseInt(storageResult.rows[0].total_storage);

  successResponse(res, {
    plan: {
      ...planData,
      subscription_status: planData.subscription_status || 'active',
      services_active: planData.services_active !== false,
      auto_renew: planData.auto_renew !== false
    },
    usage: {
      storage: actualStorage,
      bandwidth: parseInt(usage.bandwidth_used),
      apiCalls: parseInt(usage.api_calls_used),
      storagePercent: planData.storage_gb > 0 ? (actualStorage / (planData.storage_gb * 1024 * 1024 * 1024)) * 100 : 0,
      bandwidthPercent: planData.bandwidth_gb > 0 ? (parseInt(usage.bandwidth_used) / (planData.bandwidth_gb * 1024 * 1024 * 1024)) * 100 : 0,
      apiCallsPercent: planData.api_calls > 0 ? (parseInt(usage.api_calls_used) / planData.api_calls) * 100 : 0
    }
  });
});

// Update user plan
export const updateUserPlan = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { planId } = req.body;

  // Verify plan exists
  const planResult = await query(
    'SELECT * FROM plans WHERE id = $1',
    [planId]
  );

  if (planResult.rows.length === 0) {
    return errorResponse(res, 'Plan not found', 404);
  }

  // Update user's plan
  await query(
    `UPDATE users 
     SET plan_id = $1, plan_start_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [planId, userId]
  );

  // Log activity
  await query(
    'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
    [userId, 'plan_updated', { planId }]
  );

  successResponse(res, { planId }, 'Plan updated successfully');
});

export default {
  getPlans,
  getPlan,
  getUserPlan,
  updateUserPlan
};
