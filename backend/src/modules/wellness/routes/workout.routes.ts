/**
 * Workout Routes
 */

import { Router } from 'express';
import { workoutController } from '../controllers/workout.controller.js';
import { authenticateToken, requireProfile } from '../../auth/middleware/auth.middleware.js';
import { validateRequest, workoutSessionSchemas } from '../../../middleware/validator.js';
import { asyncHandler } from '../../../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

router.get(
  '/routines',
  authenticateToken,
  validateRequest({
    query: z.object({
      category: z.string().optional(),
      difficulty: z.string().optional(),
      duration: z.string().transform(Number).optional(),
    }),
  }),
  asyncHandler(workoutController.getRoutines)
);

router.get(
  '/routines/:id',
  authenticateToken,
  validateRequest({
    params: z.object({ id: z.string() }),
  }),
  asyncHandler(workoutController.getRoutine)
);

router.post(
  '/routines/:id/start',
  authenticateToken,
  requireProfile,
  validateRequest({
    params: z.object({ id: z.string() }),
    body: z.object({
      expected_duration: z.number().min(1).max(180).optional(),
    }),
  }),
  asyncHandler(workoutController.startRoutine)
);

router.post(
  '/routines/:id/complete',
  authenticateToken,
  requireProfile,
  validateRequest({
    params: z.object({ id: z.string() }),
    body: z.object({
      reps_completed: z.number().min(0).optional(),
      duration_minutes: z.number().min(1).max(180).optional(),
      notes: z.string().max(500).optional(),
      calories_burned: z.number().min(0).optional(),
      difficulty_rating: z.number().min(1).max(5).optional(),
    }),
  }),
  asyncHandler(workoutController.completeRoutine)
);

router.get(
  '/history',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
      limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default('20'),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    }),
  }),
  asyncHandler(workoutController.getHistory)
);

router.get(
  '/stats',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      period: z.string().default('30d'),
    }),
  }),
  asyncHandler(workoutController.getStats)
);

router.get(
  '/recommendations',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      energy_level: z.string().transform(Number).optional(),
      fitness_level: z.string().optional(),
      goals: z.string().optional(),
    }),
  }),
  asyncHandler(workoutController.getRecommendations)
);

router.get(
  '/categories',
  asyncHandler(workoutController.getCategories)
);

router.get(
  '/exercises',
  validateRequest({
    query: z.object({
      category: z.string().optional(),
    }),
  }),
  asyncHandler(workoutController.getExercises)
);

export default router;
