/**
 * Service Registry - Central service management for microservices architecture
 *
 * This registry allows services to be:
 * - Run together in a monolith (default)
 * - Split into separate servers (microservices) later
 * - Discovered dynamically
 * - Health checked and monitored
 */

import logger from "../../utils/logger.js";

class ServiceRegistry {
    constructor() {
        this.services = new Map();
        this.healthChecks = new Map();
        this.dependencies = new Map();
    }

    /**
     * Register a service
     * @param {string} name - Service name (e.g., 'auth', 'storage', 'payment')
     * @param {Object} service - Service instance with start/stop methods
     * @param {Object} options - Service options
     */
    register(name, service, options = {}) {
        if (this.services.has(name)) {
            logger.warn(
                `Service '${name}' is already registered. Overwriting...`
            );
        }

        this.services.set(name, {
            instance: service,
            status: "registered",
            config: options.config || {},
            healthCheck:
                options.healthCheck ||
                (() => Promise.resolve({ healthy: true })),
            dependencies: options.dependencies || [],
            routes: options.routes || [],
            port: options.port || null, // For microservice mode
            baseUrl: options.baseUrl || `/${name}`, // API base path
            startedAt: null,
            errors: [],
        });

        if (options.dependencies) {
            this.dependencies.set(name, options.dependencies);
        }

        logger.info(`Service '${name}' registered successfully`);
    }

    /**
     * Start a specific service
     */
    async startService(name) {
        const serviceData = this.services.get(name);
        if (!serviceData) {
            throw new Error(`Service '${name}' not found`);
        }

        if (serviceData.status === "running") {
            logger.warn(`Service '${name}' is already running`);
            return;
        }

        try {
            // Check dependencies
            for (const dep of serviceData.dependencies) {
                const depService = this.services.get(dep);
                if (!depService || depService.status !== "running") {
                    throw new Error(`Dependency '${dep}' is not running`);
                }
            }

            // Start the service
            if (serviceData.instance.start) {
                await serviceData.instance.start();
            }

            serviceData.status = "running";
            serviceData.startedAt = new Date();
            logger.info(`Service '${name}' started successfully`);
        } catch (error) {
            serviceData.status = "error";
            serviceData.errors.push({
                timestamp: new Date(),
                error: error.message,
            });
            logger.error(`Failed to start service '${name}':`, error);
            throw error;
        }
    }

    /**
     * Stop a specific service
     */
    async stopService(name) {
        const serviceData = this.services.get(name);
        if (!serviceData) {
            throw new Error(`Service '${name}' not found`);
        }

        try {
            if (serviceData.instance.stop) {
                await serviceData.instance.stop();
            }

            serviceData.status = "stopped";
            serviceData.startedAt = null;
            logger.info(`Service '${name}' stopped successfully`);
        } catch (error) {
            logger.error(`Failed to stop service '${name}':`, error);
            throw error;
        }
    }

    /**
     * Start all services in dependency order
     */
    async startAll() {
        const sorted = this.topologicalSort();
        logger.info(`Starting services in order: ${sorted.join(" → ")}`);

        for (const serviceName of sorted) {
            await this.startService(serviceName);
        }

        logger.info("All services started successfully");
    }

    /**
     * Stop all services in reverse dependency order
     */
    async stopAll() {
        const sorted = this.topologicalSort().reverse();
        logger.info(`Stopping services in order: ${sorted.join(" → ")}`);

        for (const serviceName of sorted) {
            await this.stopService(serviceName);
        }

        logger.info("All services stopped successfully");
    }

    /**
     * Get service status
     */
    getServiceStatus(name) {
        const serviceData = this.services.get(name);
        if (!serviceData) {
            return null;
        }

        return {
            name,
            status: serviceData.status,
            startedAt: serviceData.startedAt,
            uptime: serviceData.startedAt
                ? Date.now() - serviceData.startedAt.getTime()
                : 0,
            dependencies: serviceData.dependencies,
            errors: serviceData.errors,
            baseUrl: serviceData.baseUrl,
        };
    }

    /**
     * Get all services status
     */
    getAllStatus() {
        const statuses = {};
        for (const [name] of this.services) {
            statuses[name] = this.getServiceStatus(name);
        }
        return statuses;
    }

    /**
     * Health check for a service
     */
    async checkHealth(name) {
        const serviceData = this.services.get(name);
        if (!serviceData) {
            return { healthy: false, error: "Service not found" };
        }

        try {
            const result = await serviceData.healthCheck();
            return { healthy: true, ...result };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    /**
     * Health check for all services
     */
    async checkAllHealth() {
        const health = {};
        for (const [name] of this.services) {
            health[name] = await this.checkHealth(name);
        }
        return health;
    }

    /**
     * Get service instance
     */
    getService(name) {
        const serviceData = this.services.get(name);
        return serviceData ? serviceData.instance : null;
    }

    /**
     * Topological sort for dependency resolution
     */
    topologicalSort() {
        const visited = new Set();
        const result = [];

        const visit = (name) => {
            if (visited.has(name)) return;
            visited.add(name);

            const deps = this.dependencies.get(name) || [];
            for (const dep of deps) {
                visit(dep);
            }

            result.push(name);
        };

        for (const [name] of this.services) {
            visit(name);
        }

        return result;
    }

    /**
     * Get service routes (for mounting in Express)
     */
    getRoutes(name) {
        const serviceData = this.services.get(name);
        return serviceData ? serviceData.routes : [];
    }

    /**
     * Get all routes for all services
     */
    getAllRoutes() {
        const routes = {};
        for (const [name, data] of this.services) {
            routes[data.baseUrl] = data.routes;
        }
        return routes;
    }
}

// Singleton instance
const registry = new ServiceRegistry();

export default registry;
