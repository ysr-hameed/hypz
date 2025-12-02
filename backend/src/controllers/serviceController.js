/**
 * Admin Controller - Service Management
 *
 * Administrative endpoints for monitoring and managing services
 */

import {
    asyncHandler,
    successResponse,
    errorResponse,
} from "../utils/helpers.js";
import ServiceRegistry from "../services/core/ServiceRegistry.js";
import logger from "../utils/logger.js";

/**
 * Get all services status
 */
export const getServicesStatus = asyncHandler(async (req, res) => {
    const status = ServiceRegistry.getAllStatus();

    successResponse(
        res,
        {
            services: status,
            totalServices: Object.keys(status).length,
            runningServices: Object.values(status).filter(
                (s) => s.status === "running"
            ).length,
            timestamp: new Date().toISOString(),
        },
        "Services status retrieved successfully"
    );
});

/**
 * Get all services health
 */
export const getServicesHealth = asyncHandler(async (req, res) => {
    const health = await ServiceRegistry.checkAllHealth();

    const allHealthy = Object.values(health).every((h) => h.healthy);

    successResponse(
        res,
        {
            health,
            overall: allHealthy ? "healthy" : "degraded",
            timestamp: new Date().toISOString(),
        },
        "Services health check completed"
    );
});

/**
 * Get specific service status
 */
export const getServiceStatus = asyncHandler(async (req, res) => {
    const { serviceName } = req.params;

    const status = ServiceRegistry.getServiceStatus(serviceName);

    if (!status) {
        return errorResponse(res, `Service '${serviceName}' not found`, 404);
    }

    successResponse(res, status, "Service status retrieved successfully");
});

/**
 * Get specific service health
 */
export const getServiceHealth = asyncHandler(async (req, res) => {
    const { serviceName } = req.params;

    const health = await ServiceRegistry.checkHealth(serviceName);

    if (!health || health.error === "Service not found") {
        return errorResponse(res, `Service '${serviceName}' not found`, 404);
    }

    successResponse(res, health, "Service health check completed");
});

/**
 * Get service metrics
 */
export const getServiceMetrics = asyncHandler(async (req, res) => {
    const { serviceName } = req.params;

    const service = ServiceRegistry.getService(serviceName);

    if (!service) {
        return errorResponse(res, `Service '${serviceName}' not found`, 404);
    }

    if (!service.getMetrics) {
        return errorResponse(
            res,
            `Service '${serviceName}' does not support metrics`,
            400
        );
    }

    const metrics = await service.getMetrics();

    successResponse(res, metrics, "Service metrics retrieved successfully");
});

/**
 * Restart a service (admin only)
 */
export const restartService = asyncHandler(async (req, res) => {
    const { serviceName } = req.params;

    try {
        await ServiceRegistry.stopService(serviceName);
        await ServiceRegistry.startService(serviceName);

        successResponse(
            res,
            {
                service: serviceName,
                status: "restarted",
                timestamp: new Date().toISOString(),
            },
            `Service '${serviceName}' restarted successfully`
        );
    } catch (error) {
        logger.error(`Failed to restart service '${serviceName}':`, error);
        return errorResponse(
            res,
            `Failed to restart service: ${error.message}`,
            500
        );
    }
});

/**
 * Get system overview
 */
export const getSystemOverview = asyncHandler(async (req, res) => {
    const status = ServiceRegistry.getAllStatus();
    const health = await ServiceRegistry.checkAllHealth();

    const overview = {
        services: {
            total: Object.keys(status).length,
            running: Object.values(status).filter((s) => s.status === "running")
                .length,
            stopped: Object.values(status).filter((s) => s.status === "stopped")
                .length,
            error: Object.values(status).filter((s) => s.status === "error")
                .length,
        },
        health: {
            healthy: Object.values(health).filter((h) => h.healthy).length,
            unhealthy: Object.values(health).filter((h) => !h.healthy).length,
            overall: Object.values(health).every((h) => h.healthy)
                ? "healthy"
                : "degraded",
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
    };

    successResponse(res, overview, "System overview retrieved successfully");
});
