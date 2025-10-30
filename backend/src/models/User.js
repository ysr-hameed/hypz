import { query } from '../utils/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const User = {
  async create(email, password, fullName) {
    const passwordHash = await bcrypt.hash(password, 12);
    const apiKey = `hypz_${uuidv4().replace(/-/g, '')}`;

    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, api_key)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, plan, api_key, is_active, created_at`,
      [email, passwordHash, fullName, apiKey]
    );

    // Create initial usage record
    await query(
      `INSERT INTO usage (user_id, storage_used, bandwidth_used, api_calls)
       VALUES ($1, 0, 0, 0)`,
      [result.rows[0].id]
    );

    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      `SELECT id, email, full_name, plan, api_key, is_active, email_verified, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findByApiKey(apiKey) {
    const result = await query(
      `SELECT id, email, full_name, plan, api_key, is_active, created_at
       FROM users WHERE api_key = $1 AND is_active = true`,
      [apiKey]
    );
    return result.rows[0];
  },

  async updatePlan(userId, plan) {
    const result = await query(
      `UPDATE users SET plan = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, full_name, plan, api_key, created_at`,
      [plan, userId]
    );
    return result.rows[0];
  },

  async updatePassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, userId]
    );
  },

  async verifyPassword(plainPassword, passwordHash) {
    return await bcrypt.compare(plainPassword, passwordHash);
  },

  async regenerateApiKey(userId) {
    const apiKey = `hypz_${uuidv4().replace(/-/g, '')}`;
    const result = await query(
      `UPDATE users SET api_key = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING api_key`,
      [apiKey, userId]
    );
    return result.rows[0].api_key;
  },
};

export default User;
