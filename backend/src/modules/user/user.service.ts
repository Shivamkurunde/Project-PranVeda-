/**
 * User Service
 * Business logic for user profile management and dashboard data
 */

import { getSupabaseClient, TABLES, handleSupabaseError, getCurrentTimestamp } from '../../config/supabase.js';
import { logger } from '../../middleware/logger.js';
import { APIError, NotFoundError } from '../../middleware/errorHandler.js';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferred_language: string;
  wellness_goals: string[];
  experience_level: string;
  role: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  created_at: string;
  updated_at: string;
}

/**
 * Notification settings interface
 */
export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  meditation_reminders: boolean;
  workout_reminders: boolean;
  achievement_notifications: boolean;
  weekly_reports: boolean;
  marketing_emails: boolean;
}

/**
 * Privacy settings interface
 */
export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  data_sharing: boolean;
  analytics_sharing: boolean;
  leaderboard_participation: boolean;
}

/**
 * Dashboard data interface
 */
export interface DashboardData {
  user: UserProfile;
  stats: {
    total_sessions: number;
    meditation_sessions: number;
    workout_sessions: number;
    current_streaks: {
      meditation: number;
      workout: number;
    };
    achievements_count: number;
    level: number;
    experience_points: number;
  };
  recent_activities: Activity[];
  upcoming_goals: Goal[];
  recommendations: Recommendation[];
  mood_trend: MoodData[];
}

/**
 * Activity interface
 */
export interface Activity {
  id: string;
  type: 'meditation' | 'workout' | 'achievement' | 'milestone';
  title: string;
  description: string;
  timestamp: string;
  data?: any;
}

/**
 * Goal interface
 */
export interface Goal {
  id: string;
  type: 'meditation' | 'workout' | 'streak' | 'achievement';
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  deadline?: string;
  status: 'active' | 'completed' | 'paused';
}

/**
 * Recommendation interface
 */
