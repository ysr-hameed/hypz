import { File } from '../models/File.js';
import { Usage } from '../models/Usage.js';
import { deleteFile } from '../utils/backblaze.js';
import logger from '../utils/logger.js';

export const fileCleanup = async () => {
  try {
    logger.info('Starting file cleanup job...');

    // Delete expired files
    const expiredFiles = await File.deleteExpired();

    let deletedCount = 0;
    let freedSpace = 0;

    for (const file of expiredFiles) {
      try {
        // Delete from Backblaze
        await deleteFile(file.file_key);

        // Update user storage
        await Usage.updateStorage(file.user_id, -file.file_size);

        deletedCount++;
        freedSpace += file.file_size;

        logger.info(`Deleted expired file: ${file.id}`);
      } catch (error) {
        logger.error(`Error deleting expired file ${file.id}`, error);
      }
    }

    logger.info(`File cleanup completed. Deleted ${deletedCount} files, freed ${(freedSpace / (1024 * 1024)).toFixed(2)}MB`);
  } catch (error) {
    logger.error('Error in file cleanup job', error);
  }
};

export default fileCleanup;
