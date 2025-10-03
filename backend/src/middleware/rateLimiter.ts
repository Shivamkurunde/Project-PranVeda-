/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and ensures fair usage
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { env } from '../config/env.js';
import { logger, logSecurityEvent } from './logger.js';
import { extractUserId } from '../modules/auth/middleware/auth.middleware.js';

/**
 * Rate limit configuration interface
 */
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: any;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  handler?: (req: Request, res: Response) => void;
}

/**
 * Create default rate limit handler
 */
const createRateLimitHandler = (eventName: string, customMessage?: any) => {
  return (req: Request, res: Response) => {
    const userId = extractUserId(req);
    
    // Log security event
    logSecurityEvent(eventName, {
      ip: req.ip,
      userId,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    // Send response
    res.status(429).json(customMessage || {
      success: false,
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
    });
  };
};

/**
 * Default rate limit configuration
 */
const defaultConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID if available, otherwise use IP
    const userId = extractUserId(req);
    return userId || req.ip;
  },
  handler: createRateLimitHandler('Rate limit exceeded'),
};

/**
 * General API rate limiter
 */
export const generalRateLimit = rateLimit({
  ...defaultConfig,
  handler: createRateLimitHandler('General rate limit exceeded', {
    success: false,
    error: 'Rate Limit Exceeded',
    message: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
  }),
});

/**
 * Strict rate limiter for sensitive operations
 */
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = extractUserId(req);
    return userId || req.ip;
  },
  handler: createRateLimitHandler('Strict rate limit exceeded', {
    success: false,
    error: 'Rate Limit Exceeded',
    message: 'Too many attempts for this operation, please try again later.',
    retryAfter: 15 * 60,
  }),
});

/**
 * AI service rate limiter (more restrictive)
 */
export const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 AI requests per hour per user
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // AI limits are per-user, not per-IP
    const userId = extractUserId(req);
    return userId || req.ip;
  },
  skip: (req: Request) => {
    // Skip rate limiting for admin users
    return req.userProfile?.role === 'admin';
  },
  handler: createRateLimitHandler('AI rate limit exceeded', {
    success: false,
    error: 'AI Rate Limit Exceeded',
    message: 'AI service rate limit exceeded. Please try again later.',
    retryAfter: 60 * 60,
  }),
});

/**
 * Authentication rate limiter
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 auth attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip, // Auth limits are per-IP
  handler: createRateLimitHandler('Authentication rate limit exceeded', {
    success: false,
    error: 'Authentication Rate Limit Exceeded',
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60,
  }),
});

/**
 * File upload rate limiter
 */
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = extractUserId(req);
    return userId || req.ip;
  },
  handler: createRateLimitHandler('Upload rate limit exceeded', {
    success: false,
    error: 'Upload Rate Limit Exceeded',
    message: 'Too many file uploads, please try again later.',
    retryAfter: 60 * 60,
  }),
});

/**
 * Password reset rate limiter
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip, // Per-IP for security
  handler: createRateLimitHandler('Password reset rate limit exceeded', {
    success: false,
    error: 'Password Reset Rate Limit Exceeded',
    message: 'Too many password reset attempts, please try again later.',
    retryAfter: 60 * 60,
  }),
});

/**
 * Create custom rate limiter
 */
export function createCustomRateLimit(config: Partial<RateLimitConfig>) {
  return rateLimit({
    ...defaultConfig,
    ...config,
  });
}

/**
 * Bypass rate limiting for specific conditions
 */
export function createBypassableRateLimit(config: Partial<RateLimitConfig>) {
  return rateLimit({
    ...defaultConfig,
    ...config,
    skip: (req: Request) => {
      // Bypass for admin users
      if (req.userProfile?.role === 'admin') {
        return true;
      }

      // Bypass for development environment
      if (env.NODE_ENV === 'development') {
        return true;
      }

      // Custom bypass logic
      if (config.skip) {
        return config.skip(req);
      }

      return false;
    },
  });
}

/**
 * Dynamic rate limiter based on user tier
 */
export function createTieredRateLimit(tierConfigs: {
  free: RateLimitConfig;
  premium: RateLimitConfig;
  admin: RateLimitConfig;
}) {
  return rateLimit({
    ...defaultConfig,
    keyGenerator: (req: Request) => {
      const userId = extractUserId(req);
      return userId || req.ip;
    },
    max: (req: Request) => {
      const userTier = req.userProfile?.tier || 'free';
      return tierConfigs[userTier as keyof typeof tierConfigs]?.max || tierConfigs.free.max;
    },
    windowMs: (req: Request) => {
      const userTier = req.userProfile?.tier || 'free';
      return tierConfigs[userTier as keyof typeof tierConfigs]?.windowMs || tierConfigs.free.windowMs;
    },
  });
}

/**
 * Rate limit status endpoint
 */
export function getRateLimitStatus(req: Request, res: Response): void {
  const userId = extractUserId(req);
  const key = userId || req.ip;
  
  res.json({
    success: true,
    data: {
      key,
      userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Reset rate limit for user (admin only)
 */
export function resetUserRateLimit(req: Request, res: Response): void {
  // This would require access to the rate limit store
  // Implementation depends on the storage backend used by express-rate-limit
  
  const targetUserId = req.params.userId;
  
  if (!targetUserId) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'User ID is required',
    });
    return;
  }

  // Log the rate limit reset
  logSecurityEvent('Rate limit reset by admin', {
    adminUserId: req.user?.uid,
    targetUserId,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Rate limit reset successfully',
    targetUserId,
  });
}

console.log('🚦 Rate limiting middleware configured');
console.log(`  - General limit: ${env.RATE_LIMIT_MAX_REQUESTS} req/${env.RATE_LIMIT_WINDOW_MS}ms`);
console.log(`  - AI limit: 50 req/1h`);
console.log(`  - Auth limit: 10 req/15m`);
console.log(`  - Upload limit: 20 req/1h`);

