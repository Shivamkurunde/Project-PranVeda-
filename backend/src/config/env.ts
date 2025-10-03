/**
 * Environment Configuration
 * Validates and exports environment variables with proper types
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: './backend.env' });

/**
 * Environment validation schema using Zod
 */
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('5000'),
  FRONTEND_URL: z.string().url().default('http://localhost:8082'),

  // Firebase Configuration
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),

  // Supabase Configuration
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // JWT Configuration
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('900'), // 15 minutes
  JWT_REFRESH_EXPIRES_IN: z.string().default('2592000'), // 30 days

  // AI Configuration
  GEMINI_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Security Configuration
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  CORS_ORIGIN: z.string().default('http://localhost:8082'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),

  // File Upload Configuration
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('10485760'),
  UPLOAD_PATH: z.string().default('./uploads'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/gif,audio/mpeg,audio/wav'),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
  LOG_FILE: z.string().default('./logs/app.log'),
  ENABLE_REQUEST_LOGGING: z.string().transform(val => val === 'true').default('true'),

  // Monitoring Configuration
  HEALTH_CHECK_INTERVAL: z.string().transform(Number).pipe(z.number().positive()).default('30000'),
  ENABLE_METRICS: z.string().transform(val => val === 'true').default('true'),
  METRICS_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('9090'),

  // Development Configuration
  ENABLE_DEBUG_ROUTES: z.string().transform(val => val === 'true').default('true'),
  ENABLE_SWAGGER_DOCS: z.string().transform(val => val === 'true').default('true'),
  MOCK_EXTERNAL_APIS: z.string().transform(val => val === 'true').default('false'),

  // Email Configuration (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  SMTP_SECURE: z.string().transform(val => val === 'true').optional(),
  SMTP_USERNAME: z.string().email().optional(),
  SMTP_PASSWORD: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  FROM_NAME: z.string().optional(),
});

/**
 * Parse and validate environment variables
 */
function validateEnv() {
  try {
    const parsedEnv = envSchema.parse(process.env);
    
    // Additional validation for AI API keys
    if (!parsedEnv.GEMINI_API_KEY && !parsedEnv.DEEPSEEK_API_KEY && !parsedEnv.OPENAI_API_KEY) {
      console.warn('⚠️  No AI API keys found. AI features will be disabled.');
    }

    // Validate file upload path
    if (parsedEnv.UPLOAD_PATH && !parsedEnv.UPLOAD_PATH.startsWith('./')) {
      throw new Error('UPLOAD_PATH must be a relative path starting with "./"');
    }

    return parsedEnv;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('  -', error);
    }
    process.exit(1);
  }
}

/**
 * Validated environment configuration
 */
export const env = validateEnv();

/**
 * Type-safe environment configuration
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Check if running in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in test mode
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Get AI provider preference
 */
export const getAIProvider = (): 'gemini' | 'deepseek' | 'openai' | null => {
  if (env.GEMINI_API_KEY) return 'gemini';
  if (env.DEEPSEEK_API_KEY) return 'deepseek';
  if (env.OPENAI_API_KEY) return 'openai';
  return null;
};

/**
 * Get allowed file types as array
 */
export const getAllowedFileTypes = (): string[] => {
  return env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim());
};

/**
 * Get CORS origins as array
 */
export const getCorsOrigins = (): string[] => {
  return env.CORS_ORIGIN.split(',').map(origin => origin.trim());
};

// Log configuration summary
console.log('🔧 Environment Configuration Loaded:');
console.log(`  - Environment: ${env.NODE_ENV}`);
console.log(`  - Port: ${env.PORT}`);
console.log(`  - Frontend URL: ${env.FRONTEND_URL}`);
console.log(`  - AI Provider: ${getAIProvider() || 'None'}`);
console.log(`  - Rate Limiting: ${env.RATE_LIMIT_MAX_REQUESTS} req/${env.RATE_LIMIT_WINDOW_MS}ms`);
console.log(`  - CORS Origins: ${getCorsOrigins().join(', ')}`);

