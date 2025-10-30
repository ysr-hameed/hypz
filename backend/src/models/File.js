import { query } from '../utils/db.js';

export const File = {
  async create(userId, filename, originalName, fileSize, mimeType, fileKey, isPublic = false, expiresAt = null, metadata = {}) {
    const result = await query(
      `INSERT INTO files (user_id, filename, original_name, file_size, mime_type, file_key, is_public, expires_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, filename, originalName, fileSize, mimeType, fileKey, isPublic, expiresAt, JSON.stringify(metadata)]
    );
    return result.rows[0];
  },

  async findById(fileId) {
    const result = await query(
      `SELECT * FROM files WHERE id = $1`,
      [fileId]
    );
    return result.rows[0];
  },

  async findByUser(userId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT * FROM files 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  async findByUserAndId(userId, fileId) {
    const result = await query(
      `SELECT * FROM files WHERE id = $1 AND user_id = $2`,
      [fileId, userId]
    );
    return result.rows[0];
  },

  async incrementDownloadCount(fileId) {
    await query(
      `UPDATE files SET download_count = download_count + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [fileId]
    );
  },

  async delete(fileId) {
    const result = await query(
      `DELETE FROM files WHERE id = $1 RETURNING *`,
      [fileId]
    );
    return result.rows[0];
  },

  async deleteExpired() {
    const result = await query(
      `DELETE FROM files 
       WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP
       RETURNING *`
    );
    return result.rows;
  },

  async getUserTotalStorage(userId) {
    const result = await query(
      `SELECT COALESCE(SUM(file_size), 0) as total_storage FROM files WHERE user_id = $1`,
      [userId]
    );
    return parseInt(result.rows[0].total_storage);
  },

  async getStats(userId) {
    const result = await query(
      `SELECT 
         COUNT(*) as total_files,
         COALESCE(SUM(file_size), 0) as total_size,
         COALESCE(SUM(download_count), 0) as total_downloads
       FROM files 
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  },
};

export default File;
