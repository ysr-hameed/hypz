import axios from 'axios';

/**
 * Hypz Cloud Storage SDK
 * Official JavaScript/TypeScript SDK for Hypz S3-compatible cloud storage
 * @version 1.0.0
 */
class HypzError extends Error {
    constructor(message, statusCode, response) {
        super(message);
        this.name = 'HypzError';
        this.statusCode = statusCode;
        this.response = response;
    }
}
/**
 * Hypz Cloud Storage Client
 */
class Hypz {
    /**
     * Initialize Hypz SDK
     * @param config Configuration options
     * @example
     * ```javascript
     * const hypz = new Hypz({
     *   apiKey: 'your_api_key_here',
     *   baseURL: 'https://api.hypz.io/api/v1'
     * });
     * ```
     */
    constructor(config) {
        if (!config.apiKey) {
            throw new Error('API key is required');
        }
        this.apiKey = config.apiKey;
        this.baseURL = config.baseURL || 'https://api.hypz.io/api/v1';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: config.timeout || 30000,
            headers: {
                'X-API-Key': this.apiKey,
            },
        });
        // Response interceptor to handle errors
        this.client.interceptors.response.use((response) => response.data, (error) => {
            var _a, _b, _c, _d;
            const message = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message;
            const statusCode = ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) || 0;
            throw new HypzError(message, statusCode, (_d = error.response) === null || _d === void 0 ? void 0 : _d.data);
        });
    }
    // ==================== BUCKETS ====================
    /**
     * Create a new bucket
     * @param options Bucket creation options
     * @returns Created bucket
     * @example
     * ```javascript
     * const bucket = await hypz.createBucket({
     *   name: 'my-app-uploads',
     *   visibility: 'public',
     *   description: 'User uploads'
     * });
     * console.log(bucket.id);
     * ```
     */
    async createBucket(options) {
        const response = await this.client.post('/buckets', options);
        return response.data;
    }
    /**
     * List all buckets
     * @param options List options
     * @returns List of buckets
     * @example
     * ```javascript
     * const buckets = await hypz.listBuckets({ page: 1, limit: 20 });
     * buckets.forEach(bucket => console.log(bucket.name));
     * ```
     */
    async listBuckets(options = {}) {
        const response = await this.client.get('/buckets', { params: options });
        return response.data.buckets || response.data;
    }
    /**
     * Get bucket by ID
     * @param bucketId Bucket ID
     * @returns Bucket details
     */
    async getBucket(bucketId) {
        const response = await this.client.get(`/buckets/${bucketId}`);
        return response.data;
    }
    /**
     * Update bucket
     * @param bucketId Bucket ID
     * @param updates Bucket updates
     * @returns Updated bucket
     */
    async updateBucket(bucketId, updates) {
        const response = await this.client.put(`/buckets/${bucketId}`, updates);
        return response.data;
    }
    /**
     * Delete bucket
     * @param bucketId Bucket ID
     */
    async deleteBucket(bucketId) {
        await this.client.delete(`/buckets/${bucketId}`);
    }
    // ==================== FILES ====================
    /**
     * Upload file to bucket
     * @param bucketId Bucket ID
     * @param file File to upload (File, Blob, or Buffer)
     * @param options Upload options
     * @returns Uploaded file info
     * @example
     * ```javascript
     * // Browser
     * const fileInput = document.querySelector('input[type="file"]');
     * const file = await hypz.uploadFile('bucket-id', fileInput.files[0], {
     *   tags: ['avatar', 'profile'],
     *   metadata: { userId: '123' }
     * });
     * console.log(file.url);
     *
     * // Node.js
     * const fs = require('fs');
     * const fileBuffer = fs.readFileSync('./image.jpg');
     * const file = await hypz.uploadFile('bucket-id', fileBuffer, {
     *   filename: 'image.jpg',
     *   tags: ['photo']
     * });
     * ```
     */
    async uploadFile(bucketId, file, options = {}) {
        const formData = new FormData();
        // Handle different file types
        if (typeof window !== 'undefined' && file instanceof Blob) {
            formData.append('file', file, options.filename);
        }
        else {
            // Node.js Buffer
            formData.append('file', file, options.filename || 'file');
        }
        if (options.tags) {
            formData.append('tags', JSON.stringify(options.tags));
        }
        if (options.metadata) {
            formData.append('metadata', JSON.stringify(options.metadata));
        }
        const response = await this.client.post(`/buckets/${bucketId}/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    /**
     * List files in bucket
     * @param bucketId Bucket ID
     * @param options List options
     * @returns List of files
     * @example
     * ```javascript
     * const files = await hypz.listFiles('bucket-id', {
     *   page: 1,
     *   limit: 50,
     *   search: 'avatar'
     * });
     * ```
     */
    async listFiles(bucketId, options = {}) {
        const response = await this.client.get(`/buckets/${bucketId}/files`, { params: options });
        return response.data.files || response.data;
    }
    /**
     * Get file details
     * @param fileId File ID
     * @returns File details
     */
    async getFile(fileId) {
        const response = await this.client.get(`/files/file/${fileId}`);
        return response.data;
    }
    /**
     * Get file download URL
     * @param fileId File ID
     * @returns Download URL
     * @example
     * ```javascript
     * const downloadUrl = await hypz.getDownloadUrl('file-id');
     * window.location.href = downloadUrl;
     * ```
     */
    async getDownloadUrl(fileId) {
        const response = await this.client.get(`/files/file/${fileId}/download`);
        return response.data.download_url;
    }
    /**
     * Delete file
     * @param fileId File ID
     * @example
     * ```javascript
     * await hypz.deleteFile('file-id');
     * console.log('File deleted');
     * ```
     */
    async deleteFile(fileId) {
        await this.client.delete(`/files/file/${fileId}`);
    }
    /**
     * Update file metadata
     * @param fileId File ID
     * @param updates File updates
     * @returns Updated file
     */
    async updateFile(fileId, updates) {
        const response = await this.client.patch(`/files/file/${fileId}`, updates);
        return response.data;
    }
    // ==================== USAGE ====================
    /**
     * Get current usage statistics
     * @returns Usage stats
     * @example
     * ```javascript
     * const usage = await hypz.getUsage();
     * console.log(`Storage: ${usage.storage_used} bytes`);
     * console.log(`API Calls: ${usage.api_calls}`);
     * ```
     */
    async getUsage() {
        const response = await this.client.get('/usage/current');
        return response.data;
    }
    /**
     * Get usage history
     * @param options Query options
     * @returns Usage history
     */
    async getUsageHistory(options = {}) {
        const response = await this.client.get('/usage/history', { params: options });
        return response.data;
    }
}

export { Hypz, HypzError, Hypz as default };
//# sourceMappingURL=index.esm.js.map
