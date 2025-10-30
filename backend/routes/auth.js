import {
  register,
  login,
  verifyTwoFactor,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  logout
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

export default async function authRoutes(fastify, options) {
  // Public routes
  fastify.post('/register', register);
  fastify.post('/login', login);
  fastify.post('/verify-2fa', verifyTwoFactor);
  fastify.get('/verify-email', verifyEmail);
  fastify.post('/forgot-password', forgotPassword);
  fastify.post('/reset-password', resetPassword);

  // Protected routes
  fastify.get('/me', { preHandler: authenticate }, getMe);
  fastify.post('/logout', { preHandler: authenticate }, logout);
}