export interface Recommendation {
  id: string;
  type: 'meditation' | 'workout' | 'tip' | 'article';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

/**
 * Mood data interface
 */
export interface MoodData {
  date: string;
  mood: number; // 1-5 scale
  notes?: string;
}

/**
 * User service class
 */
export class UserService {
  private supabase = getSupabaseClient();

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const { data: profile, error } = await this.supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('User profile');
        }
        handleSupabaseError(error, 'getUserProfile');
      }

      return profile;
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: {
      display_name?: string;
      avatar_url?: string;
      bio?: string;
    }
  ): Promise<UserProfile> {
    try {
      const updateData = {
        ...updates,
        updated_at: getCurrentTimestamp(),
      };

      const { data: profile, error } = await this.supabase
        .from(TABLES.PROFILES)
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'updateUserProfile');
      }

      if (!profile) {
        throw new NotFoundError('User profile');
      }

      logger.info('User profile updated', { userId, updates });

      return profile;
    } catch (error) {
      logger.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: {
      preferred_language?: string;
      wellness_goals?: string[];
      experience_level?: string;
      notifications?: Partial<NotificationSettings>;
    }
  ): Promise<UserProfile> {
    try {
      const updateData = {
        ...preferences,
        updated_at: getCurrentTimestamp(),
      };

      const { data: profile, error } = await this.supabase
        .from(TABLES.PROFILES)
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'updateUserPreferences');
      }

      if (!profile) {
        throw new NotFoundError('User profile');
      }

      logger.info('User preferences updated', { userId, preferences });

      return profile;
    } catch (error) {
      logger.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  /**
   * Delete user profile
   */
  async deleteUserProfile(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(TABLES.PROFILES)
        .delete()
        .eq('user_id', userId);

      if (error) {
        handleSupabaseError(error, 'deleteUserProfile');
      }

      logger.info('User profile deleted', { userId });
    } catch (error) {
      logger.error('Failed to delete user profile:', error);
      throw error;
    }
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      // Get user profile
      const user = await this.getUserProfile(userId);

      // Get user statistics
      const stats = await this.getUserStats(userId);

      // Get recent activities
      const recent_activities = await this.getRecentActivities(userId, 5);

      // Get upcoming goals
      const upcoming_goals = await this.getUserGoals(userId);

      // Get recommendations
      const recommendations = await this.getRecommendations(userId);

      // Get mood trend (last 7 days)
      const mood_trend = await this.getMoodTrend(userId, 7);

      return {
        user,
        stats,
        recent_activities,
        upcoming_goals,
        recommendations,
        mood_trend,
      };
    } catch (error) {
      logger.error('Failed to get dashboard data:', error);
      throw error;
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId: string, file: any): Promise<string> {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `${userId}_${uuidv4()}${fileExtension}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file
      fs.writeFileSync(filepath, file.buffer);

      // Generate URL
      const avatarUrl = `/uploads/avatars/${filename}`;

      // Update user profile with avatar URL
      await this.updateUserProfile(userId, { avatar_url: avatarUrl });

      logger.info('Avatar uploaded', { userId, filename });

      return avatarUrl;
    } catch (error) {
      logger.error('Failed to upload avatar:', error);
      throw error;
    }
  }

  /**
   * Get activity feed
   */
  async getActivityFeed(userId: string, page: number = 1, limit: number = 20): Promise<{
    activities: Activity[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // This would typically involve querying multiple tables
      // For now, we'll return a simplified version
      const activities: Activity[] = [];

      // Get meditation sessions
      const { data: meditationSessions } = await this.supabase
        .from(TABLES.MEDITATION_SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      // Get workout sessions
      const { data: workoutSessions } = await this.supabase
        .from(TABLES.WORKOUT_SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      // Convert to activities
      meditationSessions?.forEach(session => {
        activities.push({
          id: session.id,
          type: 'meditation',
          title: `${session.session_type} Meditation`,
          description: `Completed ${session.duration_minutes} minutes`,
          timestamp: session.completed_at || session.created_at,
        });
      });

      workoutSessions?.forEach(session => {
        activities.push({
          id: session.id,
          type: 'workout',
          title: `${session.routine_type} Workout`,
          description: `Completed ${session.reps_completed} reps`,
          timestamp: session.completed_at || session.created_at,
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        activities: activities.slice((page - 1) * limit, page * limit),
        total: activities.length,
        hasMore: activities.length > page * limit,
      };
    } catch (error) {
      logger.error('Failed to get activity feed:', error);
      throw error;
    }
  }

  /**
   * Get user goals
   */
  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      // This would typically be stored in a goals table
      // For now, return default goals based on user profile
      const profile = await this.getUserProfile(userId);
      
      const defaultGoals: Goal[] = [
        {
          id: 'meditation_streak',
          type: 'streak',
          title: 'Meditation Streak',
          description: 'Maintain a daily meditation practice',
          target_value: 30,
          current_value: 0, // This would be calculated from streaks
          status: 'active',
        },
        {
          id: 'workout_streak',
          type: 'streak',
          title: 'Workout Streak',
          description: 'Maintain a regular workout routine',
          target_value: 21,
          current_value: 0, // This would be calculated from streaks
          status: 'active',
        },
      ];

      return defaultGoals;
    } catch (error) {
      logger.error('Failed to get user goals:', error);
      throw error;
    }
  }

  /**
   * Update user goals
   */
  async updateUserGoals(userId: string, goals: Goal[]): Promise<Goal[]> {
    try {
      // This would typically involve storing goals in the database
      // For now, just return the goals as-is
      logger.info('User goals updated', { userId, goalsCount: goals.length });
      return goals;
    } catch (error) {
      logger.error('Failed to update user goals:', error);
      throw error;
    }
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      const profile = await this.getUserProfile(userId);
      
      // Default privacy settings
      const defaultPrivacy: PrivacySettings = {
        profile_visibility: 'private',
        data_sharing: false,
        analytics_sharing: true,
        leaderboard_participation: false,
      };

      return profile.privacy || defaultPrivacy;
    } catch (error) {
      logger.error('Failed to get privacy settings:', error);
      throw error;
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    settings: Partial<PrivacySettings>
  ): Promise<PrivacySettings> {
    try {
      const currentSettings = await this.getPrivacySettings(userId);
      const updatedSettings = { ...currentSettings, ...settings };

      // Update in profile
      await this.updateUserProfile(userId, { privacy: updatedSettings });

      logger.info('Privacy settings updated', { userId, settings });

      return updatedSettings;
    } catch (error) {
      logger.error('Failed to update privacy settings:', error);
      throw error;
    }
  }

  /**
   * Export user data
   */
  async exportUserData(userId: string, format: string = 'json'): Promise<string> {
    try {
      const profile = await this.getUserProfile(userId);
      const stats = await this.getUserStats(userId);
      const activities = await this.getActivityFeed(userId, 1, 1000);

      const exportData = {
        profile,
        stats,
        activities: activities.activities,
        exported_at: new Date().toISOString(),
      };

      if (format === 'json') {
        return JSON.stringify(exportData, null, 2);
      } else {
        // Convert to CSV format
        const csvData = this.convertToCSV(exportData);
        return csvData;
      }
    } catch (error) {
      logger.error('Failed to export user data:', error);
      throw error;
    }
  }

  /**
   * Get notifications
   */
  async getNotifications(
    userId: string,
    unreadOnly: boolean = false,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    notifications: any[];
    unreadCount: number;
    total: number;
    hasMore: boolean;
  }> {
    try {
      // This would typically involve a notifications table
      // For now, return empty array
      return {
        notifications: [],
        unreadCount: 0,
        total: 0,
        hasMore: false,
      };
    } catch (error) {
      logger.error('Failed to get notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(userId: string, notificationId: string): Promise<void> {
    try {
      // This would typically update a notifications table
      logger.info('Notification marked as read', { userId, notificationId });
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  private async getUserStats(userId: string): Promise<DashboardData['stats']> {
    try {
      // Get meditation sessions count
      const { count: meditationCount } = await this.supabase
        .from(TABLES.MEDITATION_SESSIONS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get workout sessions count
      const { count: workoutCount } = await this.supabase
        .from(TABLES.WORKOUT_SESSIONS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get achievements count
      const { count: achievementsCount } = await this.supabase
        .from(TABLES.USER_ACHIEVEMENTS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get current streaks
      const { data: streaks } = await this.supabase
        .from(TABLES.USER_STREAKS)
        .select('meditation_streak, workout_streak')
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
        achievements_count: achievementsCount || 0,
        level: 1, // This would be calculated based on experience points
        experience_points: 0, // This would be calculated from activities
      };
    } catch (error) {
      logger.error('Failed to get user stats:', error);
      throw error;
    }
  }

  /**
   * Get recent activities
   */
  private async getRecentActivities(userId: string, limit: number): Promise<Activity[]> {
    try {
      const activityFeed = await this.getActivityFeed(userId, 1, limit);
      return activityFeed.activities;
    } catch (error) {
      logger.error('Failed to get recent activities:', error);
      return [];
    }
  }

  /**
   * Get recommendations
   */
  private async getRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      // This would typically involve AI recommendations
      // For now, return default recommendations
      return [
        {
          id: 'meditation_beginner',
          type: 'meditation',
          title: 'Beginner Meditation',
          description: 'Start your meditation journey with guided sessions',
          priority: 'high',
          reasoning: 'Based on your experience level',
        },
      ];
    } catch (error) {
      logger.error('Failed to get recommendations:', error);
      return [];
    }
  }

  /**
   * Get mood trend
   */
  private async getMoodTrend(userId: string, days: number): Promise<MoodData[]> {
    try {
      // Get mood check-ins for the last N days
      const { data: moodCheckins } = await this.supabase
        .from(TABLES.MOOD_CHECKINS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(days);

      return moodCheckins?.map(checkin => ({
        date: checkin.created_at,
        mood: checkin.mood_rating,
        notes: checkin.notes,
      })) || [];
    } catch (error) {
      logger.error('Failed to get mood trend:', error);
      return [];
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any): string {
    // Simple CSV conversion - in production, use a proper CSV library
    const headers = Object.keys(data);
    const rows = [headers.join(',')];
    
    // Add data rows (simplified)
    rows.push(JSON.stringify(data));
    
    return rows.join('\n');
  }
}

