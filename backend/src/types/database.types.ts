/**
 * Database Type Definitions
 * TypeScript types for Supabase database tables
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

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  meditation_reminders: boolean;
  workout_reminders: boolean;
  achievement_notifications: boolean;
  weekly_reports: boolean;
  marketing_emails: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  data_sharing: boolean;
  analytics_sharing: boolean;
  leaderboard_participation: boolean;
}

export interface MeditationSession {
  id: string;
  user_id: string;
  session_type: string;
  duration_minutes: number;
  completed_at: string | null;
  celebration_triggered: boolean;
  notes: string | null;
  mood_before: number | null;
  mood_after: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_type: string;
  reps_completed: number;
  duration_minutes: number;
  calories_burned: number | null;
  completed_at: string | null;
  celebration_triggered: boolean;
  notes: string | null;
  difficulty_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserStreaks {
  id: string;
  user_id: string;
  meditation_streak: number;
  workout_streak: number;
  last_meditation_date: string | null;
  last_workout_date: string | null;
  longest_meditation_streak: number;
  longest_workout_streak: number;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string | null;
  unlocked_at: string;
  celebration_viewed: boolean;
  points_awarded: number;
  created_at: string;
  updated_at: string;
}

export interface AIInteraction {
  id: string;
  user_id: string;
  interaction_type: string;
  input_text: string | null;
  ai_response: string | null;
  sentiment_score: number | null;
  confidence_score: number | null;
  processing_time_ms: number | null;
  tokens_used: number | null;
  created_at: string;
  updated_at: string;
}

export interface MoodCheckin {
  id: string;
  user_id: string;
  mood_rating: number;
  notes: string | null;
  tags: string[];
  energy_level: number | null;
  stress_level: number | null;
  sleep_quality: number | null;
  created_at: string;
  updated_at: string;
}

export interface CelebrationEvent {
  id: string;
  user_id: string;
  event_type: string;
  audio_file: string | null;
  animation_type: string | null;
  score_increment: number;
  badge_unlocked: string | null;
  message: string | null;
  viewed: boolean;
  viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AudioFeedback {
  id: string;
  user_id: string;
  audio_type: string;
  file_path: string;
  feedback_type: string;
  duration_seconds: number | null;
  volume_level: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string | null;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  read_at: string | null;
  sent_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserAnalytics {
  id: string;
  user_id: string;
  date: string;
  meditation_minutes: number;
  workout_minutes: number;
  mood_rating: number | null;
  energy_level: number | null;
  stress_level: number | null;
  sleep_hours: number | null;
  calories_burned: number;
  achievements_unlocked: number;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Query Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface DateRangeQuery {
  start_date?: string;
  end_date?: string;
}

export interface SearchQuery {
  q?: string;
  category?: string;
  tags?: string;
}

// Filter Types
export interface MeditationFilters {
  category?: string;
  difficulty?: string;
  duration?: number;
  userId?: string;
}

export interface WorkoutFilters {
  category?: string;
  difficulty?: string;
  duration?: number;
  userId?: string;
}

export interface ProgressFilters extends PaginationQuery, DateRangeQuery {
  type?: string;
  metric?: string;
}

// Statistics Types
export interface UserStats {
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
}

export interface WeeklyStats {
  total_minutes: number;
  sessions_count: number;
  average_duration: number;
  mood_trend: number[];
  activity_distribution: Record<string, number>;
}

// Analytics Types
export interface AnalyticsData {
  meditation: {
    total_minutes: number;
    sessions_count: number;
    average_duration: number;
    mood_trend: number[];
  };
  workout: {
    total_minutes: number;
    sessions_count: number;
    calories_burned: number;
    difficulty_trend: number[];
  };
  mood: {
    average_rating: number;
    trend: number[];
    checkins_count: number;
  };
  period: string;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  points_required: number;
  category: string;
  unlocked_at?: string;
}

export interface Level {
  current_level: number;
  experience_points: number;
  current_level_points: number;
  next_level_points: number;
  progress_percentage: number;
}

export interface Celebration {
  id: string;
  event_type: string;
  audio_file: string;
  animation_type: string;
  score_increment: number;
  badge_unlocked?: string;
  message: string;
  viewed: boolean;
}

// AI Types
export interface MoodAnalysis {
  mood: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  sentiment_score: number;
  emotions: string[];
  confidence: number;
  suggestions: string[];
  recommended_activities: string[];
}

export interface AIRecommendation {
  id: string;
  type: 'meditation' | 'workout' | 'tip' | 'article';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface WeeklyInsights {
  summary: string;
  achievements: string[];
  insights: string[];
  recommendations: string[];
  mood_trend: 'improving' | 'stable' | 'declining';
  next_week_focus: string[];
}
