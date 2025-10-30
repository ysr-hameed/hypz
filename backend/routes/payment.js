import {
  getPlans,
  createOrder,
  verifyPayment,
  getSubscription,
  getPaymentHistory
} from '../controllers/paymentController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

export default async function paymentRoutes(fastify, options) {
  // Public routes
  fastify.get('/plans', { preHandler: optionalAuth }, getPlans);

  // Protected routes
  fastify.post('/create-order', { preHandler: authenticate }, createOrder);
  fastify.post('/verify-payment', { preHandler: authenticate }, verifyPayment);
  fastify.get('/subscription', { preHandler: authenticate }, getSubscription);
  fastify.get('/history', { preHandler: authenticate }, getPaymentHistory);
}
