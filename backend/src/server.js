import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/env.js';
import { apiLimiter } from './middlewares/limiter.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

// Routes
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import billingRoutes from './routes/billing.js';
import statsRoutes from './routes/stats.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/usage', statsRoutes);
app.use('/api/admin', adminRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Hypz Storage API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      files: '/api/files',
      billing: '/api/billing',
      usage: '/api/usage',
      admin: '/api/admin',
    },
    documentation: '/api/docs',
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

export default app;
