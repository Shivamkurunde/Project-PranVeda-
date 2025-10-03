/**
 * Health Routes
 */

import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';
import { asyncHandler } from '../../../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(healthController.getHealth)
);

router.get(
  '/db',
  asyncHandler(healthController.getDatabaseHealth)
);

router.get(
  '/ai',
  asyncHandler(healthController.getAIHealth)
);

router.get(
  '/metrics',
  asyncHandler(healthController.getMetrics)
);

export default router;
