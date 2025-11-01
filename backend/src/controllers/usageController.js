import { query } from '../config/database.js';
import { successResponse, errorResponse, formatBytes } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';

// Get current usage
export const getCurrentUsage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  // Get today's usage
  const todayUsage = await query(
    `SELECT * FROM usage_records 
     WHERE user_id = $1 AND date = $2`,
    [userId, today]
  );

  // Get current month's usage
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const monthUsage = await query(
    `SELECT 
       SUM(storage_bytes) as storage_bytes,
       SUM(bandwidth_bytes) as bandwidth_bytes,
       SUM(api_calls) as api_calls,
       SUM(upload_calls) as upload_calls,
       SUM(download_calls) as download_calls,
       SUM(delete_calls) as delete_calls
     FROM usage_records
     WHERE user_id = $1 AND date >= $2 || '-01'`,
    [userId, currentMonth]
  );

  // Get total storage (actual current storage)
  const storageResult = await query(
    `SELECT COALESCE(SUM(size), 0) as total_storage
     FROM files
     WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );

  const usage = {
    today: todayUsage.rows[0] || {
      storage_bytes: 0,
      bandwidth_bytes: 0,
      api_calls: 0,
      upload_calls: 0,
      download_calls: 0,
      delete_calls: 0
    },
    month: monthUsage.rows[0] || {
      storage_bytes: 0,
      bandwidth_bytes: 0,
      api_calls: 0,
      upload_calls: 0,
      download_calls: 0,
      delete_calls: 0
    },
    currentStorage: parseInt(storageResult.rows[0].total_storage)
  };

  // Format for display
  const formatted = {
    today: {
      ...usage.today,
      storage: formatBytes(usage.today.storage_bytes),
      bandwidth: formatBytes(usage.today.bandwidth_bytes)
    },
    month: {
      ...usage.month,
      storage: formatBytes(usage.currentStorage), // Use actual storage
      bandwidth: formatBytes(usage.month.bandwidth_bytes)
    }
  };

  successResponse(res, formatted);
});

// Get usage history
export const getUsageHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { days = 30 } = req.query;

  const result = await query(
    `SELECT date, storage_bytes, bandwidth_bytes, api_calls,
            upload_calls, download_calls, delete_calls
     FROM usage_records
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
     ORDER BY date DESC`,
    [userId]
  );

  const history = result.rows.map(record => ({
    ...record,
    storage: formatBytes(record.storage_bytes),
    bandwidth: formatBytes(record.bandwidth_bytes)
  }));

  successResponse(res, history);
});

// Get usage analytics
export const getUsageAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get summary statistics
  const summary = await query(
    `SELECT 
       COUNT(DISTINCT date) as active_days,
       SUM(bandwidth_bytes) as total_bandwidth,
       SUM(api_calls) as total_api_calls,
       AVG(bandwidth_bytes) as avg_daily_bandwidth,
       MAX(bandwidth_bytes) as peak_bandwidth
     FROM usage_records
     WHERE user_id = $1`,
    [userId]
  );

  // Get bucket usage breakdown
  const bucketUsage = await query(
    `SELECT 
       b.id, b.name,
       COUNT(f.id) as file_count,
       COALESCE(SUM(f.size), 0) as total_size,
       COALESCE(SUM(f.downloads), 0) as total_downloads
     FROM buckets b
     LEFT JOIN files f ON b.id = f.bucket_id AND f.deleted_at IS NULL
     WHERE b.user_id = $1
     GROUP BY b.id, b.name
     ORDER BY total_size DESC`,
    [userId]
  );

  // Get file type distribution
  const fileTypes = await query(
    `SELECT 
       mime_type,
       COUNT(*) as count,
       SUM(size) as total_size
     FROM files
     WHERE user_id = $1 AND deleted_at IS NULL
     GROUP BY mime_type
     ORDER BY count DESC
     LIMIT 10`,
    [userId]
  );

  // Format data
  const analytics = {
    summary: {
      ...summary.rows[0],
      totalBandwidth: formatBytes(summary.rows[0].total_bandwidth || 0),
      avgDailyBandwidth: formatBytes(summary.rows[0].avg_daily_bandwidth || 0),
      peakBandwidth: formatBytes(summary.rows[0].peak_bandwidth || 0)
    },
    bucketUsage: bucketUsage.rows.map(bucket => ({
      ...bucket,
      formattedSize: formatBytes(bucket.total_size)
    })),
    fileTypes: fileTypes.rows.map(type => ({
      ...type,
      formattedSize: formatBytes(type.total_size)
    }))
  };

  successResponse(res, analytics);
});

// Track API call (middleware helper)
export const trackApiCall = async (userId) => {
  try {
    await query(
      `INSERT INTO usage_records (user_id, date, api_calls)
       VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (user_id, date)
       DO UPDATE SET 
         api_calls = usage_records.api_calls + 1,
         updated_at = CURRENT_TIMESTAMP`,
      [userId]
    );
  } catch (error) {
    console.error('Failed to track API call:', error);
  }
};
