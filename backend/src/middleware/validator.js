import { validationResult } from 'express-validator';

// Validation error handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
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
        return res.status(400).json({
          success: false,
          message: 'Invalid tags format. Must be a valid JSON array.'
        });
      }
      
      if (!Array.isArray(parsedTags)) {
        return res.status(400).json({
          success: false,
          message: 'Tags must be an array'
        });
      }
      
      if (parsedTags.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 50 tags allowed'
        });
      }
      
      // Validate each tag
      for (const tag of parsedTags) {
        if (typeof tag !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'All tags must be strings'
          });
        }
        if (tag.length > 50) {
          return res.status(400).json({
            success: false,
            message: 'Each tag must be 50 characters or less'
          });
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
        return res.status(400).json({
          success: false,
          message: 'Invalid metadata format. Must be a valid JSON object.'
        });
      }
      
      if (typeof parsedMetadata !== 'object' || Array.isArray(parsedMetadata)) {
        return res.status(400).json({
          success: false,
          message: 'Metadata must be an object'
        });
      }
      
      // Check metadata size (limit to 10KB)
      const metadataSize = JSON.stringify(parsedMetadata).length;
      if (metadataSize > 10240) {
        return res.status(400).json({
          success: false,
          message: 'Metadata too large. Maximum size is 10KB.'
        });
      }
      
      // Validate metadata values (prevent XSS)
      const sanitizedMetadata = {};
      for (const [key, value] of Object.entries(parsedMetadata)) {
        if (key.length > 100) {
          return res.status(400).json({
            success: false,
            message: 'Metadata keys must be 100 characters or less'
          });
        }
        
        // Basic XSS prevention - reject HTML/script tags in values
        if (typeof value === 'string' && /<script|<iframe|javascript:|onerror=/i.test(value)) {
          return res.status(400).json({
            success: false,
            message: 'Metadata contains potentially dangerous content'
          });
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
        return res.status(413).json({
          success: false,
          message: 'File too large. Maximum file size is 10GB.'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid request data'
    });
  }
};

// Validate bucket name
export const validateBucketName = (req, res, next) => {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Bucket name is required'
    });
  }
  
  // Bucket name rules (similar to AWS S3)
  if (name.length < 3 || name.length > 63) {
    return res.status(400).json({
      success: false,
      message: 'Bucket name must be between 3 and 63 characters'
    });
  }
  
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name)) {
    return res.status(400).json({
      success: false,
      message: 'Bucket name must start and end with lowercase letter or number, and contain only lowercase letters, numbers, and hyphens'
    });
  }
  
  if (/--/.test(name)) {
    return res.status(400).json({
      success: false,
      message: 'Bucket name cannot contain consecutive hyphens'
    });
  }
  
  // Reserved names
  const reserved = ['admin', 'api', 'www', 'app', 'dashboard'];
  if (reserved.includes(name)) {
    return res.status(400).json({
      success: false,
      message: 'This bucket name is reserved'
    });
  }
  
  next();
};

// Validate pagination
export const validatePagination = (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive integer'
    });
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
  
  next();
};

// Validate array of IDs
export const validateIdArray = (fieldName, maxLength = 100) => {
  return (req, res, next) => {
    const ids = req.body[fieldName];
    
    if (!Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} must be an array`
      });
    }
    
    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} cannot be empty`
      });
    }
    
    if (ids.length > maxLength) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} cannot contain more than ${maxLength} items`
      });
    }
    
    // Validate each ID is a positive integer
    for (const id of ids) {
      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
          success: false,
          message: `All IDs in ${fieldName} must be positive integers`
        });
      }
    }
    
    next();
  };
};

