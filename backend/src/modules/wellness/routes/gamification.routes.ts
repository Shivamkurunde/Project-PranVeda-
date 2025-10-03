/**
 * Gamification Routes
 */

import { Router } from 'express';
import { gamificationController } from '../controllers/gamification.controller.js';
import { authenticateToken, requireProfile } from '../../auth/middleware/auth.middleware.js';
import { validateRequest } from '../../../middleware/validator.js';
import { asyncHandler } from '../../../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

router.get(
  '/badges',
  authenticateToken,
  requireProfile,
  asyncHandler(gamificationController.getBadges)
);

router.get(
  '/levels',
  authenticateToken,
  requireProfile,
  asyncHandler(gamificationController.getLevels)
);

router.post(
  '/milestone',
  authenticateToken,
  requireProfile,
  validateRequest({
    body: z.object({
      event_type: z.enum(['meditation_complete', 'workout_complete', 'streak_milestone', 'badge_unlock', 'level_up']),
      data: z.record(z.any()).optional(),
    }),
  }),
  asyncHandler(gamificationController.triggerMilestone)
);

router.get(
  '/rewards',
  authenticateToken,
  requireProfile,
  asyncHandler(gamificationController.getRewards)
);

router.put(
  '/celebrations/:celebrationId/viewed',
  authenticateToken,
  requireProfile,
  validateRequest({
    params: z.object({
      celebrationId: z.string().uuid(),
    }),
  }),
  asyncHandler(gamificationController.markCelebrationViewed)
);

router.get(
  '/leaderboard',
  validateRequest({
    query: z.object({
      category: z.string().default('overall'),
      period: z.string().default('30d'),
    }),
  }),
  asyncHandler(gamificationController.getLeaderboard)
);

router.get(
  '/ranking',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      category: z.string().default('overall'),
    }),
  }),
  asyncHandler(gamificationController.getUserRanking)
);

export default router;
