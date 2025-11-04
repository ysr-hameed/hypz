import { query, pool } from '../config/database.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import asyncHandler from 'express-async-handler';

// Invite team member
export const inviteTeamMember = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { email, role = 'member', permissions } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create team member record
    const result = await client.query(
      `INSERT INTO team_members 
       (inviter_id, email, role, permissions, status, invite_token, invite_expires_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6)
       RETURNING *`,
      [
        userId,
        email,
        role,
        JSON.stringify(permissions || {}),
        inviteToken,
        expiresAt
      ]
    );

    await client.query('COMMIT');

    // Send invite email
    const inviteUrl = `${process.env.FRONTEND_URL}/team/accept-invite/${inviteToken}`;
    await sendEmail(
      email,
      'You\'ve been invited to join a team on Hypz',
      `
        <h2>Team Invitation</h2>
        <p>You've been invited to join a team on Hypz with the role of <strong>${role}</strong>.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteUrl}" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        <p>This invitation will expire in 7 days.</p>
        <p>If you didn't expect this invitation, you can safely ignore this email.</p>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// Get team members
export const getTeamMembers = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT 
       tm.*,
       u.email as member_email,
       u.first_name,
       u.last_name,
       u.avatar_url,
       inviter.email as inviter_email
     FROM team_members tm
     LEFT JOIN users u ON tm.user_id = u.id
     LEFT JOIN users inviter ON tm.inviter_id = inviter.id
     WHERE tm.inviter_id = $1 OR tm.user_id = $1
     ORDER BY tm.created_at DESC`,
    [userId]
  );

  res.json({
    success: true,
    data: result.rows
  });
});

// Accept team invitation
export const acceptTeamInvite = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find invitation
    const invite = await client.query(
      `SELECT * FROM team_members 
       WHERE invite_token = $1 AND status = 'pending' AND invite_expires_at > NOW()`,
      [token]
    );

    if (invite.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }

    const invitation = invite.rows[0];

    // Update team member record
    await client.query(
      `UPDATE team_members 
       SET user_id = $1, status = 'active', accepted_at = NOW()
       WHERE id = $2`,
      [userId, invitation.id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Invitation accepted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// Update team member permissions
export const updateTeamMember = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { memberId } = req.params;
  const { role, permissions } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user is the inviter (owner)
    const member = await client.query(
      'SELECT * FROM team_members WHERE id = $1 AND inviter_id = $2',
      [memberId, userId]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this team member'
      });
    }

    // Update member
    const result = await client.query(
      `UPDATE team_members 
       SET role = COALESCE($1, role),
           permissions = COALESCE($2, permissions),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [role, JSON.stringify(permissions), memberId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// Remove team member
export const removeTeamMember = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { memberId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user is the inviter or the member themselves
    const member = await client.query(
      'SELECT * FROM team_members WHERE id = $1 AND (inviter_id = $2 OR user_id = $2)',
      [memberId, userId]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to remove this team member'
      });
    }

    // Delete member
    await client.query('DELETE FROM team_members WHERE id = $1', [memberId]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// Get pending invitations
export const getPendingInvites = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT tm.*, inviter.email as inviter_email, inviter.first_name, inviter.last_name
     FROM team_members tm
     JOIN users inviter ON tm.inviter_id = inviter.id
     WHERE tm.email = (SELECT email FROM users WHERE id = $1) 
     AND tm.status = 'pending'
     AND tm.invite_expires_at > NOW()
     ORDER BY tm.created_at DESC`,
    [userId]
  );

  res.json({
    success: true,
    data: result.rows
  });
});

// Resend invitation
export const resendInvite = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { memberId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user is the inviter
    const member = await client.query(
      'SELECT * FROM team_members WHERE id = $1 AND inviter_id = $2 AND status = \'pending\'',
      [memberId, userId]
    );

    if (member.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    const invitation = member.rows[0];

    // Generate new token and extend expiration
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await client.query(
      `UPDATE team_members 
       SET invite_token = $1, invite_expires_at = $2
       WHERE id = $3`,
      [newToken, newExpiresAt, memberId]
    );

    await client.query('COMMIT');

    // Resend email
    const inviteUrl = `${process.env.FRONTEND_URL}/team/accept-invite/${newToken}`;
    await sendEmail(
      invitation.email,
      'Reminder: Team Invitation on Hypz',
      `
        <h2>Team Invitation Reminder</h2>
        <p>This is a reminder that you've been invited to join a team on Hypz.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteUrl}" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        <p>This invitation will expire in 7 days.</p>
      `
    });

    res.json({
      success: true,
      message: 'Invitation resent successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});
