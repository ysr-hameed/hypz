/**
 * Storage Service
 *
 * Handles all file storage operations:
 * - File uploads/downloads
 * - Bucket management
 * - B2 integration
 * - CDN operations
 * - Storage class management
 *
 * Can be run as a standalone microservice on a separate port
 */

import logger from "../../utils/logger.js";
import { query } from "../../config/database.js";
import { isB2Available } from "../b2Service.js";

class StorageService {
    constructor(config = {}) {
        this.name = "storage";
        this.config = {
            port: config.port || null,
            maxFileSize: config.maxFileSize || 5 * 1024 * 1024 * 1024, // 5GB
            allowedMimeTypes: config.allowedMimeTypes || [],
            enableCDN: config.enableCDN !== false,
            enableVersioning: config.enableVersioning !== false,
            ...config,
        };
        this.isRunning = false;
        this.b2Available = false;
    }

    /**
     * Initialize the service
     */
    async start() {
        logger.info(`Starting ${this.name} service...`);

        try {
            // Test database connection
            await query("SELECT 1");

            // Check B2 availability
            this.b2Available = await isB2Available();
            if (this.b2Available) {
                logger.info("Backblaze B2 storage is available");
            } else {
                logger.warn(
                    "Backblaze B2 storage is NOT available - using local storage"
                );
            }

            this.isRunning = true;
            logger.info(`${this.name} service started successfully`);

            if (this.config.port) {
                logger.info(
                    `${this.name} service running in microservice mode on port ${this.config.port}`
                );
            } else {
                logger.info(`${this.name} service running in monolith mode`);
            }
        } catch (error) {
            logger.error(`Failed to start ${this.name} service:`, error);
            throw error;
        }
    }

    /**
     * Shutdown the service
     */
    async stop() {
        logger.info(`Stopping ${this.name} service...`);
        this.isRunning = false;
        logger.info(`${this.name} service stopped`);
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            await query("SELECT 1");
            const b2Status = await isB2Available();

            return {
                healthy: true,
                service: this.name,
                timestamp: new Date().toISOString(),
                storage: {
                    b2Available: b2Status,
                    localStorageAvailable: true,
                },
                config: {
                    maxFileSize: this.config.maxFileSize,
                    cdn: this.config.enableCDN,
                    versioning: this.config.enableVersioning,
                },
            };
        } catch (error) {
            return {
                healthy: false,
                service: this.name,
                error: error.message,
            };
        }
    }

    /**
     * Get service metrics
     */
    async getMetrics() {
        try {
            const totalFilesResult = await query(
                "SELECT COUNT(*) as count, COALESCE(SUM(size), 0) as total_size FROM files WHERE deleted_at IS NULL"
            );
            const totalBucketsResult = await query(
                "SELECT COUNT(*) as count FROM buckets WHERE deleted_at IS NULL"
            );
            const last24hUploadsResult = await query(
                `SELECT COUNT(*) as count FROM files 
         WHERE created_at > NOW() - INTERVAL '24 hours' AND deleted_at IS NULL`
            );

            return {
                service: this.name,
                metrics: {
                    totalFiles: parseInt(totalFilesResult.rows[0].count),
                    totalBuckets: parseInt(totalBucketsResult.rows[0].count),
                    totalStorageBytes: parseInt(
                        totalFilesResult.rows[0].total_size
                    ),
                    last24hUploads: parseInt(
                        last24hUploadsResult.rows[0].count
                    ),
                    b2Available: this.b2Available,
                    isRunning: this.isRunning,
                },
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            logger.error("Failed to get storage metrics:", error);
            return { error: error.message };
        }
    }
}

export default StorageService;
