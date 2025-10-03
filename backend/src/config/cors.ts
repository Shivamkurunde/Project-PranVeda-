/**
 * CORS Configuration
 * Handles cross-origin resource sharing for the API
 */

import cors from 'cors';
import { env, getCorsOrigins } from './env.js';

/**
 * CORS options configuration
 */
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getCorsOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check for development localhost variations
    if (env.NODE_ENV === 'development') {
      const localhostPattern = /^https?:\/\/localhost(:\d+)?$/;
      if (localhostPattern.test(origin)) {
        return callback(null, true);
      }
    }
    
    // Reject origin
    console.warn(`🚫 CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  
  credentials: env.CORS_CREDENTIALS,
  
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
    'HEAD',
  ],
  
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-API-Key',
    'X-Client-Version',
  ],
  
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],
  
  optionsSuccessStatus: 200,
  
  maxAge: 86400, // 24 hours
};

/**
 * Create CORS middleware
 */
export function createCorsMiddleware() {
  return cors(corsOptions);
}

/**
 * CORS preflight handler for specific routes
 */
export function handleCorsPreflight(req: any, res: any, next: any) {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', corsOptions.methods?.join(', '));
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders?.join(', '));
    res.header('Access-Control-Allow-Credentials', corsOptions.credentials?.toString());
    res.header('Access-Control-Max-Age', corsOptions.maxAge?.toString());
    
    return res.status(200).end();
  }
  
  next();
}

/**
 * CORS error handler
 */
export function corsErrorHandler(error: any, req: any, res: any, next: any) {
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: 'Origin not allowed by CORS policy',
      origin: req.headers.origin,
      allowedOrigins: getCorsOrigins(),
    });
  }
  
  next(error);
}

/**
 * Development CORS options (more permissive)
 */
export const devCorsOptions: cors.CorsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['*'],
  exposedHeaders: ['*'],
  optionsSuccessStatus: 200,
};

/**
 * Production CORS options (strict)
 */
export const prodCorsOptions: cors.CorsOptions = {
  origin: getCorsOrigins(),
  credentials: env.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Client-Version',
  ],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

/**
 * Get appropriate CORS options based on environment
 */
export function getCorsOptions(): cors.CorsOptions {
  if (env.NODE_ENV === 'development') {
    return devCorsOptions;
  }
  
  return prodCorsOptions;
}

console.log('🌐 CORS Configuration:');
console.log(`  - Environment: ${env.NODE_ENV}`);
console.log(`  - Allowed Origins: ${getCorsOrigins().join(', ')}`);
console.log(`  - Credentials: ${env.CORS_CREDENTIALS}`);

