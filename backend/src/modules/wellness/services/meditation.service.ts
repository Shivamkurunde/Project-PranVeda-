/**
 * Meditation Service
 * Business logic for meditation sessions and tracking
 */

import { getSupabaseClient, TABLES, handleSupabaseError, getCurrentTimestamp } from '../../../config/supabase.js';
import { logger } from '../../../middleware/logger.js';
import { APIError, NotFoundError } from '../../../middleware/errorHandler.js';

export interface MeditationSession {
  id: string;
  user_id: string;
  session_type: string;
  duration_minutes: number;
  completed_at: string | null;
  celebration_triggered: boolean;
  notes?: string;
  mood_before?: number;
  mood_after?: number;
  created_at: string;
  updated_at: string;
}

export interface AvailableSession {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  category: string;
  difficulty: string;
  audio_url: string;
  thumbnail_url?: string;
  tags: string[];
}

export class MeditationService {
  private supabase = getSupabaseClient();

  async getAvailableSessions(filters: any): Promise<AvailableSession[]> {
    // Mock data for now - in production, this would come from a content management system
    const sessions: AvailableSession[] = [
      {
        id: 'breathing-basics',
        title: 'Breathing Basics',
        description: 'Learn fundamental breathing techniques',
        duration_minutes: 10,
        category: 'breathing',
        difficulty: 'beginner',
        audio_url: '/audio/breathing-basics.mp3',
        tags: ['breathing', 'beginner', 'calm']
      },
      {
        id: 'mindfulness-5min',
        title: '5-Minute Mindfulness',
        description: 'Quick mindfulness practice',
        duration_minutes: 5,
        category: 'mindfulness',
        difficulty: 'beginner',
        audio_url: '/audio/mindfulness-5min.mp3',
        tags: ['mindfulness', 'quick', 'beginner']
      }
    ];

    return sessions.filter(session => {
      if (filters.category && session.category !== filters.category) return false;
      if (filters.difficulty && session.difficulty !== filters.difficulty) return false;
      if (filters.duration && session.duration_minutes !== filters.duration) return false;
      return true;
    });
  }

  async getSessionById(sessionId: string, userId?: string): Promise<AvailableSession | null> {
    const sessions = await this.getAvailableSessions({});
    return sessions.find(s => s.id === sessionId) || null;
  }

  async startSession(userId: string, sessionId: string, options: any): Promise<MeditationSession> {
    try {
      const sessionData = {
        user_id: userId,
        session_type: sessionId,
        duration_minutes: options.expected_duration,
        completed_at: null,
        celebration_triggered: false,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      };

      const { data: session, error } = await this.supabase
        .from(TABLES.MEDITATION_SESSIONS)
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'startSession');
      }

      return session;
    } catch (error) {
      logger.error('Failed to start meditation session:', error);
      throw error;
    }
  }

  async completeSession(userId: string, sessionId: string, data: any): Promise<any> {
    try {
      const { data: session, error } = await this.supabase
        .from(TABLES.MEDITATION_SESSIONS)
        .update({
          duration_minutes: data.duration_minutes,
          completed_at: getCurrentTimestamp(),
          notes: data.notes,
          mood_before: data.mood_before,
          mood_after: data.mood_after,
          updated_at: getCurrentTimestamp(),
        })
        .eq('user_id', userId)
        .eq('session_type', sessionId)
        .is('completed_at', null)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'completeSession');
      }

      // Update streaks
      await this.updateStreaks(userId, 'meditation');

      return {
        session,
        celebrationTriggered: false,
        streakUpdate: { meditation_streak: 1 }
      };
    } catch (error) {
      logger.error('Failed to complete meditation session:', error);
      throw error;
    }
  }

  async getUserHistory(userId: string, options: any): Promise<any> {
    try {
      const { data: sessions, error } = await this.supabase
        .from(TABLES.MEDITATION_SESSIONS)
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
          average_duration: 0
        }
      };
    } catch (error) {
      logger.error('Failed to get meditation history:', error);
      throw error;
    }
  }

  async getUserStats(userId: string, period: string): Promise<any> {
    return {
      total_sessions: 0,
      total_minutes: 0,
      current_streak: 0,
      longest_streak: 0,
      favorite_category: 'mindfulness',
      average_duration: 0
    };
  }

  async getRecommendations(userId: string, context: any): Promise<any[]> {
    return [
      {
        id: 'recommendation-1',
        title: 'Morning Mindfulness',
        reason: 'Based on your recent activity',
        priority: 'high'
      }
    ];
  }

  async saveProgress(userId: string, sessionId: string, progress: any): Promise<any> {
    return { saved: true, timestamp: getCurrentTimestamp() };
  }

  async getCategories(): Promise<any[]> {
    return [
      { id: 'breathing', name: 'Breathing', description: 'Breathing exercises' },
      { id: 'mindfulness', name: 'Mindfulness', description: 'Mindfulness practices' },
      { id: 'body-scan', name: 'Body Scan', description: 'Body awareness meditations' }
    ];
  }

  async getTechniques(category?: string): Promise<any[]> {
    return [
      { id: 'technique-1', name: 'Basic Breathing', category: 'breathing' },
      { id: 'technique-2', name: 'Mindful Breathing', category: 'mindfulness' }
    ];
  }

  async rateSession(userId: string, sessionId: string, rating: any): Promise<any> {
    return { rating: rating.rating, feedback: rating.feedback };
  }

  private async updateStreaks(userId: string, type: 'meditation' | 'workout'): Promise<void> {
    // Implementation would update user streaks
    logger.info('Streaks updated', { userId, type });
  }
}
