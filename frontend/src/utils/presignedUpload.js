import { fileAPI } from '../services/api';
import axios from 'axios';

/**
 * Upload file directly to B2 using presigned URL
 * @param {File} file - The file to upload
 * @param {string} bucketId - The bucket ID
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} - Upload result
 */
export const uploadFilePresigned = async (file, bucketId, onProgress = null) => {
  try {
    // Step 1: Initiate presigned upload - get upload URL from backend
    if (onProgress) onProgress(5);
    
    const initiateData = await fileAPI.initiatePresignedUpload(bucketId, {
      filename: file.name,
      mimeType: file.type,
      size: file.size
    });

    const {
      fileId,
      uploadUrl,
      uploadAuthToken,
      fileName,
      mimeType,
      bucketName,
      downloadUrl: bucketDownloadUrl
    } = initiateData;

    if (onProgress) onProgress(10);

    // Step 2: Upload file directly to B2 (B2 will verify checksum server-side)
    const uploadResponse = await axios.post(uploadUrl, file, {
      headers: {
        'Authorization': uploadAuthToken,
        'X-Bz-File-Name': fileName,
        'Content-Type': mimeType || 'application/octet-stream',
        'X-Bz-Content-Sha1': 'do_not_verify'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent && onProgress) {
          const total = progressEvent.total || file.size || 1;
          const uploadPercent = Math.min((progressEvent.loaded / total) * 100, 100);
          onProgress(10 + (uploadPercent * 0.8));
        }
      }
    });

    const sha1Hash = uploadResponse.data?.contentSha1 || null;
    const b2FileId = uploadResponse.data.fileId;
    const baseDownloadUrl = bucketDownloadUrl || 'https://f000.backblazeb2.com';
    const targetBucket = bucketName || uploadResponse.data.bucketName;
    const b2Url = uploadResponse.data.downloadUrl || 
      `${baseDownloadUrl}/file/${targetBucket}/${fileName}`;

    if (onProgress) onProgress(95);

    // Step 4: Complete upload - notify backend
    const completeData = await fileAPI.completePresignedUpload(fileId, {
      b2FileId,
      sha1: sha1Hash,
      url: b2Url
    });

    if (onProgress) onProgress(100);

    return completeData;
  } catch (error) {
    console.error('Presigned upload error:', error);
    throw error;
  }
};

/**
 * Check if presigned uploads should be used (B2 is available)
 * Can be enhanced to check config or feature flags
 */
export const shouldUsePresignedUpload = () => {
  // For now, always use presigned if available
  // Could check localStorage setting or backend config
  return true;
};
