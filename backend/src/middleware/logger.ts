/**
 * Winston Logger Configuration
 * Centralized logging with multiple transports and formatting
 */

import winston from 'winston';
import { env } from '../config/env.js';
import path from 'path';
import fs from 'fs';

/**
 * Log levels
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Log colors for console output
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${
      info.stack ? `\n${info.stack}` : ''
    }`
  )
);

/**
 * Console format with colors
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${
      info.stack ? `\n${info.stack}` : ''
    }`
  )
);

/**
 * JSON format for production
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create logs directory if it doesn't exist
 */
const logsDir = path.dirname(env.LOG_FILE);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Define transports
 */
const transports: winston.transport[] = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    level: env.LOG_LEVEL,
    format: env.NODE_ENV === 'production' ? jsonFormat : consoleFormat,
    silent: false,
  })
);

// File transport for errors
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: jsonFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true,
  })
);

// File transport for all logs
transports.push(
  new winston.transports.File({
    filename: env.LOG_FILE,
    level: env.LOG_LEVEL,
    format: jsonFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true,
  })
);

// Production-specific transports
if (env.NODE_ENV === 'production') {
  // Add additional production transports here
  // e.g., remote logging services, database logging, etc.
}

/**
 * Create logger instance
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels,
  format: logFormat,
  transports,
  exitOnError: false,
  silent: false,
});

/**
 * HTTP request logger middleware
 */
export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    if (!env.ENABLE_REQUEST_LOGGING) {
      return next();
    }

    const start = Date.now();
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add request ID to headers
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    // Log request
    logger.http('Incoming Request', {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.uid,
      timestamp: new Date().toISOString(),
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk: any, encoding?: any) {
      const duration = Date.now() - start;
      
      logger.http('Response Sent', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('Content-Length') || 0,
        userId: req.user?.uid,
        timestamp: new Date().toISOString(),
      });

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * Security event logger
 */
export function logSecurityEvent(event: string, details: any) {
  logger.warn('Security Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Authentication event logger
 */
export function logAuthEvent(event: string, userId?: string, details?: any) {
  logger.info('Authentication Event', {
    event,
    userId,
    details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Business logic event logger
 */
export function logBusinessEvent(event: string, userId?: string, details?: any) {
  logger.info('Business Event', {
    event,
    userId,
    details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Performance logger
 */
export function logPerformance(operation: string, duration: number, details?: any) {
  logger.info('Performance', {
    operation,
    duration: `${duration}ms`,
    details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Database query logger
 */
export function logDatabaseQuery(query: string, duration?: number, error?: any) {
  const level = error ? 'error' : 'debug';
  logger[level]('Database Query', {
    query: query.replace(/\s+/g, ' ').trim(),
    duration: duration ? `${duration}ms` : undefined,
    error: error?.message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * External API logger
 */
export function logExternalAPI(service: string, endpoint: string, duration?: number, error?: any) {
  const level = error ? 'error' : 'info';
  logger[level]('External API Call', {
    service,
    endpoint,
    duration: duration ? `${duration}ms` : undefined,
    error: error?.message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Error context logger
 */
export function logErrorWithContext(error: Error, context: any) {
  logger.error('Error with Context', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Create child logger with default context
 */
export function createChildLogger(defaultContext: any) {
  return logger.child(defaultContext);
}

/**
 * Graceful shutdown handler for logger
 */
export function closeLogger(): Promise<void> {
  return new Promise((resolve) => {
    logger.end(() => {
      console.log('Logger closed gracefully');
      resolve();
    });
  });
}

// Log startup
logger.info('Logger initialized', {
  level: env.LOG_LEVEL,
  environment: env.NODE_ENV,
  logFile: env.LOG_FILE,
  enableRequestLogging: env.ENABLE_REQUEST_LOGGING,
});

console.log('📝 Logger middleware configured');

