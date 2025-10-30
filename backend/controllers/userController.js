import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

// Update profile
export const updateProfile = async (request, reply) => {
  const { name, currentPassword, newPassword } = request.body;
  const userId = request.user.userId;

  try {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (newPassword && currentPassword) {
      // Verify current password
      const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user.password) {
        return reply.status(400).send({
          success: false,
          message: 'Cannot set password for OAuth accounts'
        });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return reply.status(401).send({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return reply.status(400).send({
        success: false,
        message: 'No updates provided'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    reply.send({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Setup 2FA
export const setup2FA = async (request, reply) => {
  const userId = request.user.userId;

  try {
    const result = await pool.query(
      'SELECT email, two_factor_enabled FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    if (user.two_factor_enabled) {
      return reply.status(400).send({
        success: false,
        message: '2FA is already enabled'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Hypz (${user.email})`,
      length: 32
    });

    // Store secret temporarily (will be confirmed later)
    await pool.query(
      'UPDATE users SET two_factor_secret = $1 WHERE id = $2',
      [secret.base32, userId]
    );

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    reply.send({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to setup 2FA'
    });
  }
};

// Verify and enable 2FA
export const enable2FA = async (request, reply) => {
  const { code } = request.body;
  const userId = request.user.userId;

  try {
    const result = await pool.query(
      'SELECT two_factor_secret, two_factor_enabled FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    if (user.two_factor_enabled) {
      return reply.status(400).send({
        success: false,
        message: '2FA is already enabled'
      });
    }

    if (!user.two_factor_secret) {
      return reply.status(400).send({
        success: false,
        message: 'Please setup 2FA first'
      });
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return reply.status(401).send({
        success: false,
        message: 'Invalid code'
      });
    }

    // Enable 2FA
    await pool.query(
      'UPDATE users SET two_factor_enabled = true WHERE id = $1',
      [userId]
    );

    reply.send({
      success: true,
      message: '2FA enabled successfully'
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to enable 2FA'
    });
  }
};

// Disable 2FA
export const disable2FA = async (request, reply) => {
  const { code } = request.body;
  const userId = request.user.userId;

  try {
    const result = await pool.query(
      'SELECT two_factor_secret, two_factor_enabled FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    if (!user.two_factor_enabled) {
      return reply.status(400).send({
        success: false,
        message: '2FA is not enabled'
      });
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return reply.status(401).send({
        success: false,
        message: 'Invalid code'
      });
    }

    // Disable 2FA
    await pool.query(
      'UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE id = $1',
      [userId]
    );

    reply.send({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to disable 2FA'
    });
  }
};

// Get user sessions
export const getSessions = async (request, reply) => {
  const userId = request.user.userId;

  try {
    const result = await pool.query(
      `SELECT id, ip_address, user_agent, created_at, expires_at 
       FROM sessions 
       WHERE user_id = $1 AND expires_at > NOW() 
       ORDER BY created_at DESC`,
      [userId]
    );

    reply.send({
      success: true,
      sessions: result.rows
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch sessions'
    });
  }
};

// Revoke session
export const revokeSession = async (request, reply) => {
  const { sessionId } = request.params;
  const userId = request.user.userId;

  try {
    await pool.query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    reply.send({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to revoke session'
    });
  }
};
