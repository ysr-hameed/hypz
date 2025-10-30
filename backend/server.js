import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import oauthRoutes from './routes/oauth.js';
import userRoutes from './routes/user.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'error' : 'info'
  },
  trustProxy: true,
  bodyLimit: 10485760, // 10MB
});

// Register plugins
await fastify.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
});

await fastify.register(cors, {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
});

await fastify.register(cookie, {
  secret: process.env.JWT_SECRET,
  parseOptions: {}
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes',
  cache: 10000,
  allowList: ['127.0.0.1'],
  redis: null,
  skipOnError: true,
  nameSpace: 'fastify-rate-limit-',
  continueExceeding: true,
  enableDraftSpec: true,
  addHeadersOnExceeding: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true
  },
  addHeaders: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true,
    'retry-after': true
  }
});

await fastify.register(multipart, {
  limits: {
    fileSize: 5242880, // 5MB
    files: 1
  }
});

// Health check route
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
});

// API routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(oauthRoutes, { prefix: '/api/auth' });
fastify.register(userRoutes, { prefix: '/api/user' });
fastify.register(paymentRoutes, { prefix: '/api/payment' });
fastify.register(adminRoutes, { prefix: '/api/admin-ysr' });

// 404 handler
fastify.setNotFoundHandler(notFound);

// Error handler
fastify.setErrorHandler(errorHandler);

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 5000;
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    
    await fastify.listen({ port, host });
    
    console.log('\n🚀 Server is running!');
    console.log(`📍 URL: http://${host}:${port}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 Admin route: http://${host}:${port}/api/admin-ysr`);
    console.log('\n✨ Ready to accept requests!\n');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received, closing server gracefully...`);
    await fastify.close();
    process.exit(0);
  });
});

start();
