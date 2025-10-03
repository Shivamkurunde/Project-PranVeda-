/**
 * Supabase Client Configuration
 * Handles database operations and real-time subscriptions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Supabase client instance
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client
 */
export function initializeSupabase(): SupabaseClient {
  try {
    if (supabaseClient) {
      return supabaseClient;
    }

    supabaseClient = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        db: {
          schema: 'public',
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      }
    );

    console.log('🗄️  Supabase client initialized successfully');
    console.log(`  - URL: ${env.SUPABASE_URL}`);
    console.log(`  - Service Role Key: ${env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);

    return supabaseClient;
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
    throw new Error('Failed to initialize Supabase client');
  }
}

/**
 * Get Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initializeSupabase() first.');
  }
  return supabaseClient;
}

/**
 * Database table names
 */
export const TABLES = {
  PROFILES: 'profiles',
  MEDITATION_SESSIONS: 'meditation_sessions',
  WORKOUT_SESSIONS: 'workout_sessions',
  USER_STREAKS: 'user_streaks',
  USER_ACHIEVEMENTS: 'user_achievements',
  AI_INTERACTIONS: 'ai_interactions',
  MOOD_CHECKINS: 'mood_checkins',
  CELEBRATION_EVENTS: 'celebration_events',
  AUDIO_FEEDBACK: 'audio_feedback',
} as const;

/**
 * Database types
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          preferred_language?: string;
          wellness_goals?: string[];
          experience_level?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          preferred_language?: string;
          wellness_goals?: string[];
          experience_level?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      meditation_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: string;
          duration_minutes: number;
          completed_at: string | null;
          celebration_triggered: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: string;
          duration_minutes: number;
          completed_at?: string | null;
          celebration_triggered?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_type?: string;
          duration_minutes?: number;
          completed_at?: string | null;
          celebration_triggered?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          routine_type: string;
          reps_completed: number;
          duration_minutes: number;
          completed_at: string | null;
          celebration_triggered: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          routine_type: string;
          reps_completed: number;
          duration_minutes: number;
          completed_at?: string | null;
          celebration_triggered?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          routine_type?: string;
          reps_completed?: number;
          duration_minutes?: number;
          completed_at?: string | null;
          celebration_triggered?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          meditation_streak: number;
          workout_streak: number;
          last_meditation_date: string | null;
          last_workout_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meditation_streak?: number;
          workout_streak?: number;
          last_meditation_date?: string | null;
          last_workout_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meditation_streak?: number;
          workout_streak?: number;
          last_meditation_date?: string | null;
          last_workout_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          unlocked_at: string;
          celebration_viewed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
          unlocked_at?: string;
          celebration_viewed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_type?: string;
          unlocked_at?: string;
          celebration_viewed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_interactions: {
        Row: {
          id: string;
          user_id: string;
          interaction_type: string;
          input_text: string | null;
          ai_response: string | null;
          sentiment_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          interaction_type: string;
          input_text?: string | null;
          ai_response?: string | null;
          sentiment_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          interaction_type?: string;
          input_text?: string | null;
          ai_response?: string | null;
          sentiment_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mood_checkins: {
        Row: {
          id: string;
          user_id: string;
          mood_rating: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood_rating: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood_rating?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      celebration_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          audio_file: string | null;
          animation_type: string | null;
          score_increment: number;
          badge_unlocked: string | null;
          viewed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          audio_file?: string | null;
          animation_type?: string | null;
          score_increment?: number;
          badge_unlocked?: string | null;
          viewed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          audio_file?: string | null;
          animation_type?: string | null;
          score_increment?: number;
          badge_unlocked?: string | null;
          viewed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      audio_feedback: {
        Row: {
          id: string;
          user_id: string;
          audio_type: string;
          file_path: string;
          feedback_type: string;
          duration_seconds: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          audio_type: string;
          file_path: string;
          feedback_type: string;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          audio_type?: string;
          file_path?: string;
          feedback_type?: string;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

/**
 * Helper function to handle Supabase errors
 */
export function handleSupabaseError(error: any, operation: string): never {
  console.error(`Supabase error in ${operation}:`, error);
  
  if (error.code === 'PGRST116') {
    throw new Error('Record not found');
  }
  
  if (error.code === '23505') {
    throw new Error('Duplicate entry');
  }
  
  if (error.code === '23503') {
    throw new Error('Foreign key constraint violation');
  }
  
  if (error.code === '42501') {
    throw new Error('Insufficient permissions');
  }
  
  throw new Error(`Database operation failed: ${error.message || 'Unknown error'}`);
}

/**
 * Helper function to get current timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// Initialize Supabase on module load
if (!supabaseClient) {
  initializeSupabase();
}

