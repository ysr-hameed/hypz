import {
  getStats,
  getAllUsers,
  getUserDetails,
  updateUserPlan,
  toggleUserStatus,
  getAdminLogs,
  deleteUser
} from '../controllers/adminController.js';
import { adminAuth } from '../middleware/auth.js';

export default async function adminRoutes(fastify, options) {
  // All routes require admin authentication
  fastify.addHook('preHandler', adminAuth);

  fastify.get('/stats', getStats);
  fastify.get('/users', getAllUsers);
  fastify.get('/users/:userId', getUserDetails);
  fastify.put('/users/:userId/plan', updateUserPlan);
  fastify.put('/users/:userId/status', toggleUserStatus);
  fastify.delete('/users/:userId', deleteUser);
  fastify.get('/logs', getAdminLogs);
}
