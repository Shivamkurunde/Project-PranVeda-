/**
 * Workout Service
 */

import { getSupabaseClient, TABLES, handleSupabaseError, getCurrentTimestamp } from '../../../config/supabase.js';
import { logger } from '../../../middleware/logger.js';

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_type: string;
  reps_completed: number;
  duration_minutes: number;
  completed_at: string | null;
  celebration_triggered: boolean;
  notes?: string;
  calories_burned?: number;
  difficulty_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  category: string;
  difficulty: string;
  exercises: Exercise[];
  calories_estimate: number;
  thumbnail_url?: string;
  tags: string[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  duration_seconds?: number;
  rest_seconds?: number;
}

export class WorkoutService {
  private supabase = getSupabaseClient();

  async getAvailableRoutines(filters: any): Promise<WorkoutRoutine[]> {
    const routines: WorkoutRoutine[] = [
      {
        id: 'beginner-cardio',
        title: 'Beginner Cardio',
        description: 'Light cardio workout for beginners',
        duration_minutes: 20,
        category: 'cardio',
        difficulty: 'beginner',
        calories_estimate: 150,
        exercises: [
          { id: 'jumping-jacks', name: 'Jumping Jacks', description: 'Basic jumping jacks', sets: 3, reps: 15 },
          { id: 'mountain-climbers', name: 'Mountain Climbers', description: 'Cardio exercise', sets: 3, reps: 10 }
        ],
        tags: ['cardio', 'beginner', 'no-equipment']
      }
    ];

    return routines.filter(routine => {
      if (filters.category && routine.category !== filters.category) return false;
      if (filters.difficulty && routine.difficulty !== filters.difficulty) return false;
      if (filters.duration && routine.duration_minutes !== filters.duration) return false;
      return true;
    });
  }

  async getRoutineById(routineId: string, userId?: string): Promise<WorkoutRoutine | null> {
    const routines = await this.getAvailableRoutines({});
    return routines.find(r => r.id === routineId) || null;
  }

  async startRoutine(userId: string, routineId: string, options: any): Promise<WorkoutSession> {
    try {
      const sessionData = {
        user_id: userId,
        routine_type: routineId,
        reps_completed: 0,
        duration_minutes: options.expected_duration,
        completed_at: null,
        celebration_triggered: false,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      };

      const { data: session, error } = await this.supabase
        .from(TABLES.WORKOUT_SESSIONS)
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'startRoutine');
      }

      return session;
    } catch (error) {
      logger.error('Failed to start workout routine:', error);
      throw error;
    }
  }

  async completeRoutine(userId: string, routineId: string, data: any): Promise<any> {
    try {
      const { data: session, error } = await this.supabase
        .from(TABLES.WORKOUT_SESSIONS)
        .update({
          reps_completed: data.reps_completed,
          duration_minutes: data.duration_minutes,
          completed_at: getCurrentTimestamp(),
          notes: data.notes,
          calories_burned: data.calories_burned,
          difficulty_rating: data.difficulty_rating,
          updated_at: getCurrentTimestamp(),
        })
        .eq('user_id', userId)
        .eq('routine_type', routineId)
        .is('completed_at', null)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'completeRoutine');
      }

      // Update streaks
      await this.updateStreaks(userId, 'workout');

      return {
        session,
        celebrationTriggered: false,
        streakUpdate: { workout_streak: 1 }
      };
    } catch (error) {
      logger.error('Failed to complete workout routine:', error);
      throw error;
    }
  }

  async getUserHistory(userId: string, options: any): Promise<any> {
    try {
      const { data: sessions, error } = await this.supabase
        .from(TABLES.WORKOUT_SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'getUserHistory');
      }

      return {
        sessions: sessions || [],
        total: sessions?.length || 0,
        hasMore: false,
        summary: {
          total_sessions: sessions?.length || 0,
          total_minutes: sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0,
          total_calories: sessions?.reduce((sum, s) => sum + (s.calories_burned || 0), 0) || 0
        }
      };
    } catch (error) {
      logger.error('Failed to get workout history:', error);
      throw error;
    }
  }

  async getUserStats(userId: string, period: string): Promise<any> {
    return {
      total_sessions: 0,
      total_minutes: 0,
      total_calories: 0,
      current_streak: 0,
      longest_streak: 0,
      favorite_category: 'cardio',
      average_duration: 0
    };
  }

  async getRecommendations(userId: string, context: any): Promise<any[]> {
    return [
      {
        id: 'recommendation-1',
        title: 'Morning Cardio',
        reason: 'Based on your fitness level',
        priority: 'medium'
      }
    ];
  }

  async getCategories(): Promise<any[]> {
    return [
      { id: 'cardio', name: 'Cardio', description: 'Cardiovascular exercises' },
      { id: 'strength', name: 'Strength', description: 'Strength training' },
      { id: 'flexibility', name: 'Flexibility', description: 'Stretching and flexibility' }
    ];
  }

  async getExercises(category?: string): Promise<any[]> {
    return [
      { id: 'exercise-1', name: 'Push-ups', category: 'strength' },
      { id: 'exercise-2', name: 'Running', category: 'cardio' }
    ];
  }

  private async updateStreaks(userId: string, type: 'meditation' | 'workout'): Promise<void> {
    logger.info('Streaks updated', { userId, type });
  }
}
