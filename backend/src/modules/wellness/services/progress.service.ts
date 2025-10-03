/**
 * Progress Service
 */

import { getSupabaseClient, TABLES, handleSupabaseError, getCurrentTimestamp } from '../../../config/supabase.js';
import { logger } from '../../../middleware/logger.js';

export class ProgressService {
  private supabase = getSupabaseClient();

  async getOverallStats(userId: string, period: string): Promise<any> {
    try {
      // Get meditation stats
      const { count: meditationCount } = await this.supabase
        .from(TABLES.MEDITATION_SESSIONS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get workout stats
      const { count: workoutCount } = await this.supabase
        .from(TABLES.WORKOUT_SESSIONS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get current streaks
      const { data: streaks } = await this.supabase
        .from(TABLES.USER_STREAKS)
        .select('*')
        .eq('user_id', userId)
        .single();

      return {
        total_sessions: (meditationCount || 0) + (workoutCount || 0),
        meditation_sessions: meditationCount || 0,
        workout_sessions: workoutCount || 0,
        current_streaks: {
          meditation: streaks?.meditation_streak || 0,
          workout: streaks?.workout_streak || 0,
        },
        period,
        last_updated: getCurrentTimestamp(),
      };
    } catch (error) {
      logger.error('Failed to get overall stats:', error);
      throw error;
    }
  }

  async getCurrentStreaks(userId: string): Promise<any> {
    try {
      const { data: streaks, error } = await this.supabase
        .from(TABLES.USER_STREAKS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        handleSupabaseError(error, 'getCurrentStreaks');
      }

      return {
        meditation: {
          current: streaks?.meditation_streak || 0,
          longest: streaks?.longest_meditation_streak || 0,
          last_date: streaks?.last_meditation_date,
        },
        workout: {
          current: streaks?.workout_streak || 0,
          longest: streaks?.longest_workout_streak || 0,
          last_date: streaks?.last_workout_date,
        },
      };
    } catch (error) {
      logger.error('Failed to get current streaks:', error);
      throw error;
    }
  }

  async getDetailedAnalytics(userId: string, period: string, metric?: string): Promise<any> {
    try {
      const analytics = {
        meditation: {
          total_minutes: 0,
          sessions_count: 0,
          average_duration: 0,
          mood_trend: [],
        },
        workout: {
          total_minutes: 0,
          sessions_count: 0,
          calories_burned: 0,
          difficulty_trend: [],
        },
        mood: {
          average_rating: 0,
          trend: [],
          checkins_count: 0,
        },
        period,
      };

      // Get meditation analytics
      const { data: meditationSessions } = await this.supabase
        .from(TABLES.MEDITATION_SESSIONS)
        .select('duration_minutes, mood_after, created_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      if (meditationSessions) {
        analytics.meditation.total_minutes = meditationSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
        analytics.meditation.sessions_count = meditationSessions.length;
        analytics.meditation.average_duration = analytics.meditation.sessions_count > 0 
          ? analytics.meditation.total_minutes / analytics.meditation.sessions_count 
          : 0;
      }

      // Get workout analytics
      const { data: workoutSessions } = await this.supabase
        .from(TABLES.WORKOUT_SESSIONS)
        .select('duration_minutes, calories_burned, difficulty_rating, created_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      if (workoutSessions) {
        analytics.workout.total_minutes = workoutSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
        analytics.workout.sessions_count = workoutSessions.length;
        analytics.workout.calories_burned = workoutSessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0);
      }

      // Get mood analytics
      const { data: moodCheckins } = await this.supabase
        .from(TABLES.MOOD_CHECKINS)
        .select('mood_rating, created_at')
        .eq('user_id', userId);

      if (moodCheckins && moodCheckins.length > 0) {
        analytics.mood.average_rating = moodCheckins.reduce((sum, c) => sum + c.mood_rating, 0) / moodCheckins.length;
        analytics.mood.checkins_count = moodCheckins.length;
      }

      return analytics;
    } catch (error) {
      logger.error('Failed to get detailed analytics:', error);
      throw error;
    }
  }

  async createMoodCheckin(userId: string, data: any): Promise<any> {
    try {
      const checkinData = {
        user_id: userId,
        mood_rating: data.mood_rating,
        notes: data.notes,
        tags: data.tags || [],
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      };

      const { data: checkin, error } = await this.supabase
        .from(TABLES.MOOD_CHECKINS)
        .insert(checkinData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'createMoodCheckin');
      }

      return checkin;
    } catch (error) {
      logger.error('Failed to create mood check-in:', error);
      throw error;
    }
  }

  async getHistoricalData(userId: string, options: any): Promise<any> {
    try {
      let query = this.supabase
        .from(TABLES.MEDITATION_SESSIONS)
        .select('*')
        .eq('user_id', userId);

      if (options.start_date) {
        query = query.gte('created_at', options.start_date);
      }
      if (options.end_date) {
        query = query.lte('created_at', options.end_date);
      }

      const { data: sessions, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'getHistoricalData');
      }

      return {
        data: sessions || [],
        total: sessions?.length || 0,
        hasMore: false,
      };
    } catch (error) {
      logger.error('Failed to get historical data:', error);
      throw error;
    }
  }

  async getUserGoals(userId: string): Promise<any[]> {
    try {
      const { data: goals, error } = await this.supabase
        .from(TABLES.USER_GOALS)
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'getUserGoals');
      }

      return goals || [];
    } catch (error) {
      logger.error('Failed to get user goals:', error);
      throw error;
    }
  }

  async updateGoal(userId: string, goalId: string, updates: any): Promise<any> {
    try {
      const updateData = {
        ...updates,
        updated_at: getCurrentTimestamp(),
      };

      const { data: goal, error } = await this.supabase
        .from(TABLES.USER_GOALS)
        .update(updateData)
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'updateGoal');
      }

      return goal;
    } catch (error) {
      logger.error('Failed to update goal:', error);
      throw error;
    }
  }
}
