import {
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback
} from '../controllers/oauthController.js';

export default async function oauthRoutes(fastify, options) {
  // Google OAuth
  fastify.get('/google', googleAuth);
  fastify.get('/google/callback', googleCallback);

  // GitHub OAuth
  fastify.get('/github', githubAuth);
  fastify.get('/github/callback', githubCallback);
}
