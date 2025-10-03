/**
 * Streak Calculator Utility
 * Handles streak calculation logic for meditation and workout activities
 */

import { getSupabaseClient, TABLES, getCurrentTimestamp } from '../config/supabase.js';
import { logger } from '../middleware/logger.js';

export interface StreakData {
  current: number;
  longest: number;
  last_activity_date: string | null;
  is_active_today: boolean;
}

export interface StreakUpdate {
  meditation_streak: number;
  workout_streak: number;
  longest_meditation_streak: number;
  longest_workout_streak: number;
  last_meditation_date: string | null;
  last_workout_date: string | null;
}

export class StreakCalculator {
  private supabase = getSupabaseClient();

  /**
   * Calculate meditation streak for a user
   */
  async calculateMeditationStreak(userId: string): Promise<StreakData> {
    try {
      // Get user's meditation sessions ordered by date
      const { data: sessions } = await this.supabase
        .from(TABLES.MEDITATION_SESSIONS)
        .select('completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (!sessions || sessions.length === 0) {
        return {
          current: 0,
          longest: 0,
          last_activity_date: null,
          is_active_today: false,
        };
      }

      const streak = this.calculateStreakFromDates(
        sessions.map(s => new Date(s.completed_at).toDateString())
      );

      return streak;
    } catch (error) {
      logger.error('Failed to calculate meditation streak:', error);
      throw error;
    }
  }

  /**
   * Calculate workout streak for a user
   */
  async calculateWorkoutStreak(userId: string): Promise<StreakData> {
    try {
      // Get user's workout sessions ordered by date
      const { data: sessions } = await this.supabase
        .from(TABLES.WORKOUT_SESSIONS)
        .select('completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (!sessions || sessions.length === 0) {
        return {
          current: 0,
          longest: 0,
          last_activity_date: null,
          is_active_today: false,
        };
      }

      const streak = this.calculateStreakFromDates(
        sessions.map(s => new Date(s.completed_at).toDateString())
      );

      return streak;
    } catch (error) {
      logger.error('Failed to calculate workout streak:', error);
      throw error;
    }
  }

  /**
   * Update streaks for a user
   */
  async updateUserStreaks(userId: string, activityType: 'meditation' | 'workout'): Promise<StreakUpdate> {
    try {
      const [meditationStreak, workoutStreak] = await Promise.all([
        this.calculateMeditationStreak(userId),
        this.calculateWorkoutStreak(userId),
      ]);

      const updateData: StreakUpdate = {
        meditation_streak: meditationStreak.current,
        workout_streak: workoutStreak.current,
        longest_meditation_streak: Math.max(
          meditationStreak.current,
          await this.getLongestStreak(userId, 'meditation')
        ),
        longest_workout_streak: Math.max(
          workoutStreak.current,
          await this.getLongestStreak(userId, 'workout')
        ),
        last_meditation_date: meditationStreak.last_activity_date,
        last_workout_date: workoutStreak.last_activity_date,
      };

      // Update or insert streak record
      await this.upsertStreakRecord(userId, updateData);

      logger.info('User streaks updated', {
        userId,
        meditationStreak: updateData.meditation_streak,
        workoutStreak: updateData.workout_streak,
      });

      return updateData;
    } catch (error) {
      logger.error('Failed to update user streaks:', error);
      throw error;
    }
  }

  /**
   * Check if user completed activity today
   */
  async hasActivityToday(userId: string, activityType: 'meditation' | 'workout'): Promise<boolean> {
    try {
      const table = activityType === 'meditation' ? TABLES.MEDITATION_SESSIONS : TABLES.WORKOUT_SESSIONS;
      const today = new Date().toDateString();

      const { data: sessions } = await this.supabase
        .from(table)
        .select('completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .gte('completed_at', new Date().toISOString().split('T')[0]);

      return sessions && sessions.length > 0;
    } catch (error) {
      logger.error('Failed to check activity today:', error);
      return false;
    }
  }

  /**
   * Get milestone achievements based on streaks
   */
  async checkStreakMilestones(userId: string): Promise<string[]> {
    try {
      const [meditationStreak, workoutStreak] = await Promise.all([
        this.calculateMeditationStreak(userId),
        this.calculateWorkoutStreak(userId),
      ]);

      const milestones: string[] = [];

      // Check meditation milestones
      if (this.isMilestone(meditationStreak.current)) {
        milestones.push(`meditation_streak_${meditationStreak.current}`);
      }

      // Check workout milestones
      if (this.isMilestone(workoutStreak.current)) {
        milestones.push(`workout_streak_${workoutStreak.current}`);
      }

      return milestones;
    } catch (error) {
      logger.error('Failed to check streak milestones:', error);
      return [];
    }
  }

  /**
   * Calculate streak from array of activity dates
   */
  private calculateStreakFromDates(activityDates: string[]): StreakData {
    if (activityDates.length === 0) {
      return {
        current: 0,
        longest: 0,
        last_activity_date: null,
        is_active_today: false,
      };
    }

    // Remove duplicates and sort
    const uniqueDates = [...new Set(activityDates)].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Check if user was active today or yesterday
    const isActiveToday = uniqueDates.includes(today);
    const isActiveYesterday = uniqueDates.includes(yesterday);

    // Calculate current streak
    if (isActiveToday || isActiveYesterday) {
      currentStreak = 1;
      let checkDate = isActiveToday ? yesterday : new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toDateString();

      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const expectedDate = new Date(checkDate);

        if (this.isConsecutiveDay(currentDate, expectedDate)) {
          currentStreak++;
          checkDate = new Date(Date.now() - (currentStreak + 1) * 24 * 60 * 60 * 1000).toDateString();
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const previousDate = new Date(uniqueDates[i - 1]);

      if (this.isConsecutiveDay(currentDate, previousDate)) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      current: currentStreak,
      longest: longestStreak,
      last_activity_date: uniqueDates[0],
      is_active_today: isActiveToday,
    };
  }

  /**
   * Check if two dates are consecutive days
   */
  private isConsecutiveDay(date1: Date, date2: Date): boolean {
    const diffTime = Math.abs(date1.getTime() - date2.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  /**
   * Check if a number is a milestone
   */
  private isMilestone(streak: number): boolean {
    const milestones = [3, 7, 14, 30, 60, 100, 200, 365];
    return milestones.includes(streak);
  }

  /**
   * Get longest streak for a user and activity type
   */
  private async getLongestStreak(userId: string, activityType: 'meditation' | 'workout'): Promise<number> {
    try {
      const { data: streakRecord } = await this.supabase
        .from(TABLES.USER_STREAKS)
        .select(`longest_${activityType}_streak`)
        .eq('user_id', userId)
        .single();

      return streakRecord?.[`longest_${activityType}_streak`] || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Upsert streak record in database
   */
  private async upsertStreakRecord(userId: string, streakData: StreakUpdate): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(TABLES.USER_STREAKS)
        .upsert({
          user_id: userId,
          ...streakData,
          updated_at: getCurrentTimestamp(),
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Failed to upsert streak record:', error);
      throw error;
    }
  }
}
