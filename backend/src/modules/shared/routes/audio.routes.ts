/**
 * Audio Routes
 */

import { Router } from 'express';
import { audioController } from '../controllers/audio.controller.js';
import { authenticateToken, requireProfile } from '../../auth/middleware/auth.middleware.js';
import { validateRequest } from '../../../middleware/validator.js';
import { asyncHandler } from '../../../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

router.get(
  '/celebrations',
  validateRequest({
    query: z.object({
      event_type: z.string().optional(),
    }),
  }),
  asyncHandler(audioController.getCelebrations)
);

router.get(
  '/meditation',
  validateRequest({
    query: z.object({
      category: z.string().optional(),
      duration: z.string().optional(),
    }),
  }),
  asyncHandler(audioController.getMeditation)
);

router.get(
  '/ambient',
  validateRequest({
    query: z.object({
      type: z.string().optional(),
      duration: z.string().optional(),
    }),
  }),
  asyncHandler(audioController.getAmbient)
);

router.post(
  '/feedback',
  authenticateToken,
  requireProfile,
  validateRequest({
    body: z.object({
      audio_type: z.string(),
      file_path: z.string(),
      feedback_type: z.enum(['play', 'pause', 'stop', 'skip', 'like', 'dislike']),
      duration_seconds: z.number().min(0).optional(),
      volume_level: z.number().min(0).max(100).optional(),
    }),
  }),
  asyncHandler(audioController.logFeedback)
);

router.get(
  '/categories',
  asyncHandler(audioController.getCategories)
);

export default router;
