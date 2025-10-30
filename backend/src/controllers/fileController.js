import { File } from '../models/File.js';
import { Usage } from '../models/Usage.js';
import { uploadFile, downloadFile, deleteFile as deleteB2File, getSignedUrl } from '../utils/backblaze.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

export const uploadFileHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const { isPublic = false, expiresIn, metadata = {} } = req.body;
    const user = req.user;

    // Generate unique file key
    const fileExtension = req.file.originalname.split('.').pop();
    const fileKey = `${user.id}/${uuidv4()}.${fileExtension}`;

    // Upload to Backblaze
    await uploadFile(
      req.file.buffer,
      fileKey,
      req.file.mimetype,
      { userId: user.id, ...metadata }
    );

    // Calculate expiration
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
    }

    // Save file metadata to database
    const file = await File.create(
      user.id,
      fileKey,
      req.file.originalname,
      req.file.size,
      req.file.mimetype,
      fileKey,
      isPublic === 'true' || isPublic === true,
      expiresAt,
      metadata
    );

    // Update storage usage
    await Usage.updateStorage(user.id, req.file.size);

    logger.info('File uploaded successfully', {
      userId: user.id,
      fileId: file.id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: file.id,
        filename: file.original_name,
        size: file.file_size,
        mimeType: file.mime_type,
        isPublic: file.is_public,
        expiresAt: file.expires_at,
        createdAt: file.created_at,
      },
    });
  } catch (error) {
    logger.error('File upload error', error);
    next(error);
  }
};

export const getFiles = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const files = await File.findByUser(req.user.id, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: files.map(file => ({
        id: file.id,
        filename: file.original_name,
        size: file.file_size,
        mimeType: file.mime_type,
        isPublic: file.is_public,
        downloadCount: file.download_count,
        expiresAt: file.expires_at,
        createdAt: file.created_at,
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get files error', error);
    next(error);
  }
};

export const getFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await File.findByUserAndId(req.user.id, fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: file.id,
        filename: file.original_name,
        size: file.file_size,
        mimeType: file.mime_type,
        isPublic: file.is_public,
        downloadCount: file.download_count,
        expiresAt: file.expires_at,
        metadata: file.metadata,
        createdAt: file.created_at,
      },
    });
  } catch (error) {
    logger.error('Get file error', error);
    next(error);
  }
};

export const downloadFileHandler = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Check if file is expired
    if (file.expires_at && new Date(file.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'File has expired',
      });
    }

    // Check access permissions
    if (!file.is_public && (!req.user || req.user.id !== file.user_id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Generate signed URL for download
    const downloadUrl = await getSignedUrl(file.file_key, 3600); // 1 hour expiry

    // Increment download count and update bandwidth
    await File.incrementDownloadCount(file.id);
    await Usage.updateBandwidth(file.user_id, file.file_size);

    logger.info('File download initiated', {
      fileId: file.id,
      userId: file.user_id,
    });

    res.json({
      success: true,
      data: {
        downloadUrl,
        filename: file.original_name,
        expiresIn: 3600, // seconds
      },
    });
  } catch (error) {
    logger.error('Download file error', error);
    next(error);
  }
};

export const deleteFileHandler = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await File.findByUserAndId(req.user.id, fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Delete from Backblaze
    await deleteB2File(file.file_key);

    // Delete from database
    await File.delete(file.id);

    // Update storage usage
    await Usage.updateStorage(req.user.id, -file.file_size);

    logger.info('File deleted successfully', {
      userId: req.user.id,
      fileId: file.id,
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    logger.error('Delete file error', error);
    next(error);
  }
};

export const getFileStats = async (req, res, next) => {
  try {
    const stats = await File.getStats(req.user.id);

    res.json({
      success: true,
      data: {
        totalFiles: parseInt(stats.total_files),
        totalSize: parseInt(stats.total_size),
        totalDownloads: parseInt(stats.total_downloads),
      },
    });
  } catch (error) {
    logger.error('Get file stats error', error);
    next(error);
  }
};

export default {
  uploadFileHandler,
  getFiles,
  getFile,
  downloadFileHandler,
  deleteFileHandler,
  getFileStats,
};
