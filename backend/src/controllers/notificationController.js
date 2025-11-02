import { query } from '../config/database.js';

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    let queryText = `
      SELECT * FROM notifications
      WHERE (user_id = $1 OR is_global = TRUE)
      ${unreadOnly === 'true' ? 'AND is_read = FALSE' : ''}
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(queryText, [userId, limit, offset]);

    // Get unread count
    const countResult = await query(
      `SELECT COUNT(*) as unread_count 
       FROM notifications 
       WHERE (user_id = $1 OR is_global = TRUE) 
       AND is_read = FALSE
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        unreadCount: parseInt(countResult.rows[0].unread_count),
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const result = await query(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = NOW()
       WHERE id = $1 AND (user_id = $2 OR is_global = TRUE)
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await query(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = NOW()
       WHERE (user_id = $1 OR is_global = TRUE) AND is_read = FALSE`,
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const result = await query(
      `DELETE FROM notifications 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found or cannot be deleted' });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Create notification (send to specific user or all users)
export const createNotification = async (req, res) => {
  try {
    const {
      userId, // null for global notifications
      type,
      title,
      message,
      link,
      icon,
      priority = 'normal',
      isGlobal = false,
      expiresIn, // days
      metadata
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
    }

    // If global, create one notification; if specific user, create for that user
    if (isGlobal) {
      const result = await query(
        `INSERT INTO notifications (type, title, message, link, icon, priority, is_global, expires_at, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [type, title, message, link, icon, priority, true, expiresAt, JSON.stringify(metadata || {})]
      );

      // Log activity
      await query(
        `INSERT INTO activity_logs (user_id, action, details) 
         VALUES ($1, $2, $3)`,
        [req.user.id, 'notification_created', JSON.stringify({ type: 'global', notificationId: result.rows[0].id })]
      );

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Global notification created successfully'
      });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required for non-global notifications' });
    }

    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, link, icon, priority, is_global, expires_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, type, title, message, link, icon, priority, false, expiresAt, JSON.stringify(metadata || {})]
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, details) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'notification_created', JSON.stringify({ type: 'user', targetUserId: userId, notificationId: result.rows[0].id })]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Send notification to multiple users
export const sendBulkNotification = async (req, res) => {
  try {
    const {
      userIds, // array of user IDs
      type,
      title,
      message,
      link,
      icon,
      priority = 'normal',
      expiresIn,
      metadata
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
    }

    // Create notifications for each user
    const notifications = [];
    for (const userId of userIds) {
      const result = await query(
        `INSERT INTO notifications (user_id, type, title, message, link, icon, priority, expires_at, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [userId, type, title, message, link, icon, priority, expiresAt, JSON.stringify(metadata || {})]
      );
      notifications.push(result.rows[0]);
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, details) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'bulk_notification_created', JSON.stringify({ count: userIds.length, userIds })]
    );

    res.json({
      success: true,
      data: {
        notifications,
        count: notifications.length
      },
      message: `Notifications sent to ${notifications.length} users`
    });
  } catch (error) {
    console.error('Send bulk notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all notifications (for management)
export const getAllNotifications = async (req, res) => {
  try {
    const { limit = 100, offset = 0, type, isGlobal } = req.query;

    let queryText = `
      SELECT n.*, u.email as user_email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (type) {
      queryText += ` AND n.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (isGlobal !== undefined) {
      queryText += ` AND n.is_global = $${paramCount}`;
      params.push(isGlobal === 'true');
      paramCount++;
    }

    queryText += ` ORDER BY n.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Delete notification (by admin)
export const deleteNotificationAdmin = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await query(
      `DELETE FROM notifications WHERE id = $1 RETURNING *`,
      [notificationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, details) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'notification_deleted', JSON.stringify({ notificationId })]
    );

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_read = FALSE) as unread,
        COUNT(*) FILTER (WHERE is_global = TRUE) as global_notifications,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d
      FROM notifications
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
