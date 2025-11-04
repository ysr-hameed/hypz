import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/config.js';
import pool from './config/database.js';
import {
  corsOptions,
  helmetConfig,
  compressionConfig,
  apiLimiter,
  errorHandler,
  notFound,
  requestLogger,
  sanitizeData
} from './middleware/security.js';
import { performanceMonitor } from './middleware/performance.js';
import { planBasedRateLimit, globalRateLimit } from './middleware/rateLimiter.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import twoFactorRoutes from './routes/twoFactorRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import configRoutes from './routes/configRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bucketRoutes from './routes/bucketRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import usageRoutes from './routes/usageRoutes.js';
import planRoutes from './routes/planRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Services
import { startBillingScheduler } from './services/billingCron.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Performance monitoring
app.use(performanceMonitor);

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(...sanitizeData);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compressionConfig);

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Custom request logger
app.use(requestLogger);

// Static files (for uploaded files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// API version endpoint
app.get(`/api/${config.API_VERSION}`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hypz Storage API',
    version: config.API_VERSION,
    documentation: `${config.FRONTEND_URL}/docs`
  });
});

// Handle preflight requests globally
app.options('*', cors(corsOptions));

// Apply global rate limiting to API routes (IP-based for unauthenticated)
app.use(`/api/${config.API_VERSION}`, globalRateLimit(20)); // 20 req/s for unauthenticated

// API Routes - Plan-based rate limiting applied after authentication in routes
app.use(`/api/${config.API_VERSION}/config`, configRoutes);
app.use(`/api/${config.API_VERSION}/auth`, authRoutes);
app.use(`/api/${config.API_VERSION}/auth`, twoFactorRoutes);
app.use(`/api/${config.API_VERSION}/oauth`, oauthRoutes);
app.use(`/api/${config.API_VERSION}/admin`, adminRoutes);
app.use(`/api/${config.API_VERSION}/buckets`, planBasedRateLimit, bucketRoutes);
app.use(`/api/${config.API_VERSION}/files`, planBasedRateLimit, fileRoutes);
app.use(`/api/${config.API_VERSION}/api-keys`, planBasedRateLimit, apiKeyRoutes);
app.use(`/api/${config.API_VERSION}/usage`, planBasedRateLimit, usageRoutes);
app.use(`/api/${config.API_VERSION}/plans`, planRoutes);
app.use(`/api/${config.API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${config.API_VERSION}/subscriptions`, subscriptionRoutes);
app.use(`/api/${config.API_VERSION}/user`, planBasedRateLimit, userRoutes);
app.use(`/api/${config.API_VERSION}/notifications`, planBasedRateLimit, notificationRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.PORT;

const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    
    // Start billing scheduler
    console.log('💰 Initializing billing scheduler...');
    startBillingScheduler();

    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ═══════════════════════════════════════════════════════════');
      console.log(`🚀 Hypz Storage API Server Running`);
      console.log('🚀 ═══════════════════════════════════════════════════════════');
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 Server URL: http://localhost:${PORT}`);
      console.log(`📡 API Version: ${config.API_VERSION}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 API Endpoint: http://localhost:${PORT}/api/${config.API_VERSION}`);
      console.log('🚀 ═══════════════════════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();

export default app;
