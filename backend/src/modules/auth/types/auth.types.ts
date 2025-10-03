/**
 * Authentication Types
 * Type definitions for authentication module
 */

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferred_language: string;
  wellness_goals: string[];
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileData {
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  preferred_language?: string;
  wellness_goals?: string[];
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface AuthUser {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}
