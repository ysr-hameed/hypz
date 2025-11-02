import B2 from 'backblaze-b2';
import config from '../config/config.js';
import crypto from 'crypto';

let b2 = null;
let authorizationToken = null;
let apiUrl = null;
let downloadUrl = null;

// Initialize B2
const initializeB2 = async () => {
  if (!config.B2_APPLICATION_KEY_ID || !config.B2_APPLICATION_KEY) {
    console.warn('⚠️  Backblaze B2 credentials not configured. Using local storage.');
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

    console.log('✅ Backblaze B2 initialized successfully');
    return b2;
  } catch (error) {
    console.error('❌ Failed to initialize Backblaze B2:', error.message);
    return null;
  }
};

// Upload file to B2
export const uploadToB2 = async (fileBuffer, fileName, mimeType, isPublic = false) => {
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

    // Get upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: bucketId
    });

    const uploadUrl = uploadUrlResponse.data.uploadUrl;
    const uploadAuthToken = uploadUrlResponse.data.authorizationToken;

    // Generate SHA1 hash of file
    const hash = crypto.createHash('sha1').update(fileBuffer).digest('hex');

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
    console.error('Error uploading to B2:', error);
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

    const response = await b2.downloadFileByName({
      bucketName: targetBucket,
      fileName: fileName
    });

    return response.data;
  } catch (error) {
    console.error('Error downloading from B2:', error);
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
    console.error('Error deleting from B2:', error);
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
    console.error('Error getting file info from B2:', error);
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
  getB2FileInfo,
  isB2Available
};
