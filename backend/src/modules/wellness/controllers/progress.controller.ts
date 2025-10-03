/**
 * Progress Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../auth/middleware/auth.middleware.js';
import { ProgressService } from '../services/progress.service.js';
import { logger, logBusinessEvent } from '../../../middleware/logger.js';
import { APIError, ValidationError } from '../../../middleware/errorHandler.js';

export class ProgressController {
  private progressService: ProgressService;

  constructor() {
    this.progressService = new ProgressService();
  }

  getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { period = '30d' } = req.query;

      const stats = await this.progressService.getOverallStats(userId, period as string);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };

  getStreaks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;

      const streaks = await this.progressService.getCurrentStreaks(userId);

      res.json({
        success: true,
        data: { streaks },
      });
    } catch (error) {
      next(error);
    }
  };

  getAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { period = '30d', metric } = req.query;

      const analytics = await this.progressService.getDetailedAnalytics(userId, period as string, metric as string);

      res.json({
        success: true,
        data: { analytics },
      });
    } catch (error) {
      next(error);
    }
  };

  moodCheckin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { mood_rating, notes, tags } = req.body;

      if (!mood_rating || mood_rating < 1 || mood_rating > 5) {
        throw new ValidationError('Mood rating must be between 1 and 5');
      }

      const checkin = await this.progressService.createMoodCheckin(userId, {
        mood_rating,
        notes,
        tags,
      });

      logBusinessEvent('mood_checkin_completed', userId, {
        moodRating: mood_rating,
        hasNotes: !!notes,
        tagsCount: tags?.length || 0
      });

      res.json({
        success: true,
        message: 'Mood check-in recorded',
        data: { checkin },
      });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { page = 1, limit = 50, start_date, end_date, type } = req.query;

      const history = await this.progressService.getHistoricalData(userId, {
        page: Number(page),
        limit: Number(limit),
        start_date: start_date as string,
        end_date: end_date as string,
        type: type as string,
      });

      res.json({
        success: true,
        data: {
          history: history.data,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: history.total,
            hasMore: history.hasMore,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getGoals = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;

      const goals = await this.progressService.getUserGoals(userId);

      res.json({
        success: true,
        data: { goals },
      });
    } catch (error) {
      next(error);
    }
  };

  updateGoal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { goalId } = req.params;
      const { current_value, status } = req.body;

      const goal = await this.progressService.updateGoal(userId, goalId, {
        current_value,
        status,
      });

      res.json({
        success: true,
        message: 'Goal updated successfully',
        data: { goal },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const progressController = new ProgressController();
