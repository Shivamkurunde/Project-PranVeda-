/**
 * Authentication Module
 * Centralized exports for authentication functionality
 */

// Controllers
export { AuthController } from './controllers/auth.controller.js';

// Services
export { AuthService } from './services/auth.service.js';

// Middleware
export { authenticateToken, optionalAuth, requireProfile } from './middleware/auth.middleware.js';
export type { AuthenticatedRequest } from './middleware/auth.middleware.js';

// Routes
export { default as authRoutes } from './routes/auth.routes.js';

// Types
export * from './types/auth.types.js';
