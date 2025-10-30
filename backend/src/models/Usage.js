import { query } from '../utils/db.js';

export const Usage = {
  async findByUser(userId) {
    const result = await query(
      `SELECT * FROM usage WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0];
  },

  async updateStorage(userId, bytes) {
    const result = await query(
      `UPDATE usage 
       SET storage_used = storage_used + $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [bytes, userId]
    );
    return result.rows[0];
  },

  async updateBandwidth(userId, bytes) {
    const result = await query(
      `UPDATE usage 
       SET bandwidth_used = bandwidth_used + $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [bytes, userId]
    );
    return result.rows[0];
  },

  async incrementApiCalls(userId) {
    const result = await query(
      `UPDATE usage 
       SET api_calls = api_calls + 1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [userId]
    );
    return result.rows[0];
  },

  async resetMonthlyUsage(userId) {
    const result = await query(
      `INSERT INTO usage (user_id, storage_used, bandwidth_used, api_calls, period_start)
       VALUES ($1, 0, 0, 0, CURRENT_TIMESTAMP)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [userId]
    );
    
    // Archive old usage
    await query(
      `UPDATE usage 
       SET period_end = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND period_end IS NULL AND id != $2`,
      [userId, result.rows[0]?.id]
    );

    return result.rows[0];
  },

  async getHistory(userId, limit = 12) {
    const result = await query(
      `SELECT * FROM usage 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },
};

export default Usage;
