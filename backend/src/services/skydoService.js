import axios from "axios";
import config from "../config/config.js";
import logger from "../utils/logger.js";
import crypto from "crypto";

/**
 * Skydo Payment Service
 *
 * This service handles all interactions with the Skydo payment API
 * including checkout creation, subscription management, and webhook verification.
 */

const SKYDO_API_BASE_URL = "https://api.skydo.com/v1";

// Create axios instance with default config
const skydoClient = axios.create({
    baseURL: SKYDO_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds
});

// Add request interceptor to add auth token
skydoClient.interceptors.request.use(
    (config) => {
        if (process.env.SKYDO_API_KEY) {
            config.headers[
                "Authorization"
            ] = `Bearer ${process.env.SKYDO_API_KEY}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
skydoClient.interceptors.response.use(
    (response) => response,
    (error) => {
        logger.error(
            {
                err: error.response?.data || error.message,
                status: error.response?.status,
                url: error.config?.url,
            },
            "Skydo API Error"
        );
        throw error;
    }
);

/**
 * Create a checkout session for a subscription
 * @param {string} planId - Internal plan ID
 * @param {object} options - Checkout options
 * @returns {Promise<object>} Checkout data with URL
 */
export const createSkydoCheckout = async (planId, options = {}) => {
    try {
        if (!config.SKYDO_API_KEY) {
            throw new Error(
                "Skydo is not configured. Please set SKYDO_API_KEY in your environment."
            );
        }

        if (!planId) {
            throw new Error("Plan ID is required");
        }

        logger.info(
            {
                planId,
                userId: options.userId,
                email: options.email,
            },
            "Creating Skydo checkout"
        );

        const checkoutPayload = {
            plan_id: planId,
            customer: {
                email: options.email,
                name: options.name,
            },
            metadata: {
                user_id: options.userId,
                plan_id: options.planId,
                plan_type: options.planType,
                auto_renew: options.autoRenew,
            },
            success_url: `${config.FRONTEND_URL}/billing?session=success`,
            cancel_url: `${config.FRONTEND_URL}/billing?session=cancelled`,
        };

        const response = await skydoClient.post("/checkouts", checkoutPayload);

        const checkoutData = response.data;

        if (!checkoutData || !checkoutData.id || !checkoutData.checkout_url) {
            throw new Error("Invalid response from Skydo API");
        }

        logger.info(
            {
                checkoutId: checkoutData.id,
                checkoutUrl: checkoutData.checkout_url,
            },
            "Skydo checkout created successfully"
        );

        return {
            id: checkoutData.id,
            url: checkoutData.checkout_url,
            status: checkoutData.status,
            ...checkoutData,
        };
    } catch (error) {
        logger.error({ err: error, planId }, "Error creating Skydo checkout");
        throw new Error(
            `Failed to create Skydo checkout: ${
                error.response?.data?.message || error.message
            }`
        );
    }
};

/**
 * Get subscription details from Skydo
 * @param {string} subscriptionId - Skydo subscription ID
 * @returns {Promise<object>} Subscription data
 */
export const getSkydoSubscription = async (subscriptionId) => {
    try {
        if (!config.SKYDO_API_KEY) {
            throw new Error("Skydo is not configured");
        }

        logger.info({ subscriptionId }, "Fetching Skydo subscription");

        const response = await skydoClient.get(
            `/subscriptions/${subscriptionId}`
        );

        return response.data;
    } catch (error) {
        logger.error(
            { err: error, subscriptionId },
            "Error getting Skydo subscription"
        );
        throw new Error(
            `Failed to get subscription: ${
                error.response?.data?.message || error.message
            }`
        );
    }
};

/**
 * Cancel a subscription
 * @param {string} subscriptionId - Skydo subscription ID
 * @param {boolean} immediate - Cancel immediately or at period end
 * @returns {Promise<object>} Updated subscription data
 */
export const cancelSkydoSubscription = async (
    subscriptionId,
    immediate = false
) => {
    try {
        if (!config.SKYDO_API_KEY) {
            throw new Error("Skydo is not configured");
        }

        logger.info(
            { subscriptionId, immediate },
            "Cancelling Skydo subscription"
        );

        const response = await skydoClient.post(
            `/subscriptions/${subscriptionId}/cancel`,
            {
                immediate: immediate,
            }
        );

        logger.info(
            { subscriptionId },
            "Skydo subscription cancelled successfully"
        );

        return response.data;
    } catch (error) {
        logger.error(
            { err: error, subscriptionId },
            "Error cancelling Skydo subscription"
        );
        throw new Error(
            `Failed to cancel subscription: ${
                error.response?.data?.message || error.message
            }`
        );
    }
};

/**
 * Resume a cancelled subscription
 * @param {string} subscriptionId - Skydo subscription ID
 * @returns {Promise<object>} Updated subscription data
 */
export const resumeSkydoSubscription = async (subscriptionId) => {
    try {
        if (!config.SKYDO_API_KEY) {
            throw new Error("Skydo is not configured");
        }

        logger.info({ subscriptionId }, "Resuming Skydo subscription");

        const response = await skydoClient.post(
            `/subscriptions/${subscriptionId}/resume`
        );

        logger.info(
            { subscriptionId },
            "Skydo subscription resumed successfully"
        );

        return response.data;
    } catch (error) {
        logger.error(
            { err: error, subscriptionId },
            "Error resuming Skydo subscription"
        );
        throw new Error(
            `Failed to resume subscription: ${
                error.response?.data?.message || error.message
            }`
        );
    }
};

/**
 * Create an invoice for usage-based billing
 * @param {string} customerId - Skydo customer ID
 * @param {number} amount - Amount in smallest currency unit (cents)
 * @param {string} description - Invoice description
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>} Invoice data
 */
export const createSkydoInvoice = async (
    customerId,
    amount,
    description,
    metadata = {}
) => {
    try {
        if (!config.SKYDO_API_KEY) {
            throw new Error("Skydo is not configured");
        }

        logger.info(
            { customerId, amount, description },
            "Creating Skydo invoice"
        );

        const invoicePayload = {
            customer_id: customerId,
            amount: Math.round(amount * 100), // Convert to cents
            currency: "usd",
            description: description,
            metadata: metadata,
            auto_charge: true, // Automatically charge the customer's default payment method
        };

        const response = await skydoClient.post("/invoices", invoicePayload);

        logger.info(
            {
                invoiceId: response.data.id,
                customerId,
                amount,
            },
            "Skydo invoice created successfully"
        );

        return response.data;
    } catch (error) {
        logger.error(
            { err: error, customerId },
            "Error creating Skydo invoice"
        );
        throw new Error(
            `Failed to create invoice: ${
                error.response?.data?.message || error.message
            }`
        );
    }
};

/**
 * Get customer details
 * @param {string} customerId - Skydo customer ID
 * @returns {Promise<object>} Customer data
 */
export const getSkydoCustomer = async (customerId) => {
    try {
        if (!config.SKYDO_API_KEY) {
            throw new Error("Skydo is not configured");
        }

        logger.info({ customerId }, "Fetching Skydo customer");

        const response = await skydoClient.get(`/customers/${customerId}`);

        return response.data;
    } catch (error) {
        logger.error(
            { err: error, customerId },
            "Error getting Skydo customer"
        );
        throw new Error(
            `Failed to get customer: ${
                error.response?.data?.message || error.message
            }`
        );
    }
};

/**
 * Create or update a customer
 * @param {object} customerData - Customer information
 * @returns {Promise<object>} Customer data
 */
export const createOrUpdateSkydoCustomer = async (customerData) => {
    try {
        if (!config.SKYDO_API_KEY) {
            throw new Error("Skydo is not configured");
        }

        logger.info(
            { email: customerData.email },
            "Creating/updating Skydo customer"
        );

        const payload = {
            email: customerData.email,
            name: customerData.name,
            metadata: customerData.metadata || {},
        };

        const response = await skydoClient.post("/customers", payload);

        logger.info(
            { customerId: response.data.id },
            "Skydo customer created/updated"
        );

        return response.data;
    } catch (error) {
        logger.error(
            { err: error, email: customerData.email },
            "Error creating/updating Skydo customer"
        );
        throw new Error(
            `Failed to create/update customer: ${
                error.response?.data?.message || error.message
            }`
        );
    }
};

/**
 * Verify webhook signature
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Webhook signature from headers
 * @returns {boolean} Whether signature is valid
 */
export const verifySkydoWebhook = (payload, signature) => {
    try {
        if (!config.SKYDO_WEBHOOK_SECRET) {
            logger.warn("Skydo webhook secret not configured");
            return false;
        }

        // Skydo uses HMAC-SHA256 for webhook signature
        const hmac = crypto.createHmac("sha256", config.SKYDO_WEBHOOK_SECRET);
        const digest = hmac.update(payload).digest("hex");
        const expectedSignature = `sha256=${digest}`;

        // Use constant-time comparison to prevent timing attacks
        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );

        if (!isValid) {
            logger.warn(
                {
                    receivedSignature: signature.substring(0, 20) + "...",
                    expectedPrefix: expectedSignature.substring(0, 20) + "...",
                },
                "Invalid Skydo webhook signature"
            );
        }

        return isValid;
    } catch (error) {
        logger.error({ err: error }, "Error verifying Skydo webhook signature");
        return false;
    }
};

/**
 * Get payment method details
 * @param {string} paymentMethodId - Skydo payment method ID
 * @returns {Promise<object>} Payment method data
 */
export const getSkydoPaymentMethod = async (paymentMethodId) => {
    try {
        if (!config.SKYDO_API_KEY) {
            throw new Error("Skydo is not configured");
        }

        logger.info({ paymentMethodId }, "Fetching Skydo payment method");

        const response = await skydoClient.get(
            `/payment-methods/${paymentMethodId}`
        );

        return response.data;
    } catch (error) {
        logger.error(
            { err: error, paymentMethodId },
            "Error getting Skydo payment method"
        );
        throw new Error(
            `Failed to get payment method: ${
                error.response?.data?.message || error.message
            }`
        );
    }
};

export default {
    createSkydoCheckout,
    getSkydoSubscription,
    cancelSkydoSubscription,
    resumeSkydoSubscription,
    createSkydoInvoice,
    getSkydoCustomer,
    createOrUpdateSkydoCustomer,
    verifySkydoWebhook,
    getSkydoPaymentMethod,
};
