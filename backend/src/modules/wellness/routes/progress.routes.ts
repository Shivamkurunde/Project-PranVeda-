/**
 * Progress Routes
 */

import { Router } from 'express';
import { progressController } from '../controllers/progress.controller.js';
import { authenticateToken, requireProfile } from '../../auth/middleware/auth.middleware.js';
import { validateRequest } from '../../../middleware/validator.js';
import { asyncHandler } from '../../../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

router.get(
  '/stats',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      period: z.string().default('30d'),
    }),
  }),
  asyncHandler(progressController.getStats)
);

router.get(
  '/streaks',
  authenticateToken,
  requireProfile,
  asyncHandler(progressController.getStreaks)
);

router.get(
  '/analytics',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      period: z.string().default('30d'),
      metric: z.string().optional(),
    }),
  }),
  asyncHandler(progressController.getAnalytics)
);

router.post(
  '/mood-checkin',
  authenticateToken,
  requireProfile,
  validateRequest({
    body: z.object({
      mood_rating: z.number().min(1).max(5),
      notes: z.string().max(500).optional(),
      tags: z.array(z.string()).max(5).optional(),
    }),
  }),
  asyncHandler(progressController.moodCheckin)
);

router.get(
  '/history',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
      limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('50'),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      type: z.string().optional(),
    }),
  }),
  asyncHandler(progressController.getHistory)
);

router.get(
  '/goals',
  authenticateToken,
  requireProfile,
  asyncHandler(progressController.getGoals)
);

router.put(
  '/goals/:goalId',
  authenticateToken,
  requireProfile,
  validateRequest({
    params: z.object({
      goalId: z.string().uuid(),
    }),
    body: z.object({
      current_value: z.number().min(0).optional(),
      status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
    }),
  }),
  asyncHandler(progressController.updateGoal)
);

export default router;
