/**
 * Meditation Routes
 */

import { Router } from 'express';
import { meditationController } from '../controllers/meditation.controller.js';
import { authenticateToken, requireProfile } from '../../auth/middleware/auth.middleware.js';
import { validateRequest, meditationSessionSchemas } from '../../../middleware/validator.js';
import { asyncHandler } from '../../../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

router.get(
  '/sessions',
  authenticateToken,
  validateRequest({
    query: z.object({
      category: z.string().optional(),
      difficulty: z.string().optional(),
      duration: z.string().transform(Number).optional(),
    }),
  }),
  asyncHandler(meditationController.getSessions)
);

router.get(
  '/sessions/:id',
  authenticateToken,
  validateRequest({
    params: z.object({
      id: z.string(),
    }),
  }),
  asyncHandler(meditationController.getSession)
);

router.post(
  '/sessions/:id/start',
  authenticateToken,
  requireProfile,
  validateRequest({
    params: z.object({ id: z.string() }),
    body: z.object({
      expected_duration: z.number().min(1).max(480).optional(),
    }),
  }),
  asyncHandler(meditationController.startSession)
);

router.post(
  '/sessions/:id/complete',
  authenticateToken,
  requireProfile,
  validateRequest({
    params: z.object({ id: z.string() }),
    body: z.object({
      duration_minutes: z.number().min(1).max(480).optional(),
      notes: z.string().max(500).optional(),
      mood_before: z.number().min(1).max(5).optional(),
      mood_after: z.number().min(1).max(5).optional(),
    }),
  }),
  asyncHandler(meditationController.completeSession)
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
  asyncHandler(meditationController.getHistory)
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
  asyncHandler(meditationController.getStats)
);

router.get(
  '/recommendations',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      mood: z.string().optional(),
      energy_level: z.string().transform(Number).optional(),
      stress_level: z.string().transform(Number).optional(),
    }),
  }),
  asyncHandler(meditationController.getRecommendations)
);

router.post(
  '/sessions/:id/progress',
  authenticateToken,
  requireProfile,
  validateRequest({
    params: z.object({ id: z.string() }),
    body: z.object({
      current_time: z.number().min(0),
      notes: z.string().max(200).optional(),
    }),
  }),
  asyncHandler(meditationController.saveProgress)
);

router.get(
  '/categories',
  asyncHandler(meditationController.getCategories)
);

router.get(
  '/techniques',
  validateRequest({
    query: z.object({
      category: z.string().optional(),
    }),
  }),
  asyncHandler(meditationController.getTechniques)
);

router.post(
  '/sessions/:id/rate',
  authenticateToken,
  requireProfile,
  validateRequest({
    params: z.object({ id: z.string() }),
    body: z.object({
      rating: z.number().min(1).max(5),
      feedback: z.string().max(500).optional(),
    }),
  }),
  asyncHandler(meditationController.rateSession)
);

export default router;
