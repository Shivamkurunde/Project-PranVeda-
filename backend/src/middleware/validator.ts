/**
 * Request Validation Middleware
 * Validates request data using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errorHandler.js';
import { logger } from './logger.js';

/**
 * Validation schema interface
 */
interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

/**
 * Validation options
 */
interface ValidationOptions {
  stripUnknown?: boolean;
  abortEarly?: boolean;
  allowUnknown?: boolean;
}

/**
 * Default validation options
 */
const defaultOptions: ValidationOptions = {
  stripUnknown: true,
  abortEarly: false,
  allowUnknown: false,
};

/**
 * Validate request data against Zod schemas
 */
export function validateRequest(
  schemas: ValidationSchemas,
  options: ValidationOptions = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const opts = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: any[] = [];

      // Validate request body
      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push({
              field: 'body',
              errors: formatZodErrors(error),
            });
          }
        }
      }

      // Validate query parameters
      if (schemas.query) {
        try {
          req.query = schemas.query.parse(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push({
              field: 'query',
              errors: formatZodErrors(error),
            });
          }
        }
      }

      // Validate route parameters
      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push({
              field: 'params',
              errors: formatZodErrors(error),
            });
          }
        }
      }

      // Validate headers
      if (schemas.headers) {
        try {
          req.headers = schemas.headers.parse(req.headers);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push({
              field: 'headers',
              errors: formatZodErrors(error),
            });
          }
        }
      }

      // If there are validation errors, throw them
      if (errors.length > 0) {
        const validationError = new ValidationError(
          'Request validation failed',
          errors
        );
        
        logger.warn('Request validation failed', {
          url: req.url,
          method: req.method,
          errors,
          userId: req.user?.uid,
          ip: req.ip,
        });
        
        throw validationError;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Format Zod errors for API response
 */
function formatZodErrors(error: ZodError): any[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    received: err.input,
  }));
}

/**
 * Common validation schemas
 */

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// UUID parameter schema
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

// User ID parameter schema
export const userIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Search schema
export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
});

/**
 * User profile validation schemas
 */
export const userProfileSchemas = {
  create: z.object({
    display_name: z.string().min(1).max(50).optional(),
    avatar_url: z.string().url().optional(),
    preferred_language: z.string().length(2).default('en'),
    wellness_goals: z.array(z.string()).max(10).default([]),
    experience_level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  }),
  
  update: z.object({
    display_name: z.string().min(1).max(50).optional(),
    avatar_url: z.string().url().optional(),
    preferred_language: z.string().length(2).optional(),
    wellness_goals: z.array(z.string()).max(10).optional(),
    experience_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  }),
};

/**
 * Meditation session validation schemas
 */
export const meditationSessionSchemas = {
  create: z.object({
    session_type: z.string().min(1).max(50),
    duration_minutes: z.number().min(1).max(480), // 8 hours max
  }),
  
  complete: z.object({
    duration_minutes: z.number().min(1).max(480).optional(),
    notes: z.string().max(500).optional(),
  }),
};

/**
 * Workout session validation schemas
 */
export const workoutSessionSchemas = {
  create: z.object({
    routine_type: z.string().min(1).max(50),
    expected_duration_minutes: z.number().min(1).max(180).optional(), // 3 hours max
  }),
  
  complete: z.object({
    reps_completed: z.number().min(0).optional(),
    duration_minutes: z.number().min(1).max(180).optional(),
    notes: z.string().max(500).optional(),
    calories_burned: z.number().min(0).optional(),
  }),
};

/**
 * AI interaction validation schemas
 */
export const aiInteractionSchemas = {
  moodAnalysis: z.object({
    text: z.string().min(1).max(1000),
    language: z.string().length(2).default('en'),
  }),
  
  chat: z.object({
    message: z.string().min(1).max(1000),
    conversation_id: z.string().uuid().optional(),
  }),
  
  recommendations: z.object({
    mood: z.enum(['very_negative', 'negative', 'neutral', 'positive', 'very_positive']),
    context: z.record(z.any()).optional(),
  }),
};

/**
 * Mood check-in validation schema
 */
export const moodCheckinSchema = z.object({
  mood_rating: z.number().min(1).max(5),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).max(5).optional(),
});

/**
 * File upload validation schemas
 */
export const fileUploadSchemas = {
  avatar: z.object({
    mimetype: z.enum(['image/jpeg', 'image/png', 'image/gif']),
    size: z.number().max(5 * 1024 * 1024), // 5MB
  }),
  
  audio: z.object({
    mimetype: z.enum(['audio/mpeg', 'audio/wav', 'audio/mp3']),
    size: z.number().max(50 * 1024 * 1024), // 50MB
  }),
};

/**
 * Authentication validation schemas
 */
export const authSchemas = {
  register: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    display_name: z.string().min(1).max(50).optional(),
  }),
  
  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  
  resetPassword: z.object({
    email: z.string().email(),
  }),
  
  changePassword: z.object({
    current_password: z.string().min(1),
    new_password: z.string().min(8).max(100),
  }),
};

/**
 * Gamification validation schemas
 */
export const gamificationSchemas = {
  triggerCelebration: z.object({
    event_type: z.enum(['meditation_complete', 'workout_complete', 'streak_milestone', 'badge_unlock']),
    data: z.record(z.any()).optional(),
  }),
  
  markCelebrationViewed: z.object({
    celebration_id: z.string().uuid(),
  }),
};

/**
 * Health check validation schemas
 */
export const healthCheckSchemas = {
  ping: z.object({
    timestamp: z.string().datetime().optional(),
  }),
};

/**
 * Custom validation middleware for specific use cases
 */
export function validateEmail(email: string): boolean {
  const emailSchema = z.string().email();
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validateUUID(uuid: string): boolean {
  const uuidSchema = z.string().uuid();
  try {
    uuidSchema.parse(uuid);
    return true;
  } catch {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  const passwordSchema = z.string().min(8).max(100);
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize input data
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Sanitization middleware
 */
export function sanitizeRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  
  next();
}

console.log('✅ Request validation middleware configured');

