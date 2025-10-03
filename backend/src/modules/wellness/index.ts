/**
 * Wellness Module
 * Centralized exports for wellness functionality (meditation, workout, progress, gamification)
 */

// Controllers
export { MeditationController } from './controllers/meditation.controller.js';
export { WorkoutController } from './controllers/workout.controller.js';
export { ProgressController } from './controllers/progress.controller.js';
export { GamificationController } from './controllers/gamification.controller.js';

// Services
export { MeditationService } from './services/meditation.service.js';
export { WorkoutService } from './services/workout.service.js';
export { ProgressService } from './services/progress.service.js';
export { GamificationService } from './services/gamification.service.js';

// Routes
export { default as meditationRoutes } from './routes/meditation.routes.js';
export { default as workoutRoutes } from './routes/workout.routes.js';
export { default as progressRoutes } from './routes/progress.routes.js';
export { default as gamificationRoutes } from './routes/gamification.routes.js';
