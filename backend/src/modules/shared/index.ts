/**
 * Shared Module
 * Centralized exports for shared functionality (audio, health, email)
 */

// Controllers
export { AudioController } from './controllers/audio.controller.js';
export { HealthController } from './controllers/health.controller.js';

// Services
export { AudioService } from './services/audio.service.js';
export { HealthService } from './services/health.service.js';
export { emailService } from './services/email.service.js';

// Routes
export { default as audioRoutes } from './routes/audio.routes.js';
export { default as healthRoutes } from './routes/health.routes.js';
