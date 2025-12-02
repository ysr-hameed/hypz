/**
 * Service Bootstrapper
 *
 * Initializes and manages all services
 * Supports both monolith and microservice architectures
 */

import ServiceRegistry from "./ServiceRegistry.js";
import AuthService from "./AuthService.js";
import StorageService from "./StorageService.js";
import PaymentService from "./PaymentService.js";
import logger from "../../utils/logger.js";
import config from "../../config/config.js";

// Import routes
import authRoutes from "../../routes/authRoutes.js";
import fileRoutes from "../../routes/fileRoutes.js";
import bucketRoutes from "../../routes/bucketRoutes.js";
import paymentRoutes from "../../routes/paymentRoutes.js";
import subscriptionRoutes from "../../routes/subscriptionRoutes.js";

/**
 * Bootstrap all services
 */
export async function bootstrapServices(mode = "monolith") {
    logger.info(`Bootstrapping services in ${mode} mode...`);

    try {
        // Initialize services
        const authService = new AuthService({
            enableOAuth: config.ENABLE_OAUTH || false,
            enable2FA: config.ENABLE_2FA !== false,
            port: mode === "microservice" ? config.AUTH_SERVICE_PORT : null,
        });

        const storageService = new StorageService({
            maxFileSize: config.MAX_FILE_SIZE || 5 * 1024 * 1024 * 1024,
            enableCDN: config.ENABLE_CDN !== false,
            enableVersioning: config.ENABLE_VERSIONING !== false,
            port: mode === "microservice" ? config.STORAGE_SERVICE_PORT : null,
        });

        const paymentService = new PaymentService({
            provider: "skydo",
            enableWebhooks: true,
            enableAutoBilling: true,
            port: mode === "microservice" ? config.PAYMENT_SERVICE_PORT : null,
        });

        // Register services in the registry
        ServiceRegistry.register("auth", authService, {
            dependencies: [],
            routes: authRoutes,
            baseUrl: "/auth",
            healthCheck: () => authService.healthCheck(),
        });

        ServiceRegistry.register("storage", storageService, {
            dependencies: ["auth"], // Storage depends on auth
            routes: [fileRoutes, bucketRoutes],
            baseUrl: "/storage",
            healthCheck: () => storageService.healthCheck(),
        });

        ServiceRegistry.register("payment", paymentService, {
            dependencies: ["auth"], // Payment depends on auth
            routes: [paymentRoutes, subscriptionRoutes],
            baseUrl: "/payments",
            healthCheck: () => paymentService.healthCheck(),
        });

        // Start all services in dependency order
        await ServiceRegistry.startAll();

        logger.info("All services bootstrapped successfully");

        return ServiceRegistry;
    } catch (error) {
        logger.error("Failed to bootstrap services:", error);
        throw error;
    }
}

/**
 * Graceful shutdown
 */
export async function shutdownServices() {
    logger.info("Shutting down services...");

    try {
        await ServiceRegistry.stopAll();
        logger.info("All services shut down successfully");
    } catch (error) {
        logger.error("Error during service shutdown:", error);
        throw error;
    }
}

/**
 * Get service health status
 */
export async function getServicesHealth() {
    return await ServiceRegistry.checkAllHealth();
}

/**
 * Get service status
 */
export function getServicesStatus() {
    return ServiceRegistry.getAllStatus();
}

export default {
    bootstrap: bootstrapServices,
    shutdown: shutdownServices,
    getHealth: getServicesHealth,
    getStatus: getServicesStatus,
    registry: ServiceRegistry,
};
