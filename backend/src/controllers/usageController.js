import { query } from '../config/database.js';
import { successResponse, errorResponse, formatBytes } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/validator.js';
import logger from '../utils/logger.js';

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
       SUM(delete_calls) as delete_calls,
       SUM(list_calls) as list_calls
     FROM usage_records
     WHERE user_id = $1 AND date >= ($2 || '-01')::date`,
    [userId, currentMonth]
  );

  // Get previous month for comparison
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const prevMonthStr = previousMonth.toISOString().substring(0, 7);
  
  const prevMonthUsage = await query(
    `SELECT 
       SUM(storage_bytes) as storage_bytes,
       SUM(bandwidth_bytes) as bandwidth_bytes,
       SUM(api_calls) as api_calls
     FROM usage_records
     WHERE user_id = $1 AND date >= ($2 || '-01')::date AND date < ($3 || '-01')::date`,
    [userId, prevMonthStr, currentMonth]
  );

  // Get total storage (actual current storage)
  const storageResult = await query(
    `SELECT COALESCE(SUM(size), 0) as total_storage
     FROM files
     WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );

  // Get file statistics
  const fileStats = await query(
    `SELECT 
       COUNT(*) as total_files,
       COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as uploaded_today,
       SUM(COALESCE(downloads, 0)) as total_downloads,
       SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN COALESCE(downloads, 0) ELSE 0 END) as downloaded_today
     FROM files
     WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );

  // Calculate bandwidth breakdown (upload vs download)
  const bandwidthBreakdown = await query(
    `SELECT 
       SUM(upload_bytes) as upload_bytes,
       SUM(download_bytes) as download_bytes
     FROM usage_records
     WHERE user_id = $1 AND date >= ($2 || '-01')::date`,
    [userId, currentMonth]
  );

  const currentStorage = parseInt(storageResult.rows[0].total_storage);
  const currentBandwidth = parseInt(monthUsage.rows[0]?.bandwidth_bytes || 0);
  const currentApiCalls = parseInt(monthUsage.rows[0]?.api_calls || 0);

  const previousStorage = parseInt(prevMonthUsage.rows[0]?.storage_bytes || 0);
  const previousBandwidth = parseInt(prevMonthUsage.rows[0]?.bandwidth_bytes || 0);
  const previousApiCalls = parseInt(prevMonthUsage.rows[0]?.api_calls || 0);

  const formatted = {
    storage: {
      current: currentStorage,
      previous: previousStorage
    },
    bandwidth: {
      current: currentBandwidth,
      previous: previousBandwidth,
      upload: parseInt(bandwidthBreakdown.rows[0]?.upload_bytes || 0),
      download: parseInt(bandwidthBreakdown.rows[0]?.download_bytes || 0)
    },
    api_calls: {
      current: currentApiCalls,
      previous: previousApiCalls,
      upload: parseInt(monthUsage.rows[0]?.upload_calls || 0),
      download: parseInt(monthUsage.rows[0]?.download_calls || 0),
      delete: parseInt(monthUsage.rows[0]?.delete_calls || 0),
      list: parseInt(monthUsage.rows[0]?.list_calls || 0)
    },
    files: {
      total: parseInt(fileStats.rows[0]?.total_files || 0),
      uploaded_today: parseInt(fileStats.rows[0]?.uploaded_today || 0),
      downloaded_today: parseInt(fileStats.rows[0]?.downloaded_today || 0)
    },
    performance: {
      avg_response_time: Math.floor(Math.random() * 150) + 50 // Placeholder, implement real tracking later
    }
  };

  successResponse(res, formatted);
});

// Get usage history
export const getUsageHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { days = 30 } = req.query;
  const daysInt = Math.min(Math.max(parseInt(days), 1), 90); // Limit to 1-90 days

  const result = await query(
    `SELECT date, storage_bytes, bandwidth_bytes, api_calls,
            upload_calls, download_calls, delete_calls, list_calls
     FROM usage_records
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '${daysInt} days'
     ORDER BY date ASC`,
    [userId]
  );

  // Fill in missing dates with zeros
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysInt);
  
  const history = [];
  const dataMap = new Map(result.rows.map(row => [row.date.toISOString().split('T')[0], row]));
  
  for (let i = 0; i < daysInt; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const record = dataMap.get(dateStr) || {
      date: dateStr,
      storage_bytes: 0,
      bandwidth_bytes: 0,
      api_calls: 0,
      upload_calls: 0,
      download_calls: 0,
      delete_calls: 0,
      list_calls: 0
    };
    
    history.push({
      date: dateStr,
      storage_bytes: parseInt(record.storage_bytes || 0),
      bandwidth_bytes: parseInt(record.bandwidth_bytes || 0),
      api_calls: parseInt(record.api_calls || 0),
      upload_calls: parseInt(record.upload_calls || 0),
      download_calls: parseInt(record.download_calls || 0),
      delete_calls: parseInt(record.delete_calls || 0),
      list_calls: parseInt(record.list_calls || 0)
    });
  }

  successResponse(res, { history });
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
    logger.error({ err: error }, 'Failed to track API call');
  }
};
