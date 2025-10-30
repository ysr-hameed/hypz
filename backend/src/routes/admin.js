import express from 'express';
import { query } from '../utils/db.js';
import { authenticate } from '../middlewares/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Admin middleware (simplified - you should implement proper admin checks)
const isAdmin = (req, res, next) => {
  // TODO: Implement proper admin role checking
  if (req.user && req.user.email === 'admin@hypz.io') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
};

// Get all users (admin only)
router.get('/users', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await query(
      `SELECT id, email, full_name, plan, is_active, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Admin get users error', error);
    next(error);
  }
});

// Get system stats (admin only)
router.get('/stats', authenticate, isAdmin, async (req, res, next) => {
  try {
    const userCountResult = await query('SELECT COUNT(*) as count FROM users');
    const fileCountResult = await query('SELECT COUNT(*) as count FROM files');
    const totalStorageResult = await query('SELECT COALESCE(SUM(file_size), 0) as total FROM files');
    const totalBandwidthResult = await query('SELECT COALESCE(SUM(bandwidth_used), 0) as total FROM usage');

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(userCountResult.rows[0].count),
        totalFiles: parseInt(fileCountResult.rows[0].count),
        totalStorage: parseInt(totalStorageResult.rows[0].total),
        totalBandwidth: parseInt(totalBandwidthResult.rows[0].total),
      },
    });
  } catch (error) {
    logger.error('Admin get stats error', error);
    next(error);
  }
});

// Update user status (admin only)
router.patch('/users/:userId/status', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const result = await query(
      `UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, email, is_active`,
      [isActive, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Admin update user status error', error);
    next(error);
  }
});

export default router;
