/**
 * Hypz Cloud Storage SDK
 * Official JavaScript/TypeScript SDK for Hypz S3-compatible cloud storage
 * @version 1.0.0
 */
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
export declare class HypzError extends Error {
    statusCode: number;
    response: any;
    constructor(message: string, statusCode: number, response?: any);
}
/**
 * Hypz Cloud Storage Client
 */
export declare class Hypz {
    private client;
    private apiKey;
    private baseURL;
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
    constructor(config: HypzConfig);
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
    createBucket(options: CreateBucketOptions): Promise<Bucket>;
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
    listBuckets(options?: ListOptions): Promise<Bucket[]>;
    /**
     * Get bucket by ID
     * @param bucketId Bucket ID
     * @returns Bucket details
     */
    getBucket(bucketId: string): Promise<Bucket>;
    /**
     * Update bucket
     * @param bucketId Bucket ID
     * @param updates Bucket updates
     * @returns Updated bucket
     */
    updateBucket(bucketId: string, updates: Partial<CreateBucketOptions>): Promise<Bucket>;
    /**
     * Delete bucket
     * @param bucketId Bucket ID
     */
    deleteBucket(bucketId: string): Promise<void>;
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
    uploadFile(bucketId: string, file: File | Blob | Buffer, options?: UploadFileOptions & {
        filename?: string;
    }): Promise<File>;
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
    listFiles(bucketId: string, options?: ListOptions): Promise<File[]>;
    /**
     * Get file details
     * @param fileId File ID
     * @returns File details
     */
    getFile(fileId: string): Promise<File>;
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
    getDownloadUrl(fileId: string): Promise<string>;
    /**
     * Delete file
     * @param fileId File ID
     * @example
     * ```javascript
     * await hypz.deleteFile('file-id');
     * console.log('File deleted');
     * ```
     */
    deleteFile(fileId: string): Promise<void>;
    /**
     * Update file metadata
     * @param fileId File ID
     * @param updates File updates
     * @returns Updated file
     */
    updateFile(fileId: string, updates: {
        tags?: string[];
        metadata?: Record<string, any>;
    }): Promise<File>;
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
    getUsage(): Promise<Usage>;
    /**
     * Get usage history
     * @param options Query options
     * @returns Usage history
     */
    getUsageHistory(options?: {
        period?: string;
    }): Promise<any>;
}
export default Hypz;
