/**
 * AI Routes
 */

import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { authenticateToken, requireProfile } from '../../auth/middleware/auth.middleware.js';
import { aiRateLimit } from '../../../middleware/rateLimiter.js';
import { validateRequest } from '../../../middleware/validator.js';
import { asyncHandler } from '../../../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

router.post(
  '/mood-analysis',
  aiRateLimit,
  authenticateToken,
  requireProfile,
  validateRequest({
    body: z.object({
      text: z.string().min(1).max(1000),
      language: z.string().length(2).default('en'),
    }),
  }),
  asyncHandler(aiController.analyzeMood)
);

router.post(
  '/recommendation',
  aiRateLimit,
  authenticateToken,
  requireProfile,
  validateRequest({
    body: z.object({
      mood: z.enum(['very_negative', 'negative', 'neutral', 'positive', 'very_positive']),
      context: z.record(z.any()).optional(),
    }),
  }),
  asyncHandler(aiController.getRecommendations)
);

router.post(
  '/chat',
  aiRateLimit,
  authenticateToken,
  requireProfile,
  validateRequest({
    body: z.object({
      message: z.string().min(1).max(1000),
      conversation_id: z.string().uuid().optional(),
    }),
  }),
  asyncHandler(aiController.chat)
);

router.get(
  '/weekly-insights',
  aiRateLimit,
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      week_start: z.string().optional(),
    }),
  }),
  asyncHandler(aiController.getWeeklyInsights)
);

router.get(
  '/report',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      format: z.enum(['json', 'pdf']).default('json'),
    }),
  }),
  asyncHandler(aiController.generateReport)
);

router.get(
  '/capabilities',
  asyncHandler(aiController.getAICapabilities)
);

export default router;
