/**
 * Gamification Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../auth/middleware/auth.middleware.js';
import { GamificationService } from '../services/gamification.service.js';
import { logger, logBusinessEvent } from '../../../middleware/logger.js';
import { APIError } from '../../../middleware/errorHandler.js';

export class GamificationController {
  private gamificationService: GamificationService;

  constructor() {
    this.gamificationService = new GamificationService();
  }

  getBadges = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;

      const badges = await this.gamificationService.getUserBadges(userId);

      res.json({
        success: true,
        data: { badges },
      });
    } catch (error) {
      next(error);
    }
  };

  getLevels = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;

      const levels = await this.gamificationService.getUserLevel(userId);

      res.json({
        success: true,
        data: { levels },
      });
    } catch (error) {
      next(error);
    }
  };

  triggerMilestone = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { event_type, data } = req.body;

      const celebration = await this.gamificationService.triggerMilestone(userId, event_type, data);

      logBusinessEvent('milestone_triggered', userId, {
        eventType: event_type,
        celebrationId: celebration.id
      });

      res.json({
        success: true,
        message: 'Milestone celebration triggered',
        data: { celebration },
      });
    } catch (error) {
      next(error);
    }
  };

  getRewards = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;

      const rewards = await this.gamificationService.getAvailableRewards(userId);

      res.json({
        success: true,
        data: { rewards },
      });
    } catch (error) {
      next(error);
    }
  };

  markCelebrationViewed = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { celebrationId } = req.params;

      await this.gamificationService.markCelebrationViewed(userId, celebrationId);

      res.json({
        success: true,
        message: 'Celebration marked as viewed',
      });
    } catch (error) {
      next(error);
    }
  };

  getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category = 'overall', period = '30d' } = req.query;

      const leaderboard = await this.gamificationService.getLeaderboard(category as string, period as string);

      res.json({
        success: true,
        data: { leaderboard },
      });
    } catch (error) {
      next(error);
    }
  };

  getUserRanking = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { category = 'overall' } = req.query;

      const ranking = await this.gamificationService.getUserRanking(userId, category as string);

      res.json({
        success: true,
        data: { ranking },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const gamificationController = new GamificationController();
