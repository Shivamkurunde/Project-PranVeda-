/**
 * Workout Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../auth/middleware/auth.middleware.js';
import { WorkoutService } from '../services/workout.service.js';
import { logger, logBusinessEvent } from '../../../middleware/logger.js';
import { APIError, NotFoundError, ValidationError } from '../../../middleware/errorHandler.js';

export class WorkoutController {
  private workoutService: WorkoutService;

  constructor() {
    this.workoutService = new WorkoutService();
  }

  getRoutines = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, difficulty, duration } = req.query;
      const userId = req.user?.uid;

      const routines = await this.workoutService.getAvailableRoutines({
        category: category as string,
        difficulty: difficulty as string,
        duration: duration ? Number(duration) : undefined,
        userId,
      });

      res.json({
        success: true,
        data: { routines },
      });
    } catch (error) {
      next(error);
    }
  };

  getRoutine = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.uid;

      const routine = await this.workoutService.getRoutineById(id, userId);

      if (!routine) {
        throw new NotFoundError('Workout routine');
      }

      res.json({
        success: true,
        data: { routine },
      });
    } catch (error) {
      next(error);
    }
  };

  startRoutine = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const { id } = req.params;
      const userId = req.user.uid;
      const { expected_duration } = req.body;

      const session = await this.workoutService.startRoutine(userId, id, {
        expected_duration: expected_duration || 30,
      });

      logBusinessEvent('workout_routine_started', userId, {
        routineId: id,
        expectedDuration: expected_duration,
      });

      res.json({
        success: true,
        message: 'Workout routine started',
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  };

  completeRoutine = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const { id } = req.params;
      const userId = req.user.uid;
      const { reps_completed, duration_minutes, notes, calories_burned, difficulty_rating } = req.body;

      const result = await this.workoutService.completeRoutine(userId, id, {
        reps_completed: reps_completed || 0,
        duration_minutes: duration_minutes || 30,
        notes,
        calories_burned,
        difficulty_rating,
      });

      logBusinessEvent('workout_routine_completed', userId, {
        routineId: id,
        repsCompleted: reps_completed,
        durationMinutes: duration_minutes,
        caloriesBurned: calories_burned,
        celebrationTriggered: result.celebrationTriggered,
      });

      res.json({
        success: true,
        message: 'Workout routine completed',
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

  getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { page = 1, limit = 20, start_date, end_date } = req.query;

      const history = await this.workoutService.getUserHistory(userId, {
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

  getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { period = '30d' } = req.query;

      const stats = await this.workoutService.getUserStats(userId, period as string);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };

  getRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { energy_level, fitness_level, goals } = req.query;

      const recommendations = await this.workoutService.getRecommendations(userId, {
        energy_level: energy_level ? Number(energy_level) : undefined,
        fitness_level: fitness_level as string,
        goals: goals as string,
      });

      res.json({
        success: true,
        data: { recommendations },
      });
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.workoutService.getCategories();

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  };

  getExercises = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.query;

      const exercises = await this.workoutService.getExercises(category as string);

      res.json({
        success: true,
        data: { exercises },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const workoutController = new WorkoutController();
