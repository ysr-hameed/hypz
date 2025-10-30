import AWS from 'aws-sdk';
import { config } from '../config/env.js';
import logger from './logger.js';

// Configure AWS SDK for Backblaze B2
const s3 = new AWS.S3({
  endpoint: config.b2.endpoint,
  accessKeyId: config.b2.keyId,
  secretAccessKey: config.b2.applicationKey,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: config.b2.region,
});

export const uploadFile = async (fileBuffer, key, contentType, metadata = {}) => {
  try {
    const params = {
      Bucket: config.b2.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: metadata,
    };

    const result = await s3.upload(params).promise();
    logger.info('File uploaded to B2', { key, size: fileBuffer.length });
    return result;
  } catch (error) {
    logger.error('Error uploading file to B2', { key, error: error.message });
    throw new Error('Failed to upload file to storage');
  }
};

export const downloadFile = async (key) => {
  try {
    const params = {
      Bucket: config.b2.bucketName,
      Key: key,
    };

    const result = await s3.getObject(params).promise();
    logger.info('File downloaded from B2', { key });
    return result;
  } catch (error) {
    logger.error('Error downloading file from B2', { key, error: error.message });
    throw new Error('Failed to download file from storage');
  }
};

export const deleteFile = async (key) => {
  try {
    const params = {
      Bucket: config.b2.bucketName,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    logger.info('File deleted from B2', { key });
    return true;
  } catch (error) {
    logger.error('Error deleting file from B2', { key, error: error.message });
    throw new Error('Failed to delete file from storage');
  }
};

export const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: config.b2.bucketName,
      Key: key,
      Expires: expiresIn, // seconds
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    logger.info('Generated signed URL', { key, expiresIn });
    return url;
  } catch (error) {
    logger.error('Error generating signed URL', { key, error: error.message });
    throw new Error('Failed to generate download URL');
  }
};

export const listFiles = async (prefix = '', maxKeys = 1000) => {
  try {
    const params = {
      Bucket: config.b2.bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
    };

    const result = await s3.listObjectsV2(params).promise();
    return result.Contents || [];
  } catch (error) {
    logger.error('Error listing files from B2', { prefix, error: error.message });
    throw new Error('Failed to list files from storage');
  }
};

export const getFileMetadata = async (key) => {
  try {
    const params = {
      Bucket: config.b2.bucketName,
      Key: key,
    };

    const result = await s3.headObject(params).promise();
    return {
      size: result.ContentLength,
      contentType: result.ContentType,
      lastModified: result.LastModified,
      metadata: result.Metadata,
    };
  } catch (error) {
    logger.error('Error getting file metadata from B2', { key, error: error.message });
    throw new Error('Failed to get file metadata');
  }
};

export default {
  uploadFile,
  downloadFile,
  deleteFile,
  getSignedUrl,
  listFiles,
  getFileMetadata,
};
