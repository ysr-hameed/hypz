/**
 * Service Management Routes
 *
 * Admin routes for monitoring and managing microservices
 */

import express from "express";
import {
    getServicesStatus,
    getServicesHealth,
    getServiceStatus,
    getServiceHealth,
    getServiceMetrics,
    restartService,
    getSystemOverview,
} from "../controllers/serviceController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All service management routes require admin authentication
router.use(authenticate);
router.use(requireRole("admin"));

// System overview
router.get("/system/overview", getSystemOverview);

// All services
router.get("/services/status", getServicesStatus);
router.get("/services/health", getServicesHealth);

// Specific service
router.get("/services/:serviceName/status", getServiceStatus);
router.get("/services/:serviceName/health", getServiceHealth);
router.get("/services/:serviceName/metrics", getServiceMetrics);
router.post("/services/:serviceName/restart", restartService);

export default router;
