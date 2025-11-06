import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export const cleanupExpiredRefreshTokens = async () => {
  try {
    const res = await query(
      `DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = true RETURNING id, user_id, token`);

    logger.info({ deleted: res.rowCount }, 'Cleaned up expired/ revoked refresh tokens');
    return res.rowCount;
  } catch (error) {
    logger.error({ err: error }, 'Failed to cleanup expired refresh tokens');
    throw error;
  }
};

export default {
  cleanupExpiredRefreshTokens
};
