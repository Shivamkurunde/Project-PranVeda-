/**
 * Authentication Service
 * Business logic for user authentication and profile management
 */

import { getSupabaseClient, TABLES, handleSupabaseError, getCurrentTimestamp } from '../../../config/supabase.js';
import { createCustomToken, verifyFirebaseToken, getFirebaseAuth } from '../../../config/firebase.js';
import { logger } from '../../../middleware/logger.js';
import { APIError, NotFoundError, ConflictError } from '../../../middleware/errorHandler.js';

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferred_language: string;
  wellness_goals: string[];
  experience_level: string;
  role: string;
  created_at: string;
  updated_at: string;
}

/**
 * User profile creation data
 */
export interface CreateUserProfileData {
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  preferred_language?: string;
  wellness_goals?: string[];
  experience_level?: string;
  email?: string | null;
  role?: string;
  notifications?: any;
  privacy?: any;
}

/**
 * User preferences update data
 */
export interface UpdateUserPreferencesData {
  display_name?: string;
  avatar_url?: string;
  preferred_language?: string;
  wellness_goals?: string[];
  experience_level?: string;
}

/**
 * Session information
 */
export interface SessionInfo {
  user_id: string;
  created_at: string;
  last_active: string;
  is_active: boolean;
}

/**
 * User statistics
 */
export interface UserStats {
  total_sessions: number;
  meditation_sessions: number;
  workout_sessions: number;
  current_streaks: {
    meditation: number;
    workout: number;
  };
  achievements_count: number;
  join_date: string;
}

/**
 * Authentication service class
 */
export class AuthService {
  private supabase = getSupabaseClient();

