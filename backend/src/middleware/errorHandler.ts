/**
 * Global Error Handler Middleware
 * Centralized error handling and logging
 */

import { Request, Response, NextFunction } from 'express';
import { env, isDevelopment } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: any;
  stack?: string;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
}

/**
 * Validation error class
 */
export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends APIError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends APIError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error class
 */
export class ConflictError extends APIError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit error class
 */
export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

/**
 * Database error class
 */
export class DatabaseError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 500, true, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

/**
 * External service error class
 */
export class ExternalServiceError extends APIError {
  constructor(service: string, message: string) {
    super(`${service}: ${message}`, 502, true, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
  }
}

/**
 * Format error response
 */
function formatErrorResponse(
  error: any,
  req: Request,
  res: Response
): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    error: error.name || 'Error',
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  // Add optional fields
  if (error.code) {
    response.code = error.code;
  }

  if (error.details) {
    response.details = error.details;
  }

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  // Add request ID if available
  if (req.headers['x-request-id']) {
    response.requestId = req.headers['x-request-id'] as string;
  }

  return response;
}

/**
 * Log error details
 */
function logError(error: any, req: Request): void {
  const errorInfo = {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode || 500,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.uid,
    requestId: req.headers['x-request-id'],
    timestamp: new Date().toISOString(),
  };

  if (error.statusCode >= 500) {
    logger.error('Server Error:', errorInfo);
  } else if (error.statusCode >= 400) {
    logger.warn('Client Error:', errorInfo);
  } else {
    logger.info('Error:', errorInfo);
  }
}

/**
 * Global error handler middleware
 */
export function globalErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logError(error, req);

  // Handle specific error types
  if (error instanceof APIError) {
    const response = formatErrorResponse(error, req, res);
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    const validationError = new ValidationError(
      'Validation failed',
      error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
    );
    const response = formatErrorResponse(validationError, req, res);
    res.status(400).json(response);
    return;
  }

  // Handle Firebase errors
  if (error.code && error.code.startsWith('auth/')) {
    const authError = new AuthenticationError(error.message);
    const response = formatErrorResponse(authError, req, res);
    res.status(401).json(response);
    return;
  }

  // Handle Supabase errors
  if (error.code && error.code.startsWith('PGRST')) {
    const dbError = new DatabaseError(error.message, {
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    const response = formatErrorResponse(dbError, req, res);
    res.status(500).json(response);
    return;
  }

  // Handle rate limit errors
  if (error.statusCode === 429) {
    const rateLimitError = new RateLimitError(error.message);
    const response = formatErrorResponse(rateLimitError, req, res);
    res.status(429).json(response);
    return;
  }

  // Handle multer errors (file upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    const fileError = new ValidationError('File size too large');
    const response = formatErrorResponse(fileError, req, res);
    res.status(400).json(response);
    return;
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    const fileError = new ValidationError('Too many files');
    const response = formatErrorResponse(fileError, req, res);
    res.status(400).json(response);
    return;
  }

  // Default error handling
  const defaultError = new APIError(
    isDevelopment ? error.message : 'Internal server error',
    error.statusCode || 500,
    false,
    'INTERNAL_ERROR'
  );

  const response = formatErrorResponse(defaultError, req, res);
  res.status(defaultError.statusCode).json(response);
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  const response = formatErrorResponse(error, req, res);
  res.status(404).json(response);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Error boundary for unhandled promise rejections
 */
export function handleUnhandledRejection(reason: any, promise: Promise<any>): void {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString(),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Error boundary for uncaught exceptions
 */
export function handleUncaughtException(error: Error): void {
  logger.error('Uncaught Exception:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  // Exit process after logging
  process.exit(1);
}

// Set up global error handlers
process.on('unhandledRejection', handleUnhandledRejection);
process.on('uncaughtException', handleUncaughtException);

console.log('⚠️  Error handling middleware configured');

