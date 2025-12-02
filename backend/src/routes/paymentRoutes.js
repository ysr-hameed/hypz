import express from "express";
import { authenticate, blockApiKeyAccess } from "../middleware/auth.js";
import {
    createSkydoPayment,
    getPaymentHistory,
} from "../controllers/paymentController.js";
import { handleSkydoWebhook } from "../controllers/skydoWebhookController.js";

const router = express.Router();

// Webhook routes (no auth - verified by signature)
// Use raw body parser for webhook so we can verify signature against the exact payload
router.post(
    "/webhook/skydo",
    express.raw({ type: "application/json" }),
    handleSkydoWebhook
);

// Authenticated routes - Block API key access (payments must be done via dashboard)
router.use(authenticate);
router.use(blockApiKeyAccess);

// Skydo routes
router.post("/checkout", createSkydoPayment);

// Get payment history
router.get("/history", getPaymentHistory);

export default router;
