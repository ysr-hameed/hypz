import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/config.js";
import pool from "./config/database.js";
import logger from "./utils/logger.js";
import {
    corsOptions,
    helmetConfig,
    compressionConfig,
    apiLimiter,
    errorHandler,
    notFound,
    requestLogger,
    sanitizeData,
} from "./middleware/security.js";
import { performanceMonitor } from "./middleware/performance.js";
import {
    planBasedRateLimit,
    globalRateLimit,
} from "./middleware/rateLimiter.js";
import { responseNormalizer } from "./middleware/responseNormalizer.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import twoFactorRoutes from "./routes/twoFactorRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bucketRoutes from "./routes/bucketRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import apiKeyRoutes from "./routes/apiKeyRoutes.js";
import usageRoutes from "./routes/usageRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import versioningRoutes from "./routes/versioningRoutes.js";
import storageClassRoutes from "./routes/storageClassRoutes.js";
import multipartRoutes from "./routes/multipartRoutes.js";
import lifecycleRoutes from "./routes/lifecycleRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import corsRoutes from "./routes/corsRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";
import presignedRoutes from "./routes/presignedRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

// Services
import { startBillingScheduler } from "./services/billingCron.js";
import {
    bootstrapServices,
    shutdownServices,
} from "./services/core/bootstrap.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Console override removed — use the centralized `logger` from `./utils/logger.js` directly.

// Trust proxy (important for rate limiting and IP detection)
app.set("trust proxy", 1);

// Performance monitoring
app.use(performanceMonitor);

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(...sanitizeData);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compressionConfig);

// Logging
if (config.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

// Custom request logger
app.use(requestLogger);

// Normalize responses to a consistent API format
app.use(responseNormalizer);

// Static files (for uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
    });
});

// API version endpoint
app.get(`/api/${config.API_VERSION}`, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hypz Storage API",
        version: config.API_VERSION,
        documentation: `${config.FRONTEND_URL}/docs`,
    });
});

// Handle preflight requests globally
app.options("*", cors(corsOptions));

// Apply global rate limiting to API routes (IP-based for unauthenticated)
app.use(`/api/${config.API_VERSION}`, globalRateLimit(20)); // 20 req/s for unauthenticated

// API Routes - Plan-based rate limiting applied after authentication in routes
app.use(`/api/${config.API_VERSION}/config`, configRoutes);
app.use(`/api/${config.API_VERSION}/auth`, authRoutes);
app.use(`/api/${config.API_VERSION}/auth`, twoFactorRoutes);
app.use(`/api/${config.API_VERSION}/oauth`, oauthRoutes);
app.use(`/api/${config.API_VERSION}/admin`, adminRoutes);
app.use(`/api/${config.API_VERSION}/buckets`, planBasedRateLimit, bucketRoutes);
app.use(`/api/${config.API_VERSION}/files`, planBasedRateLimit, fileRoutes);
app.use(
    `/api/${config.API_VERSION}/api-keys`,
    planBasedRateLimit,
    apiKeyRoutes
);
app.use(`/api/${config.API_VERSION}/usage`, planBasedRateLimit, usageRoutes);
app.use(`/api/${config.API_VERSION}/plans`, planRoutes);
app.use(`/api/${config.API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${config.API_VERSION}/subscriptions`, subscriptionRoutes);
app.use(`/api/${config.API_VERSION}/user`, planBasedRateLimit, userRoutes);
app.use(
    `/api/${config.API_VERSION}/notifications`,
    planBasedRateLimit,
    notificationRoutes
);
app.use(
    `/api/${config.API_VERSION}/versioning`,
    planBasedRateLimit,
    versioningRoutes
);
app.use(
    `/api/${config.API_VERSION}/storage-classes`,
    planBasedRateLimit,
    storageClassRoutes
);
app.use(
    `/api/${config.API_VERSION}/multipart`,
    planBasedRateLimit,
    multipartRoutes
);
app.use(
    `/api/${config.API_VERSION}/lifecycle`,
    planBasedRateLimit,
    lifecycleRoutes
);
app.use(`/api/${config.API_VERSION}/events`, planBasedRateLimit, eventRoutes);
app.use(`/api/${config.API_VERSION}/cors`, planBasedRateLimit, corsRoutes);
app.use(
    `/api/${config.API_VERSION}/policies`,
    planBasedRateLimit,
    policyRoutes
);
app.use(
    `/api/${config.API_VERSION}/presigned`,
    planBasedRateLimit,
    presignedRoutes
);
app.use(`/api/${config.API_VERSION}/batch`, planBasedRateLimit, batchRoutes);
app.use(`/api/${config.API_VERSION}/team`, planBasedRateLimit, teamRoutes);
app.use(`/api/${config.API_VERSION}/services`, serviceRoutes); // Service management (admin only)

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.PORT;

const startServer = async () => {
    try {
        // Test database connection
        await pool.query("SELECT NOW()");
        logger.info("Database connected successfully");

        // Bootstrap microservices architecture
        logger.info("Bootstrapping services...");
        await bootstrapServices("monolith"); // Change to 'microservice' for distributed mode

        // Start billing scheduler
        logger.info("Initializing billing scheduler...");
        startBillingScheduler();

        // Start server with retry on EADDRINUSE (helpful in dev when port already in use)
        const tryListen = (port, attemptsLeft = 5) => {
            const server = app.listen(port, () => {
                logger.info("Hypz Storage API Server Running", {
                    environment: config.NODE_ENV,
                    url: `http://localhost:${port}`,
                    apiVersion: config.API_VERSION,
                    health: `http://localhost:${port}/health`,
                    apiEndpoint: `/api/${config.API_VERSION}`,
                });
            });

            server.on("error", (err) => {
                if (err && err.code === "EADDRINUSE" && attemptsLeft > 0) {
                    logger.warn(
                        { err, port },
                        `Port ${port} already in use - trying port ${
                            port + 1
                        } (attempts left: ${attemptsLeft - 1})`
                    );
                    // Close this server and try the next port
                    tryListen(port + 1, attemptsLeft - 1);
                } else if (err && err.code === "EADDRINUSE") {
                    logger.error(
                        { err, port },
                        `Port ${port} already in use and no retries left. Exiting.`
                    );
                    process.exit(1);
                } else if (err) {
                    logger.error({ err }, "Server error");
                    process.exit(1);
                }
            });
        };

        tryListen(PORT, 5);
    } catch (error) {
        logger.error({ err: error }, "Failed to start server");
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    logger.error({ err }, "Unhandled Promise Rejection");
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    logger.error({ err }, "Uncaught Exception");
    process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    logger.info("SIGTERM received. Shutting down gracefully...");
    await shutdownServices();
    await pool.end();
    process.exit(0);
});

process.on("SIGINT", async () => {
    logger.info("SIGINT received. Shutting down gracefully...");
    await shutdownServices();
    await pool.end();
    process.exit(0);
});

// Start the server
startServer();

export default app;
