import {
  updateProfile,
  setup2FA,
  enable2FA,
  disable2FA,
  getSessions,
  revokeSession
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

export default async function userRoutes(fastify, options) {
  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  fastify.put('/profile', updateProfile);
  
  // 2FA routes
  fastify.post('/2fa/setup', setup2FA);
  fastify.post('/2fa/enable', enable2FA);
  fastify.post('/2fa/disable', disable2FA);

  // Session management
  fastify.get('/sessions', getSessions);
  fastify.delete('/sessions/:sessionId', revokeSession);
}