  /**
   * Create user profile
   */
  async createUserProfile(data: CreateUserProfileData): Promise<UserProfile> {
    try {
      const profileData = {
        user_id: data.user_id,
        display_name: data.display_name || null,
        avatar_url: data.avatar_url || null,
        preferred_language: data.preferred_language || 'English',
        wellness_goals: data.wellness_goals || [],
        experience_level: 'Beginner',
        email: data.email || null, // Allow null for now since we get email from Firebase
        notifications: data.notifications || {
          email_notifications: true,
          push_notifications: true,
          meditation_reminders: true,
          workout_reminders: true,
          achievement_notifications: true,
          weekly_reports: false,
          marketing_emails: false
        },
        privacy: data.privacy || {
          profile_visibility: 'public',
          data_sharing: true,
          analytics_sharing: true,
          leaderboard_participation: true
        },
        role: data.role || 'user',
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      };

      const { data: profile, error } = await this.supabase
        .from(TABLES.PROFILES)
        .insert(profileData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'createUserProfile');
      }

      logger.info('User profile created', {
        userId: data.user_id,
        displayName: profile?.display_name,
      });

      return profile;
    } catch (error) {
      logger.error('Failed to create user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await this.supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
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
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: UpdateUserPreferencesData): Promise<UserProfile> {
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

      logger.info('User preferences updated', {
        userId,
        preferences,
      });

      return profile;
    } catch (error) {
      logger.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  /**
   * Soft delete user profile
   */
  async softDeleteUserProfile(userId: string): Promise<void> {
    try {
      // Instead of deleting, we could mark as deleted or archive
      // For now, we'll actually delete the profile
      const { error } = await this.supabase
        .from(TABLES.PROFILES)
        .delete()
        .eq('user_id', userId);

      if (error) {
        handleSupabaseError(error, 'softDeleteUserProfile');
      }

      logger.info('User profile soft deleted', { userId });
    } catch (error) {
      logger.error('Failed to soft delete user profile:', error);
      throw error;
    }
  }

  /**
   * Create custom token for user
   */
  async createCustomToken(userId: string, additionalClaims?: Record<string, any>): Promise<string> {
    try {
      return await createCustomToken(userId, additionalClaims);
    } catch (error) {
      logger.error('Failed to create custom token:', error);
      throw new APIError('Failed to create custom token');
    }
  }

  /**
   * Verify Firebase token
   */
  async verifyFirebaseToken(idToken: string): Promise<any> {
    try {
      return await verifyFirebaseToken(idToken);
    } catch (error) {
      logger.error('Failed to verify Firebase token:', error);
      throw new APIError('Invalid token');
    }
  }

  /**
   * Verify user password (for account deletion)
   * SECURITY FIX: Now properly verifies password using Firebase authentication
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      // Get user email from Firebase
      const auth = getFirebaseAuth();
      const userRecord = await auth.getUser(userId);
      
      if (!userRecord.email) {
        throw new APIError('User email not found', 404, 'USER_EMAIL_NOT_FOUND');
      }
      
      // Attempt to sign in with provided password to verify it
      // Note: This requires using Firebase REST API since Admin SDK can't verify passwords
      const firebaseWebApiKey = process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY;
      
      if (!firebaseWebApiKey) {
        logger.error('Firebase Web API key not configured. Cannot verify password.');
        throw new APIError('Password verification not available', 500, 'CONFIG_ERROR');
      }

      const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseWebApiKey}`;
      
      const response = await fetch(firebaseAuthUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userRecord.email,
          password: password,
          returnSecureToken: true,
        }),
      });
      
      const data = await response.json();
      
      // If sign-in successful, password is correct
      if (response.ok && data.idToken) {
        logger.info('Password verification successful', { userId });
        return true;
      }
      
      logger.warn('Password verification failed', { userId, reason: data.error?.message });
      return false;
    } catch (error) {
      logger.error('Failed to verify password:', error);
      return false; // Return false instead of throwing to prevent account deletion
    }
  }

  /**
   * Check if user exists by email
   */
  async checkUserExists(email: string): Promise<boolean> {
    try {
      const auth = getFirebaseAuth();
      const userRecord = await auth.getUserByEmail(email);
      return !!userRecord;
    } catch (error) {
      // If user doesn't exist, Firebase throws an error
      return false;
    }
  }

  /**
   * Get session information
   */
  async getSessionInfo(userId: string): Promise<SessionInfo> {
    try {
      const profile = await this.getUserProfile(userId);
      
      return {
        user_id: userId,
        created_at: profile?.created_at || new Date().toISOString(),
        last_active: new Date().toISOString(),
        is_active: true,
      };
    } catch (error) {
      logger.error('Failed to get session info:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
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

      // Get user profile for join date
      const profile = await this.getUserProfile(userId);

      return {
        total_sessions: (meditationCount || 0) + (workoutCount || 0),
        meditation_sessions: meditationCount || 0,
        workout_sessions: workoutCount || 0,
        current_streaks: {
          meditation: streaks?.meditation_streak || 0,
          workout: streaks?.workout_streak || 0,
        },
        achievements_count: achievementsCount || 0,
        join_date: profile?.created_at || new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to get user stats:', error);
      throw error;
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    try {
      await this.supabase
        .from(TABLES.PROFILES)
        .update({ updated_at: getCurrentTimestamp() })
        .eq('user_id', userId);
    } catch (error) {
      // Don't throw error for last active update
      logger.warn('Failed to update last active:', error);
    }
  }

  /**
   * Get user profile by ID (for admin)
   */
  async getUserProfileById(profileId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await this.supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        handleSupabaseError(error, 'getUserProfileById');
      }

      return profile;
    } catch (error) {
      logger.error('Failed to get user profile by ID:', error);
      throw error;
    }
  }

  /**
   * List all users (admin only)
   */
  async listUsers(limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    try {
      const { data: profiles, error } = await this.supabase
        .from(TABLES.PROFILES)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        handleSupabaseError(error, 'listUsers');
      }

      return profiles || [];
    } catch (error) {
      logger.error('Failed to list users:', error);
      throw error;
    }
  }

  /**
   * Search users by display name
   */
  async searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
    try {
      const { data: profiles, error } = await this.supabase
        .from(TABLES.PROFILES)
        .select('*')
        .ilike('display_name', `%${query}%`)
        .limit(limit);

      if (error) {
        handleSupabaseError(error, 'searchUsers');
      }

      return profiles || [];
    } catch (error) {
      logger.error('Failed to search users:', error);
      throw error;
    }
  }

  /**
   * Create password reset token
   */
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('password_reset_tokens')
        .insert({
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString(),
          used: false,
          created_at: getCurrentTimestamp(),
        });

      if (error) {
        handleSupabaseError(error, 'createPasswordResetToken');
      }

      logger.info('Password reset token created', { userId });
    } catch (error) {
      logger.error('Failed to create password reset token:', error);
      throw new APIError('Failed to create reset token');
    }
  }

  /**
   * Verify password reset token
   */
  async verifyPasswordResetToken(token: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('password_reset_tokens')
        .select('user_id, expires_at, used')
        .eq('token', token)
        .single();

      if (error || !data || data.used) {
        logger.warn('Invalid or used reset token');
        return null;
      }

      if (new Date(data.expires_at) < new Date()) {
        logger.warn('Expired reset token');
        return null;
      }

      return data.user_id;
    } catch (error) {
      logger.error('Failed to verify password reset token:', error);
      return null;
    }
  }

  /**
   * Mark reset token as used
   */
  async markResetTokenUsed(token: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token);

      if (error) {
        handleSupabaseError(error, 'markResetTokenUsed');
      }

      logger.info('Reset token marked as used');
    } catch (error) {
      logger.error('Failed to mark reset token as used:', error);
      throw error;
    }
  }

  /**
   * Create email verification token
   */
  async createEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_verification_tokens')
        .insert({
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString(),
          used: false,
          created_at: getCurrentTimestamp(),
        });

      if (error) {
        handleSupabaseError(error, 'createEmailVerificationToken');
      }

      logger.info('Email verification token created', { userId });
    } catch (error) {
      logger.error('Failed to create email verification token:', error);
      throw new APIError('Failed to create verification token');
    }
  }

  /**
   * Verify email token
   */
  async verifyEmailToken(token: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('email_verification_tokens')
        .select('user_id, expires_at, used')
        .eq('token', token)
        .single();

      if (error || !data || data.used) {
        logger.warn('Invalid or used verification token');
        return null;
      }

      if (new Date(data.expires_at) < new Date()) {
        logger.warn('Expired verification token');
        return null;
      }

      return data.user_id;
    } catch (error) {
      logger.error('Failed to verify email token:', error);
      return null;
    }
  }

  /**
   * Mark email as verified
   */
  async markEmailVerified(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(TABLES.PROFILES)
        .update({ email_verified: true })
        .eq('user_id', userId);

      if (error) {
        handleSupabaseError(error, 'markEmailVerified');
      }

      // Mark the token as used
      await this.supabase
        .from('email_verification_tokens')
        .update({ used: true })
        .eq('user_id', userId);

      logger.info('Email marked as verified', { userId });
    } catch (error) {
      logger.error('Failed to mark email as verified:', error);
      throw error;
    }
  }
}

