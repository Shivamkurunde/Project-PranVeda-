/**
 * Health Controller
 */

import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/health.service.js';
import { logger } from '../../../middleware/logger.js';
import { asyncHandler } from '../../../middleware/errorHandler.js';

export class HealthController {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await this.healthService.getHealthStatus();

      res.json({
        success: true,
        data: { health },
      });
    } catch (error) {
      next(error);
    }
  };

  getDatabaseHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dbHealth = await this.healthService.getDatabaseHealth();

      res.json({
        success: true,
        data: { database: dbHealth },
      });
    } catch (error) {
      next(error);
    }
  };

  getAIHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const aiHealth = await this.healthService.getAIHealth();

      res.json({
        success: true,
        data: { ai: aiHealth },
      });
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = await this.healthService.getMetrics();

      res.json({
        success: true,
        data: { metrics },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const healthController = new HealthController();
