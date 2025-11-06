import { query, pool } from '../config/database.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import { asyncHandler } from '../middleware/validator.js';
import config from '../config/config.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

// Invite team member
export const inviteTeamMember = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { email, role = 'member', permissions } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const result = await client.query(
      `INSERT INTO team_members 
       (inviter_id, email, role, permissions, status, invite_token, invite_expires_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6)
       RETURNING *`,
      [userId, email, role, JSON.stringify(permissions || {}), inviteToken, expiresAt]
    );

    await client.query('COMMIT');

    const inviteUrl = `${config.FRONTEND_URL}/team/accept-invite/${inviteToken}`;
    await sendEmail(email, 'Team Invitation', `<p>Click to accept: <a href="${inviteUrl}">Accept</a></p>`);

  return successResponse(res, result.rows[0], 'Invitation sent', 201);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const getTeamMembers = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await query(
    `SELECT tm.*, u.email as member_email, u.first_name, u.last_name
     FROM team_members tm
     LEFT JOIN users u ON tm.user_id = u.id
     WHERE tm.inviter_id = $1 OR tm.user_id = $1
     ORDER BY tm.created_at DESC`,
    [userId]
  );
  return successResponse(res, result.rows);
});

export const acceptTeamInvite = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const userId = req.user.id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const invite = await client.query(
      'SELECT * FROM team_members WHERE invite_token = $1 AND status = \'pending\' AND invite_expires_at > NOW()',
      [token]
    );
    if (invite.rows.length === 0) {
      return errorResponse(res, 'Invalid invitation', 404);
    }
    await client.query(
      'UPDATE team_members SET user_id = $1, status = \'active\', accepted_at = NOW() WHERE id = $2',
      [userId, invite.rows[0].id]
    );
    await client.query('COMMIT');
  return successResponse(res, null, 'Invitation accepted');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const updateTeamMember = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { memberId } = req.params;
  const { role, permissions } = req.body;
  const result = await query(
    `UPDATE team_members SET role = COALESCE($1, role), permissions = COALESCE($2, permissions), updated_at = NOW()
     WHERE id = $3 AND inviter_id = $4 RETURNING *`,
    [role, JSON.stringify(permissions), memberId, userId]
  );
  if (result.rows.length === 0) {
    return errorResponse(res, 'Permission denied', 403);
  }
  return successResponse(res, result.rows[0]);
});

export const removeTeamMember = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { memberId } = req.params;
  const result = await query(
    'DELETE FROM team_members WHERE id = $1 AND (inviter_id = $2 OR user_id = $2)',
    [memberId, userId]
  );
  return successResponse(res, null, 'Member removed');
});

export const getPendingInvites = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await query(
    `SELECT tm.*, u.email as inviter_email, u.first_name, u.last_name
     FROM team_members tm
     JOIN users u ON tm.inviter_id = u.id
     WHERE tm.email = (SELECT email FROM users WHERE id = $1) AND tm.status = 'pending'
     ORDER BY tm.created_at DESC`,
    [userId]
  );
  return successResponse(res, result.rows);
});

export const resendInvite = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { memberId } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const member = await client.query(
      'SELECT * FROM team_members WHERE id = $1 AND inviter_id = $2',
      [memberId, userId]
    );
    if (member.rows.length === 0) {
      return errorResponse(res, 'Not found', 404);
    }
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await client.query(
      'UPDATE team_members SET invite_token = $1, invite_expires_at = $2 WHERE id = $3',
      [newToken, newExpiresAt, memberId]
    );
    await client.query('COMMIT');
    const inviteUrl = `${config.FRONTEND_URL}/team/accept-invite/${newToken}`;
    await sendEmail(member.rows[0].email, 'Team Invitation Reminder', `<p>Accept: <a href="${inviteUrl}">Click</a></p>`);
  return successResponse(res, null, 'Invitation resent');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});
