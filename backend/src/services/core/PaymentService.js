/**
 * Payment Service
 *
 * Handles all payment operations:
 * - Skydo integration
 * - Subscription management
 * - Invoice generation
 * - Usage billing
 * - Webhook handling
 *
 * Can be run as a standalone microservice on a separate port
 */

import logger from "../../utils/logger.js";
import { query } from "../../config/database.js";
import config from "../../config/config.js";

class PaymentService {
    constructor(serviceConfig = {}) {
        this.name = "payment";
        this.config = {
            port: serviceConfig.port || null,
            provider: serviceConfig.provider || "skydo",
            enableWebhooks: serviceConfig.enableWebhooks !== false,
            enableAutoBilling: serviceConfig.enableAutoBilling !== false,
            billingCycle: serviceConfig.billingCycle || "monthly",
            ...serviceConfig,
        };
        this.isRunning = false;
        this.providerAvailable = false;
    }

    /**
     * Initialize the service
     */
    async start() {
        logger.info(`Starting ${this.name} service...`);

        try {
            // Test database connection
            await query("SELECT 1");

            // Check payment provider configuration
            if (this.config.provider === "skydo") {
                this.providerAvailable = !!(
                    config.SKYDO_API_KEY && config.SKYDO_WEBHOOK_SECRET
                );
                if (this.providerAvailable) {
                    logger.info("Skydo payment provider is configured");
                } else {
                    logger.warn(
                        "Skydo payment provider is NOT configured - payments will be disabled"
                    );
                }
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

            return {
                healthy: true,
                service: this.name,
                timestamp: new Date().toISOString(),
                payment: {
                    provider: this.config.provider,
                    providerConfigured: this.providerAvailable,
                    webhooksEnabled: this.config.enableWebhooks,
                },
                config: {
                    billingCycle: this.config.billingCycle,
                    autoBilling: this.config.enableAutoBilling,
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
            const activeSubscriptionsResult = await query(
                `SELECT COUNT(*) as count FROM subscriptions 
         WHERE status = 'active'`
            );
            const totalRevenueResult = await query(
                `SELECT COALESCE(SUM(amount), 0) as total FROM payment_transactions 
         WHERE status = 'succeeded'`
            );
            const last30dRevenueResult = await query(
                `SELECT COALESCE(SUM(amount), 0) as total FROM payment_transactions 
         WHERE status = 'succeeded' AND created_at > NOW() - INTERVAL '30 days'`
            );

            return {
                service: this.name,
                metrics: {
                    activeSubscriptions: parseInt(
                        activeSubscriptionsResult.rows[0].count
                    ),
                    totalRevenue: parseFloat(totalRevenueResult.rows[0].total),
                    last30dRevenue: parseFloat(
                        last30dRevenueResult.rows[0].total
                    ),
                    providerAvailable: this.providerAvailable,
                    isRunning: this.isRunning,
                },
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            logger.error("Failed to get payment metrics:", error);
            return { error: error.message };
        }
    }
}

export default PaymentService;
