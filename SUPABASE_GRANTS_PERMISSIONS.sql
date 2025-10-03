-- PranVeda Zen Flow - Complete Database Grants and Permissions
-- This script sets up all necessary grants and permissions for the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant all privileges on all tables in public schema to authenticated users
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant usage on all sequences in public schema to authenticated users
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;

-- Grant specific permissions for anon role (if needed for public content)
GRANT SELECT ON TABLE public.sessions TO anon;
GRANT SELECT ON TABLE public.profiles TO anon;

-- Grant service_role additional permissions for backend operations
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO service_role;

-- Grant specific table permissions with detailed RLS policies

-- PROFILES table permissions
GRANT ALL ON TABLE public.profiles TO authenticated;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SESSIONS table permissions (public content)
GRANT SELECT ON TABLE public.sessions TO authenticated;
GRANT SELECT ON TABLE public.sessions TO anon;
CREATE POLICY "Sessions are viewable by everyone" ON public.sessions
  FOR SELECT USING (true);

-- USER_SESSIONS table permissions
GRANT ALL ON TABLE public.user_sessions TO authenticated;
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- USER_PROGRESS table permissions
GRANT ALL ON TABLE public.user_progress TO authenticated;
CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- MOOD_LOGS table permissions
GRANT ALL ON TABLE public.mood_logs TO authenticated;
CREATE POLICY "Users can view their own mood logs" ON public.mood_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mood logs" ON public.mood_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI_INTERACTIONS table permissions
GRANT ALL ON TABLE public.ai_interactions TO authenticated;
CREATE POLICY "Users can view their own AI interactions" ON public.ai_interactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own AI interactions" ON public.ai_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CELEBRATIONS table permissions
GRANT ALL ON TABLE public.celebrations TO authenticated;
CREATE POLICY "Users can view their own celebrations" ON public.celebrations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own celebrations" ON public.celebrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- MEDITATION_SESSIONS table permissions
GRANT ALL ON TABLE public.meditation_sessions TO authenticated;
CREATE POLICY "Users can view own meditation sessions" ON public.meditation_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meditation sessions" ON public.meditation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meditation sessions" ON public.meditation_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meditation sessions" ON public.meditation_sessions FOR DELETE USING (auth.uid() = user_id);

-- WORKOUT_SESSIONS table permissions
GRANT ALL ON TABLE public.workout_sessions TO authenticated;
CREATE POLICY "Users can view own workout sessions" ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout sessions" ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout sessions" ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout sessions" ON public.workout_sessions FOR DELETE USING (auth.uid() = user_id);

-- USER_STREAKS table permissions
GRANT ALL ON TABLE public.user_streaks TO authenticated;
CREATE POLICY "Users can view own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- USER_ACHIEVEMENTS table permissions
GRANT ALL ON TABLE public.user_achievements TO authenticated;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON public.user_achievements FOR UPDATE USING (auth.uid() = user_id);

-- AI_INTERACTIONS table permissions (wellness tables)
GRANT ALL ON TABLE public.ai_interactions TO authenticated;
CREATE POLICY "Users can view own AI interactions" ON public.ai_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI interactions" ON public.ai_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI interactions" ON public.ai_interactions FOR UPDATE USING (auth.uid() = user_id);

-- MOOD_CHECKINS table permissions
GRANT ALL ON TABLE public.mood_checkins TO authenticated;
CREATE POLICY "Users can view own mood checkins" ON public.mood_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood checkins" ON public.mood_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood checkins" ON public.mood_checkins FOR UPDATE USING (auth.uid() = user_id);

-- CELEBRATION_EVENTS table permissions
GRANT ALL ON TABLE public.celebration_events TO authenticated;
CREATE POLICY "Users can view own celebration events" ON public.celebration_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own celebration events" ON public.celebration_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own celebration events" ON public.celebration_events FOR UPDATE USING (auth.uid() = user_id);

-- AUDIO_FEEDBACK table permissions
GRANT ALL ON TABLE public.audio_feedback TO authenticated;
CREATE POLICY "Users can view own audio feedback" ON public.audio_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audio feedback" ON public.audio_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own audio feedback" ON public.audio_feedback FOR UPDATE USING (auth.uid() = user_id);

-- USER_GOALS table permissions
GRANT ALL ON TABLE public.user_goals TO authenticated;
CREATE POLICY "Users can view own goals" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.user_goals FOR DELETE USING (auth.uid() = user_id);

-- USER_NOTIFICATIONS table permissions
GRANT ALL ON TABLE public.user_notifications TO authenticated;
CREATE POLICY "Users can view own notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.user_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);

-- USER_ANALYTICS table permissions
GRANT ALL ON TABLE public.user_analytics TO authenticated;
CREATE POLICY "Users can view own analytics" ON public.user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON public.user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON public.user_analytics FOR UPDATE USING (auth.uid() = user_id);

-- PASSWORD_RESET_TOKENS table permissions (security tables)
GRANT ALL ON TABLE public.password_reset_tokens TO authenticated;
CREATE POLICY "Service role can manage reset tokens" ON public.password_reset_tokens
    FOR ALL USING (auth.role() = 'service_role');

-- EMAIL_VERIFICATION_TOKENS table permissions (security tables)
GRANT ALL ON TABLE public.email_verification_tokens TO authenticated;
CREATE POLICY "Service role can manage verification tokens" ON public.email_verification_tokens
    FOR ALL USING (auth.role() = 'service_role');

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Grant usage on auth schema to authenticated users
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant select on auth.users to authenticated users (needed for RLS)
GRANT SELECT ON TABLE auth.users TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meditation_sessions_updated_at 
  BEFORE UPDATE ON public.meditation_sessions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at 
  BEFORE UPDATE ON public.workout_sessions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at 
  BEFORE UPDATE ON public.user_streaks 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at 
  BEFORE UPDATE ON public.user_achievements 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_interactions_updated_at 
  BEFORE UPDATE ON public.ai_interactions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mood_checkins_updated_at 
  BEFORE UPDATE ON public.mood_checkins 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_celebration_events_updated_at 
  BEFORE UPDATE ON public.celebration_events 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audio_feedback_updated_at 
  BEFORE UPDATE ON public.audio_feedback 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at 
  BEFORE UPDATE ON public.user_goals 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_notifications_updated_at 
  BEFORE UPDATE ON public.user_notifications 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at 
  BEFORE UPDATE ON public.user_analytics 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions for auth schema functions
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO authenticated;

-- Grant permissions for public functions
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_tokens() TO authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_user_streaks() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_streaks(UUID) TO authenticated;

-- Ensure service_role has all necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant anon role limited access for public content
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON TABLE public.sessions TO anon;

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'User profile information';
COMMENT ON TABLE public.sessions IS 'Meditation and workout session content';
COMMENT ON TABLE public.user_sessions IS 'User session completion tracking';
COMMENT ON TABLE public.user_progress IS 'User progress and streak tracking';
COMMENT ON TABLE public.mood_logs IS 'User mood tracking';
COMMENT ON TABLE public.ai_interactions IS 'AI chatbot interactions';
COMMENT ON TABLE public.celebrations IS 'User celebration events';