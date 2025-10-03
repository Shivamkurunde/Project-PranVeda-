/**
 * PranVeda Backend Server
 * Main entry point for the API server
 */

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env, isDevelopment } from './config/env.js';
import { initializeFirebase } from './config/firebase.js';
import { initializeSupabase } from './config/supabase.js';
import { createCorsMiddleware, corsErrorHandler } from './config/cors.js';
import { logger, createRequestLogger } from './middleware/logger.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalRateLimit } from './middleware/rateLimiter.js';
import { sanitizeRequest } from './middleware/validator.js';

// Import modular routes
import { authRoutes } from './modules/auth/index.js';
import { userRoutes } from './modules/user/index.js';
import { 
  meditationRoutes, 
  workoutRoutes, 
  progressRoutes, 
  gamificationRoutes 
} from './modules/wellness/index.js';
import { aiRoutes } from './modules/ai/index.js';
import { audioRoutes, healthRoutes } from './modules/shared/index.js';

/**
 * Initialize Express application
 */
const app = express();

/**
 * Trust proxy for accurate IP addresses
 */
app.set('trust proxy', 1);

/**
 * Security middleware
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.gemini.google.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

/**
 * Compression middleware
 */
app.use(compression());

/**
 * CORS middleware
 */
app.use(createCorsMiddleware());
app.use(corsErrorHandler);

/**
 * Request logging middleware
 */
if (env.ENABLE_REQUEST_LOGGING) {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  }));
  app.use(createRequestLogger());
}

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Input sanitization middleware
 */
app.use(sanitizeRequest);

/**
 * Rate limiting middleware
 */
app.use(generalRateLimit);

/**
 * Health check endpoint (before auth middleware)
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PranVeda Backend is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV,
  });
});

/**
 * API routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meditation', meditationRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/health', healthRoutes);

/**
 * Development routes (only in development)
 */
if (isDevelopment && env.ENABLE_DEBUG_ROUTES) {
  app.get('/api/debug/info', (req, res) => {
    res.json({
      success: true,
      data: {
        environment: env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.get('/api/debug/routes', (req, res) => {
    const routes = app._router?.stack
      ?.filter((layer: any) => layer.route)
      ?.map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      })) || [];
    
    res.json({
      success: true,
      data: routes,
    });
  });
}

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to PranVeda Zen Flow API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
    timestamp: new Date().toISOString(),
  });
});

/**
 * 404 handler for undefined routes
 */
app.use(notFoundHandler);

/**
 * Global error handler (must be last)
 */
app.use(globalErrorHandler);

/**
 * Initialize services
 */
async function initializeServices() {
  try {
    logger.info('Initializing services...');
    
    // Initialize Firebase Admin SDK
    await initializeFirebase();
    
    // Initialize Supabase client
    await initializeSupabase();
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

/**
 * Start server
 */
async function startServer() {
  try {
    // Initialize services first
    await initializeServices();
    
    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info('🚀 PranVeda Backend Server Started', {
        port: env.PORT,
        environment: env.NODE_ENV,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      });
      
      console.log('\n🎯 PranVeda Zen Flow Backend');
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Port: ${env.PORT}`);
      console.log(`   Frontend URL: ${env.FRONTEND_URL}`);
      console.log(`   Health Check: http://localhost:${env.PORT}/health`);
      console.log(`   API Base: http://localhost:${env.PORT}/api`);
      
      if (isDevelopment) {
        console.log(`   Debug Info: http://localhost:${env.PORT}/api/debug/info`);
      }
      
      console.log('\n✨ Ready to serve wellness! 🧘‍♀️💪\n');
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          // Close any other connections (database, etc.)
          logger.info('Closing connections...');
          
          // Add cleanup logic here if needed
          
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
  process.exit(1);
});

// Start the server
startServer();

