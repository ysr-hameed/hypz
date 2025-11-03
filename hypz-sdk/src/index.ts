/**
 * Hypz Cloud Storage SDK
 * Official JavaScript/TypeScript SDK for Hypz S3-compatible cloud storage
 * @version 1.0.0
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types
export interface HypzConfig {
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
}

export interface Bucket {
  id: string;
  name: string;
  visibility: 'public' | 'private';
  description?: string;
  region?: string;
  file_count: number;
  total_size: number;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  bucket_id: string;
  filename: string;
  original_name: string;
  size: number;
  formatted_size: string;
  mime_type: string;
  url: string;
  cdn_url: string;
  is_public: boolean;
  tags: string[];
  metadata: Record<string, any>;
  downloads: number;
  created_at: string;
  updated_at: string;
}

export interface Usage {
  storage_used: number;
  bandwidth_used: number;
  api_calls: number;
  files_count: number;
}

export interface CreateBucketOptions {
  name: string;
  visibility?: 'public' | 'private';
  description?: string;
  region?: string;
}

export interface UploadFileOptions {
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ListOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export class HypzError extends Error {
  statusCode: number;
  response: any;

  constructor(message: string, statusCode: number, response?: any) {
    super(message);
    this.name = 'HypzError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Hypz Cloud Storage Client
 */
export class Hypz {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

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
  constructor(config: HypzConfig) {
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
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const message = error.response?.data?.message || error.message;
        const statusCode = error.response?.status || 0;
        throw new HypzError(message, statusCode, error.response?.data);
      }
    );
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
  async createBucket(options: CreateBucketOptions): Promise<Bucket> {
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
  async listBuckets(options: ListOptions = {}): Promise<Bucket[]> {
    const response = await this.client.get('/buckets', { params: options });
    return response.data.buckets || response.data;
  }

  /**
   * Get bucket by ID
   * @param bucketId Bucket ID
   * @returns Bucket details
   */
  async getBucket(bucketId: string): Promise<Bucket> {
    const response = await this.client.get(`/buckets/${bucketId}`);
    return response.data;
  }

  /**
   * Update bucket
   * @param bucketId Bucket ID
   * @param updates Bucket updates
   * @returns Updated bucket
   */
  async updateBucket(bucketId: string, updates: Partial<CreateBucketOptions>): Promise<Bucket> {
    const response = await this.client.put(`/buckets/${bucketId}`, updates);
    return response.data;
  }

  /**
   * Delete bucket
   * @param bucketId Bucket ID
   */
  async deleteBucket(bucketId: string): Promise<void> {
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
  async uploadFile(
    bucketId: string,
    file: File | Blob | Buffer,
    options: UploadFileOptions & { filename?: string } = {}
  ): Promise<File> {
    const formData = new FormData();
    
    // Handle different file types
    if (typeof window !== 'undefined' && file instanceof Blob) {
      formData.append('file', file, options.filename);
    } else {
      // Node.js Buffer
      formData.append('file', file as any, options.filename || 'file');
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
  async listFiles(bucketId: string, options: ListOptions = {}): Promise<File[]> {
    const response = await this.client.get(`/buckets/${bucketId}/files`, { params: options });
    return response.data.files || response.data;
  }

  /**
   * Get file details
   * @param fileId File ID
   * @returns File details
   */
  async getFile(fileId: string): Promise<File> {
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
  async getDownloadUrl(fileId: string): Promise<string> {
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
  async deleteFile(fileId: string): Promise<void> {
    await this.client.delete(`/files/file/${fileId}`);
  }

  /**
   * Update file metadata
   * @param fileId File ID
   * @param updates File updates
   * @returns Updated file
   */
  async updateFile(fileId: string, updates: { tags?: string[]; metadata?: Record<string, any> }): Promise<File> {
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
  async getUsage(): Promise<Usage> {
    const response = await this.client.get('/usage/current');
    return response.data;
  }

  /**
   * Get usage history
   * @param options Query options
   * @returns Usage history
   */
  async getUsageHistory(options: { period?: string } = {}): Promise<any> {
    const response = await this.client.get('/usage/history', { params: options });
    return response.data;
  }
}

// Default export
export default Hypz;
