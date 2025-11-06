import logger from '../utils/logger.js';
import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '../utils/helpers.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT 
        id, email, first_name, last_name, avatar_url, role,
        email_verified, two_factor_enabled, plan_id,
        created_at, last_login
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, result.rows[0]);
  } catch (error) {
    logger.error({ err: error }, 'Get profile error');
    return errorResponse(res, 'Server error', 500);
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, avatarUrl } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount}`);
      values.push(firstName);
      paramCount++;
    }

    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount}`);
      values.push(lastName);
      paramCount++;
    }

    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramCount}`);
      values.push(avatarUrl);
      paramCount++;
    }

    if (updates.length === 0) {
      return errorResponse(res, 'No fields to update', 400);
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, avatar_url, role, email_verified, two_factor_enabled
    `;

    const result = await query(updateQuery, values);

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, details) 
       VALUES ($1, $2, $3)`,
      [userId, 'profile_updated', JSON.stringify({ firstName, lastName })]
    );

    return successResponse(res, result.rows[0], 'Profile updated successfully');
  } catch (error) {
    logger.error({ err: error }, 'Update profile error');
    return errorResponse(res, 'Server error', 500);
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current and new password are required', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 'New password must be at least 8 characters long', 400);
    }

    // Get current password hash
    const userResult = await query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!isValidPassword) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await query(
      `UPDATE users 
       SET password = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, details, ip_address) 
       VALUES ($1, $2, $3, $4)`,
      [userId, 'password_changed', JSON.stringify({ timestamp: new Date() }), req.ip]
    );

    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    logger.error({ err: error }, 'Change password error');
    return errorResponse(res, 'Server error', 500);
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    let result = await query(
      `SELECT * FROM notification_preferences WHERE user_id = $1`,
      [userId]
    );

    // If no preferences exist, create defaults
    if (result.rows.length === 0) {
      await query(
        `INSERT INTO notification_preferences (user_id) VALUES ($1)`,
        [userId]
      );
      
      result = await query(
        `SELECT * FROM notification_preferences WHERE user_id = $1`,
        [userId]
      );
    }

    return successResponse(res, result.rows[0]);
  } catch (error) {
    logger.error({ err: error }, 'Get notification preferences error');
    return errorResponse(res, 'Server error', 500);
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      emailNotifications, 
      usageAlerts, 
      billingReminders, 
      securityUpdates,
      marketingEmails,
      productUpdates
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (emailNotifications !== undefined) {
      updates.push(`email_notifications = $${paramCount}`);
      values.push(emailNotifications);
      paramCount++;
    }

    if (usageAlerts !== undefined) {
      updates.push(`usage_alerts = $${paramCount}`);
      values.push(usageAlerts);
      paramCount++;
    }

    if (billingReminders !== undefined) {
      updates.push(`billing_reminders = $${paramCount}`);
      values.push(billingReminders);
      paramCount++;
    }

    if (securityUpdates !== undefined) {
      updates.push(`security_updates = $${paramCount}`);
      values.push(securityUpdates);
      paramCount++;
    }

    if (marketingEmails !== undefined) {
      updates.push(`marketing_emails = $${paramCount}`);
      values.push(marketingEmails);
      paramCount++;
    }

    if (productUpdates !== undefined) {
      updates.push(`product_updates = $${paramCount}`);
      values.push(productUpdates);
      paramCount++;
    }

    if (updates.length === 0) {
      return errorResponse(res, 'No preferences to update', 400);
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    // Check if preferences exist, if not create them
    const existingPref = await query(
      'SELECT id FROM notification_preferences WHERE user_id = $1',
      [userId]
    );

    if (existingPref.rows.length === 0) {
      // Create new preferences
      await query(
        `INSERT INTO notification_preferences (user_id) VALUES ($1)`,
        [userId]
      );
    }

    const updateQuery = `
      UPDATE notification_preferences 
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    // Log activity
    await query(
      `INSERT INTO activity_logs (user_id, action, details) 
       VALUES ($1, $2, $3)`,
      [userId, 'notification_preferences_updated', JSON.stringify(req.body)]
    );

    return successResponse(res, result.rows[0], 'Notification preferences updated successfully');
  } catch (error) {
    logger.error({ err: error }, 'Update notification preferences error');
    return errorResponse(res, 'Server error', 500);
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password, confirmation } = req.body;

    if (!password) {
      return errorResponse(res, 'Password is required', 400);
    }

    if (confirmation !== 'DELETE') {
      return errorResponse(res, 'Please type DELETE to confirm', 400);
    }

    // Verify password
    const userResult = await query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password);
    if (!isValidPassword) {
      return errorResponse(res, 'Incorrect password', 401);
    }

    // Log activity before deletion
    await query(
      `INSERT INTO activity_logs (user_id, action, details, ip_address) 
       VALUES ($1, $2, $3, $4)`,
      [userId, 'account_deleted', JSON.stringify({ timestamp: new Date() }), req.ip]
    );

    // Soft delete: deactivate account
    await query(
      `UPDATE users 
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [userId]
    );

    return successResponse(res, null, 'Account deleted successfully');
  } catch (error) {
    logger.error({ err: error }, 'Delete account error');
    return errorResponse(res, 'Server error', 500);
  }
};
