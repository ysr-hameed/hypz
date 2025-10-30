import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Billing } from '../models/Billing.js';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export const getPlans = async (req, res, next) => {
  try {
    const plans = Object.entries(config.plans).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: plan.price,
      currency: 'INR',
      features: {
        storage: plan.storage,
        bandwidth: plan.bandwidth,
        maxFileSize: plan.maxFileSize,
        apiCalls: plan.apiCalls,
      },
    }));

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    logger.error('Get plans error', error);
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { plan } = req.validatedBody;
    const user = req.user;

    const planDetails = config.plans[plan];
    if (!planDetails) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected',
      });
    }

    if (plan === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create order for free plan',
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: planDetails.price * 100, // Amount in paise
      currency: 'INR',
      receipt: `order_${user.id}_${Date.now()}`,
      notes: {
        userId: user.id,
        plan: plan,
      },
    });

    // Save billing record
    const billing = await Billing.create(
      user.id,
      plan,
      planDetails.price,
      order.id
    );

    logger.info('Payment order created', {
      userId: user.id,
      orderId: order.id,
      plan,
      amount: planDetails.price,
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        billingId: billing.id,
        razorpayKeyId: config.razorpay.keyId,
      },
    });
  } catch (error) {
    logger.error('Create order error', error);
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Find billing record
    const billing = await Billing.findByRazorpayOrderId(razorpayOrderId);
    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found',
      });
    }

    // Update billing record
    await Billing.updatePayment(
      billing.id,
      razorpayPaymentId,
      razorpaySignature,
      'completed'
    );

    // Update user plan
    await User.updatePlan(billing.user_id, billing.plan);

    logger.info('Payment verified successfully', {
      userId: billing.user_id,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      plan: billing.plan,
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        plan: billing.plan,
      },
    });
  } catch (error) {
    logger.error('Verify payment error', error);
    next(error);
  }
};

export const getBillingHistory = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const billingHistory = await Billing.findByUser(
      req.user.id,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: billingHistory.map(record => ({
        id: record.id,
        plan: record.plan,
        amount: parseFloat(record.amount),
        currency: record.currency,
        status: record.status,
        razorpayOrderId: record.razorpay_order_id,
        razorpayPaymentId: record.razorpay_payment_id,
        createdAt: record.created_at,
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get billing history error', error);
    next(error);
  }
};

export const getBillingStats = async (req, res, next) => {
  try {
    const stats = await Billing.getStats(req.user.id);

    res.json({
      success: true,
      data: {
        totalTransactions: parseInt(stats.total_transactions),
        totalSpent: parseFloat(stats.total_spent),
        currentPlan: req.user.plan,
      },
    });
  } catch (error) {
    logger.error('Get billing stats error', error);
    next(error);
  }
};

export default {
  getPlans,
  createOrder,
  verifyPayment,
  getBillingHistory,
  getBillingStats,
};
