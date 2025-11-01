import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from '../config/config.js';

let razorpay = null;

// Initialize Razorpay
const initializeRazorpay = () => {
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️  Razorpay credentials not configured');
    return null;
  }

  razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET
  });

  console.log('✅ Razorpay initialized successfully');
  return razorpay;
};

// Create order
export const createRazorpayOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
  try {
    if (!razorpay) {
      initializeRazorpay();
    }

    if (!razorpay) {
      throw new Error('Razorpay not initialized');
    }

    const options = {
      amount: amount * 100, // Amount in smallest currency unit (paise)
      currency: currency,
      receipt: receipt,
      notes: notes
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Verify payment signature
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return false;
  }
};

// Verify webhook signature
export const verifyRazorpayWebhook = (payload, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying Razorpay webhook:', error);
    return false;
  }
};

// Fetch payment details
export const getRazorpayPayment = async (paymentId) => {
  try {
    if (!razorpay) {
      initializeRazorpay();
    }

    if (!razorpay) {
      throw new Error('Razorpay not initialized');
    }

    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching Razorpay payment:', error);
    throw error;
  }
};

// Create refund
export const createRazorpayRefund = async (paymentId, amount = null) => {
  try {
    if (!razorpay) {
      initializeRazorpay();
    }

    if (!razorpay) {
      throw new Error('Razorpay not initialized');
    }

    const options = amount ? { amount: amount * 100 } : {};
    const refund = await razorpay.payments.refund(paymentId, options);
    return refund;
  } catch (error) {
    console.error('Error creating Razorpay refund:', error);
    throw error;
  }
};

// Initialize on module load
initializeRazorpay();

export default {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyRazorpayWebhook,
  getRazorpayPayment,
  createRazorpayRefund
};
