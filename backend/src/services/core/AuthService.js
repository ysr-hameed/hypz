/**
 * Authentication Service
 *
 * Handles all authentication operations:
 * - User login/register
 * - Token management
 * - Password resets
 * - 2FA operations
 * - OAuth integration
 *
 * Can be run as a standalone microservice on a separate port
 */

import logger from "../../utils/logger.js";
import { query } from "../../config/database.js";

class AuthService {
    constructor(config = {}) {
        this.name = "auth";
        this.config = {
            port: config.port || null, // null = monolith mode, number = microservice mode
            enableOAuth: config.enableOAuth !== false,
            enable2FA: config.enable2FA !== false,
            tokenExpiry: config.tokenExpiry || "24h",
            refreshTokenExpiry: config.refreshTokenExpiry || "7d",
            ...config,
        };
        this.isRunning = false;
    }

    /**
     * Initialize the service
     */
    async start() {
        logger.info(`Starting ${this.name} service...`);

        try {
            // Test database connection
            await query("SELECT 1");

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
            return {
                healthy: true,
                service: this.name,
                timestamp: new Date().toISOString(),
                config: {
                    oauth: this.config.enableOAuth,
                    twoFactor: this.config.enable2FA,
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
            const activeUsersResult = await query(
                "SELECT COUNT(*) as count FROM users WHERE is_active = true"
            );
            const totalUsersResult = await query(
                "SELECT COUNT(*) as count FROM users"
            );
            const last24hLoginsResult = await query(
                `SELECT COUNT(*) as count FROM users 
         WHERE last_login_at > NOW() - INTERVAL '24 hours'`
            );

            return {
                service: this.name,
                metrics: {
                    totalUsers: parseInt(totalUsersResult.rows[0].count),
                    activeUsers: parseInt(activeUsersResult.rows[0].count),
                    last24hLogins: parseInt(last24hLoginsResult.rows[0].count),
                    isRunning: this.isRunning,
                },
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            logger.error("Failed to get auth metrics:", error);
            return { error: error.message };
        }
    }
}

export default AuthService;
