import B2 from 'backblaze-b2';
import axios from 'axios';
import config from '../config/config.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

let b2 = null;
let authorizationToken = null;
let apiUrl = null;
let downloadUrl = null;

// Initialize B2
const initializeB2 = async () => {
  if (!config.B2_APPLICATION_KEY_ID || !config.B2_APPLICATION_KEY) {
  logger.warn('⚠️  Backblaze B2 credentials not configured. Using local storage.');
    return null;
  }

  try {
    b2 = new B2({
      applicationKeyId: config.B2_APPLICATION_KEY_ID,
      applicationKey: config.B2_APPLICATION_KEY
    });

    const authResponse = await b2.authorize();
    authorizationToken = authResponse.data.authorizationToken;
    apiUrl = authResponse.data.apiUrl;
    downloadUrl = authResponse.data.downloadUrl;

  logger.info('✅ Backblaze B2 initialized successfully');
    return b2;
  } catch (error) {
  logger.error('❌ Failed to initialize Backblaze B2:', error.message);
    return null;
  }
};

// Upload file to B2 with progress tracking
export const uploadToB2 = async (fileBuffer, fileName, mimeType, isPublic = false, onProgress = null) => {
  try {
    if (!b2) {
      await initializeB2();
    }

    if (!b2) {
      throw new Error('Backblaze B2 not initialized');
    }

    // Select bucket based on visibility
    const bucketId = isPublic ? config.B2_PUBLIC_BUCKET_ID : config.B2_PRIVATE_BUCKET_ID;
    const bucketName = isPublic ? config.B2_PUBLIC_BUCKET_NAME : config.B2_PRIVATE_BUCKET_NAME;

    if (!bucketId || !bucketName) {
      throw new Error(`Backblaze B2 ${isPublic ? 'public' : 'private'} bucket not configured`);
    }

    // Report progress: Getting upload URL (10%)
    if (onProgress) onProgress(10);

    // Get upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: bucketId
    });

    const uploadUrl = uploadUrlResponse.data.uploadUrl;
    const uploadAuthToken = uploadUrlResponse.data.authorizationToken;

    // Report progress: Calculating hash (30%)
    if (onProgress) onProgress(30);

    // Generate SHA1 hash of file
    const hash = crypto.createHash('sha1').update(fileBuffer).digest('hex');

    // Report progress: Uploading to B2 (50%)
    if (onProgress) onProgress(50);

    // Upload file
    const uploadResponse = await b2.uploadFile({
      uploadUrl: uploadUrl,
      uploadAuthToken: uploadAuthToken,
      fileName: fileName,
      data: fileBuffer,
      hash: hash,
      info: {
        'Content-Type': mimeType
      }
    });

    // Report progress: Upload complete (90%)
    if (onProgress) onProgress(90);

    // Generate download URL
    const fileUrl = `${downloadUrl}/file/${bucketName}/${fileName}`;

    return {
      fileId: uploadResponse.data.fileId,
      fileName: uploadResponse.data.fileName,
      url: fileUrl,
      size: uploadResponse.data.contentLength,
      bucketId: bucketId,
      bucketName: bucketName
    };
  } catch (error) {
  logger.error('Error uploading to B2:', error);
    throw error;
  }
};

// Download file from B2
export const downloadFromB2 = async (fileName, bucketName) => {
  try {
    if (!b2) {
      await initializeB2();
    }

    if (!b2) {
      throw new Error('Backblaze B2 not initialized');
    }

    // Use provided bucket name or default to private bucket
    const targetBucket = bucketName || config.B2_PRIVATE_BUCKET_NAME;
  logger.info('B2 download request:', { bucketName: targetBucket, fileName });

    const response = await b2.downloadFileByName({
      bucketName: targetBucket,
      fileName: fileName
    });

    return response.data;
  } catch (error) {
  logger.error('Error downloading from B2:', error?.response?.data || error?.message || error);
    throw error;
  }
};


// Download by file ID (works reliably for private buckets)
export const downloadById = async (fileId) => {
  try {
    if (!b2) {
      await initializeB2();
    }
    if (!b2) {
      throw new Error('Backblaze B2 not initialized');
    }
  logger.info('B2 download by ID:', { fileId });
    const response = await b2.downloadFileById({ fileId });
    return response.data;
  } catch (error) {
  logger.error('Error downloading by ID from B2:', error?.response?.data || error?.message || error);
    throw error;
  }
};

// Stream using raw axios against b2_download_file_by_id (works with account auth)
export const streamById = async (fileId) => {
  try {
    if (!b2) {
      await initializeB2();
    }
    if (!b2 || !authorizationToken || !apiUrl) {
      throw new Error('Backblaze B2 not initialized');
    }
    const url = `${apiUrl}/b2api/v2/b2_download_file_by_id?fileId=${encodeURIComponent(fileId)}`;
  logger.info('B2 raw stream by ID:', { url });
    const resp = await axios.get(url, {
      responseType: 'stream',
      headers: { Authorization: authorizationToken }
    });
    return resp.data; // stream
  } catch (error) {
  logger.error('Error streaming by ID from B2:', error?.response?.status, error?.response?.data || error?.message || error);
    throw error;
  }
};

// Delete file from B2
export const deleteFromB2 = async (fileId, fileName) => {
  try {
    if (!b2) {
      await initializeB2();
    }

    if (!b2) {
      throw new Error('Backblaze B2 not initialized');
    }

    await b2.deleteFileVersion({
      fileId: fileId,
      fileName: fileName
    });

    return true;
  } catch (error) {
  logger.error('Error deleting from B2:', error);
    throw error;
  }
};

// Get file info from B2
export const getB2FileInfo = async (fileId) => {
  try {
    if (!b2) {
      await initializeB2();
    }

    if (!b2) {
      throw new Error('Backblaze B2 not initialized');
    }

    const response = await b2.getFileInfo({
      fileId: fileId
    });

    return response.data;
  } catch (error) {
  logger.error('Error getting file info from B2:', error);
    throw error;
  }
};

// Get presigned upload URL for direct client uploads
export const getPresignedUploadUrl = async (fileName, isPublic = false) => {
  try {
    if (!b2) {
      await initializeB2();
    }

    if (!b2) {
      throw new Error('Backblaze B2 not initialized');
    }

    // Select bucket based on visibility
    const bucketId = isPublic ? config.B2_PUBLIC_BUCKET_ID : config.B2_PRIVATE_BUCKET_ID;
    const bucketName = isPublic ? config.B2_PUBLIC_BUCKET_NAME : config.B2_PRIVATE_BUCKET_NAME;

    if (!bucketId || !bucketName) {
      throw new Error(`Backblaze B2 ${isPublic ? 'public' : 'private'} bucket not configured`);
    }

    // Get upload URL from B2
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: bucketId
    });

    const uploadUrl = uploadUrlResponse.data.uploadUrl;
    const uploadAuthToken = uploadUrlResponse.data.authorizationToken;

    logger.info('Generated presigned upload URL', { fileName, bucketName });

    return {
      uploadUrl,
      uploadAuthToken,
      bucketId,
      bucketName,
      fileName,
      downloadUrl
    };
  } catch (error) {
    logger.error('Error getting presigned upload URL:', error);
    throw error;
  }
};

// Check if B2 is available
export const isB2Available = () => {
  return !!(config.B2_APPLICATION_KEY_ID && config.B2_APPLICATION_KEY);
};

// Initialize on module load
initializeB2();

export default {
  uploadToB2,
  downloadFromB2,
  deleteFromB2,
  streamById,
  getB2FileInfo,
  getPresignedUploadUrl,
  isB2Available
};
