import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import { errorResponse } from '../utils/helpers.js';

// Validation error handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    })));
  }
  
  next();
};

// Async handler to catch errors in async route handlers
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Sanitize filename - prevent directory traversal and special characters
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed-file';
  }
  
  // Remove directory paths
  filename = filename.replace(/^.*[\\\/]/, '');
  
  // Remove dangerous characters but keep dots, dashes, underscores
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
  
  // Remove leading dots (hidden files)
  filename = filename.replace(/^\.+/, '');
  
  // Limit length
  if (filename.length > 255) {
    const ext = filename.substring(filename.lastIndexOf('.'));
    filename = filename.substring(0, 250 - ext.length) + ext;
  }
  
  return filename || 'unnamed-file';
};

// Validate file upload data
export const validateFileUpload = (req, res, next) => {
  try {
    const { tags, metadata } = req.body;
    
    // Validate tags
    if (tags) {
      let parsedTags;
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        return errorResponse(res, 'Invalid tags format. Must be a valid JSON array.', 400);
      }
      
      if (!Array.isArray(parsedTags)) {
        return errorResponse(res, 'Tags must be an array', 400);
      }
      
      if (parsedTags.length > 50) {
        return errorResponse(res, 'Maximum 50 tags allowed', 400);
      }
      
      // Validate each tag
      for (const tag of parsedTags) {
        if (typeof tag !== 'string') {
          return errorResponse(res, 'All tags must be strings', 400);
        }
        if (tag.length > 50) {
          return errorResponse(res, 'Each tag must be 50 characters or less', 400);
        }
      }
      
      req.body.tags = parsedTags;
    }
    
    // Validate metadata
    if (metadata) {
      let parsedMetadata;
      try {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch (e) {
        return errorResponse(res, 'Invalid metadata format. Must be a valid JSON object.', 400);
      }
      
      if (typeof parsedMetadata !== 'object' || Array.isArray(parsedMetadata)) {
        return errorResponse(res, 'Metadata must be an object', 400);
      }
      
      // Check metadata size (limit to 10KB)
      const metadataSize = JSON.stringify(parsedMetadata).length;
      if (metadataSize > 10240) {
        return errorResponse(res, 'Metadata too large. Maximum size is 10KB.', 400);
      }
      
      // Validate metadata values (prevent XSS)
      const sanitizedMetadata = {};
      for (const [key, value] of Object.entries(parsedMetadata)) {
        if (key.length > 100) {
          return errorResponse(res, 'Metadata keys must be 100 characters or less', 400);
        }
        
        // Basic XSS prevention - reject HTML/script tags in values
        if (typeof value === 'string' && /<script|<iframe|javascript:|onerror=/i.test(value)) {
          return errorResponse(res, 'Metadata contains potentially dangerous content', 400);
        }
        
        sanitizedMetadata[key] = value;
      }
      
      req.body.metadata = sanitizedMetadata;
    }
    
    // Validate file if present
    if (req.file) {
      // Sanitize filename
      req.file.originalname = sanitizeFilename(req.file.originalname);
      
      // Check file size (this is a backup - multer should handle this)
      const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB absolute max
      if (req.file.size > MAX_FILE_SIZE) {
        return errorResponse(res, 'File too large. Maximum file size is 10GB.', 413);
      }
    }
    
    next();
  } catch (error) {
    logger.error({ err: error }, 'Validation error');
    return errorResponse(res, 'Invalid request data', 400);
  }
};

// Validate bucket name
export const validateBucketName = (req, res, next) => {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string') {
    return errorResponse(res, 'Bucket name is required', 400);
  }
  
  // Bucket name rules (similar to AWS S3)
  if (name.length < 3 || name.length > 63) {
    return errorResponse(res, 'Bucket name must be between 3 and 63 characters', 400);
  }
  
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name)) {
    return errorResponse(res, 'Bucket name must start and end with lowercase letter or number, and contain only lowercase letters, numbers, and hyphens', 400);
  }
  
  if (/--/.test(name)) {
    return errorResponse(res, 'Bucket name cannot contain consecutive hyphens', 400);
  }
  
  // Reserved names
  const reserved = ['admin', 'api', 'www', 'app', 'dashboard'];
  if (reserved.includes(name)) {
    return errorResponse(res, 'This bucket name is reserved', 400);
  }
  
  next();
};

// Validate pagination
export const validatePagination = (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return errorResponse(res, 'Page must be a positive integer', 400);
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return errorResponse(res, 'Limit must be between 1 and 100', 400);
  }
  
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
  
  next();
};

// Validate common list query params: limit, offset, status
export const validateListQuery = (req, res, next) => {
  const limit = req.query.limit !== undefined ? Number(req.query.limit) : 50;
  const offset = req.query.offset !== undefined ? Number(req.query.offset) : 0;
  const status = req.query.status !== undefined ? String(req.query.status) : null;

  if (Number.isNaN(limit) || !Number.isInteger(limit) || limit < 1 || limit > 1000) {
    return errorResponse(res, 'limit must be an integer between 1 and 1000', 400);
  }

  if (Number.isNaN(offset) || !Number.isInteger(offset) || offset < 0) {
    return errorResponse(res, 'offset must be a non-negative integer', 400);
  }

  req.listQuery = { limit, offset, status };
  next();
};

// Validate array of IDs
export const validateIdArray = (fieldName, maxLength = 100) => {
  return (req, res, next) => {
    const ids = req.body[fieldName];
    
    if (!Array.isArray(ids)) {
      return errorResponse(res, `${fieldName} must be an array`, 400);
    }
    
    if (ids.length === 0) {
      return errorResponse(res, `${fieldName} cannot be empty`, 400);
    }
    
    if (ids.length > maxLength) {
      return errorResponse(res, `${fieldName} cannot contain more than ${maxLength} items`, 400);
    }
    
    // Validate each ID is a positive integer
    for (const id of ids) {
      if (!Number.isInteger(id) || id < 1) {
        return errorResponse(res, `All IDs in ${fieldName} must be positive integers`, 400);
      }
    }
    
    next();
  };
};

