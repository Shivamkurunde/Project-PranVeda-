/**
 * Meditation Controller
 * Handles meditation session management and tracking
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../auth/middleware/auth.middleware.js';
import { MeditationService } from '../services/meditation.service.js';
import { logger, logBusinessEvent } from '../../../middleware/logger.js';
import { APIError, NotFoundError, ValidationError } from '../../../middleware/errorHandler.js';

/**
 * Meditation controller class
 */
export class MeditationController {
  private meditationService: MeditationService;

  constructor() {
    this.meditationService = new MeditationService();
  }

  /**
   * Get available meditation sessions
   */
  getSessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, difficulty, duration } = req.query;
      const userId = req.user?.uid;

      const sessions = await this.meditationService.getAvailableSessions({
        category: category as string,
        difficulty: difficulty as string,
        duration: duration ? Number(duration) : undefined,
        userId,
      });

      res.json({
        success: true,
        data: {
          sessions,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get specific meditation session details
   */
  getSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.uid;

      const session = await this.meditationService.getSessionById(id, userId);

      if (!session) {
        throw new NotFoundError('Meditation session');
      }

      res.json({
        success: true,
        data: {
          session,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Start meditation session
   */
  startSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const { id } = req.params;
      const userId = req.user.uid;
      const { expected_duration } = req.body;

      const session = await this.meditationService.startSession(userId, id, {
        expected_duration: expected_duration || 10,
      });

      logBusinessEvent('meditation_session_started', userId, {
        sessionId: id,
        expectedDuration: expected_duration,
      });

      res.json({
        success: true,
        message: 'Meditation session started',
        data: {
          session,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Complete meditation session
   */
  completeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const { id } = req.params;
      const userId = req.user.uid;
      const { duration_minutes, notes, mood_before, mood_after } = req.body;

      const result = await this.meditationService.completeSession(userId, id, {
        duration_minutes: duration_minutes || 10,
        notes,
        mood_before,
        mood_after,
      });

      logBusinessEvent('meditation_session_completed', userId, {
        sessionId: id,
        durationMinutes: duration_minutes,
        moodBefore: mood_before,
        moodAfter: mood_after,
        celebrationTriggered: result.celebrationTriggered,
      });

      res.json({
        success: true,
        message: 'Meditation session completed',
        data: {
          session: result.session,
          celebration: result.celebration,
          streak_update: result.streakUpdate,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's meditation history
   */
  getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { page = 1, limit = 20, start_date, end_date } = req.query;

      const history = await this.meditationService.getUserHistory(userId, {
        page: Number(page),
        limit: Number(limit),
        start_date: start_date as string,
        end_date: end_date as string,
      });

      res.json({
        success: true,
        data: {
          sessions: history.sessions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: history.total,
            hasMore: history.hasMore,
          },
          summary: history.summary,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get meditation statistics
   */
  getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { period = '30d' } = req.query;

      const stats = await this.meditationService.getUserStats(userId, period as string);

      res.json({
        success: true,
        data: {
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get meditation recommendations
   */
  getRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { mood, energy_level, stress_level } = req.query;

      const recommendations = await this.meditationService.getRecommendations(userId, {
        mood: mood as string,
        energy_level: energy_level ? Number(energy_level) : undefined,
        stress_level: stress_level ? Number(stress_level) : undefined,
      });

      res.json({
        success: true,
        data: {
          recommendations,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Save meditation session progress
   */
  saveProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const { id } = req.params;
      const userId = req.user.uid;
      const { current_time, notes } = req.body;

      const progress = await this.meditationService.saveProgress(userId, id, {
        current_time,
        notes,
      });

      res.json({
        success: true,
        message: 'Progress saved',
        data: {
          progress,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get meditation categories
   */
  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.meditationService.getCategories();

      res.json({
        success: true,
        data: {
          categories,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get meditation techniques
   */
  getTechniques = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.query;

      const techniques = await this.meditationService.getTechniques(category as string);

      res.json({
        success: true,
        data: {
          techniques,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Rate meditation session
   */
  rateSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const { id } = req.params;
      const userId = req.user.uid;
      const { rating, feedback } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        throw new ValidationError('Rating must be between 1 and 5');
      }

      const result = await this.meditationService.rateSession(userId, id, {
        rating,
        feedback,
      });

      logBusinessEvent('meditation_session_rated', userId, {
        sessionId: id,
        rating,
        hasFeedback: !!feedback,
      });

      res.json({
        success: true,
        message: 'Session rated successfully',
        data: {
          rating: result,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

// Export controller instance
export const meditationController = new MeditationController();

