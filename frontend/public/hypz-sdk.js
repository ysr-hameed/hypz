/**
 * Hypz Cloud Storage SDK
 * Developer SDK for integrating Hypz S3-compatible cloud storage
 * @version 1.0.0
 * @license MIT
 */

class HypzClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'https://api.hypz.io/api/v1';
    this.apiKey = config.apiKey || null;
    this.token = config.token || null;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Make HTTP request
   * @private
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authentication
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    } else if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.timeout)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new HypzError(data.message || 'Request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof HypzError) throw error;
      throw new HypzError(error.message, 0, error);
    }
  }

  /**
   * Upload file with FormData
   * @private
   */
  async _uploadFile(endpoint, file, data = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const formData = new FormData();
    
    formData.append('file', file);
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
      }
    });

    const headers = {};
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    } else if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(this.timeout)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new HypzError(result.message || 'Upload failed', response.status, result);
      }

      return result;
    } catch (error) {
      if (error instanceof HypzError) throw error;
      throw new HypzError(error.message, 0, error);
    }
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data and token
   */
  async register(userData) {
    return this._request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  async login(email, password) {
    const response = await this._request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.data.token) {
      this.token = response.data.token;
    }
    
    return response;
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Set API key
   * @param {string} apiKey - API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  // ============================================
  // BUCKETS
  // ============================================

  /**
   * Create a new bucket
   * @param {Object} bucketData - Bucket configuration
   * @param {string} bucketData.name - Bucket name
   * @param {string} bucketData.visibility - 'public' or 'private' (default: 'private')
   * @param {string} bucketData.description - Bucket description
   * @param {string} bucketData.region - Bucket region (default: 'us-east-1')
   * @returns {Promise<Object>} Created bucket
   */
  async createBucket(bucketData) {
    return this._request('/buckets', {
      method: 'POST',
      body: JSON.stringify(bucketData)
    });
  }

  /**
   * List all buckets
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search query
   * @returns {Promise<Object>} List of buckets with pagination
   */
  async listBuckets(options = {}) {
    const params = new URLSearchParams(options).toString();
    return this._request(`/buckets${params ? '?' + params : ''}`);
  }

  /**
   * Get bucket by ID
   * @param {string} bucketId - Bucket ID
   * @returns {Promise<Object>} Bucket details
   */
  async getBucket(bucketId) {
    return this._request(`/buckets/${bucketId}`);
  }

  /**
   * Update bucket
   * @param {string} bucketId - Bucket ID
   * @param {Object} updates - Bucket updates
   * @returns {Promise<Object>} Updated bucket
   */
  async updateBucket(bucketId, updates) {
    return this._request(`/buckets/${bucketId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete bucket
   * @param {string} bucketId - Bucket ID
   * @returns {Promise<Object>} Success message
   */
  async deleteBucket(bucketId) {
    return this._request(`/buckets/${bucketId}`, {
      method: 'DELETE'
    });
  }

  // ============================================
  // FILES
  // ============================================

  /**
   * Upload file to bucket
   * File visibility (public/private) is determined by the bucket's visibility setting
   * @param {string} bucketId - Bucket ID
   * @param {File|Blob} file - File to upload
   * @param {Object} options - Upload options
   * @param {Array<string>} options.tags - File tags
   * @param {Object} options.metadata - Custom metadata
   * @returns {Promise<Object>} Uploaded file info
   */
  async uploadFile(bucketId, file, options = {}) {
    return this._uploadFile(`/buckets/${bucketId}/files`, file, options);
  }

  /**
   * List files in bucket
   * @param {string} bucketId - Bucket ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search query
   * @param {string} options.type - Filter by MIME type
   * @returns {Promise<Object>} List of files with pagination
   */
  async listFiles(bucketId, options = {}) {
    const params = new URLSearchParams(options).toString();
    return this._request(`/buckets/${bucketId}/files${params ? '?' + params : ''}`);
  }

  /**
   * Get file details
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} File details
   */
  async getFile(fileId) {
    return this._request(`/files/${fileId}`);
  }

  /**
   * Get file download URL
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} Download URL
   */
  async getFileDownloadUrl(fileId) {
    return this._request(`/files/${fileId}/download`);
  }

  /**
   * Update file metadata
   * @param {string} fileId - File ID
   * @param {Object} updates - File updates
   * @returns {Promise<Object>} Updated file
   */
  async updateFile(fileId, updates) {
    return this._request(`/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete file
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} Success message
   */
  async deleteFile(fileId) {
    return this._request(`/files/${fileId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Bulk delete files
   * @param {Array<string>} fileIds - Array of file IDs
   * @returns {Promise<Object>} Bulk delete result
   */
  async bulkDeleteFiles(fileIds) {
    return this._request('/files/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ fileIds })
    });
  }

  // ============================================
  // API KEYS
  // ============================================

  /**
   * Create API key
   * @param {Object} keyData - API key configuration
   * @param {string} keyData.name - Key name
   * @param {Array<string>} keyData.permissions - Array of permissions
   * @param {string} keyData.expiresAt - Expiration date (optional)
   * @returns {Promise<Object>} Created API key (key is only shown once!)
   */
  async createApiKey(keyData) {
    return this._request('/api-keys', {
      method: 'POST',
      body: JSON.stringify(keyData)
    });
  }

  /**
   * List API keys
   * @returns {Promise<Object>} List of API keys
   */
  async listApiKeys() {
    return this._request('/api-keys');
  }

  /**
   * Revoke API key
   * @param {string} keyId - API key ID
   * @returns {Promise<Object>} Success message
   */
  async revokeApiKey(keyId) {
    return this._request(`/api-keys/${keyId}`, {
      method: 'DELETE'
    });
  }

  // ============================================
  // USAGE & STATS
  // ============================================

  /**
   * Get usage statistics
   * @param {Object} options - Query options
   * @param {string} options.period - Time period ('day', 'week', 'month', 'year')
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsage(options = {}) {
    const params = new URLSearchParams(options).toString();
    return this._request(`/usage${params ? '?' + params : ''}`);
  }

  /**
   * Get current usage stats
   * @returns {Promise<Object>} Current usage stats
   */
  async getCurrentUsage() {
    return this._request('/usage/current');
  }
}

/**
 * Custom error class for Hypz SDK
 */
class HypzError extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.name = 'HypzError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = { HypzClient, HypzError };
} else if (typeof define === 'function' && define.amd) {
  // AMD
  define([], () => ({ HypzClient, HypzError }));
} else {
  // Browser global
  window.HypzClient = HypzClient;
  window.HypzError = HypzError;
}
