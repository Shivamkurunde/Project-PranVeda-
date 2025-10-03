-- PranVeda Zen Flow - Wellness Platform Tables
-- Migration: Create wellness-related tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create meditation_sessions table
CREATE TABLE IF NOT EXISTS public.meditation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    completed_at TIMESTAMP WITH TIME ZONE,
    celebration_triggered BOOLEAN DEFAULT FALSE,
    notes TEXT,
    mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
    mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_sessions table
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_type VARCHAR(50) NOT NULL,
    reps_completed INTEGER DEFAULT 0 CHECK (reps_completed >= 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    calories_burned INTEGER CHECK (calories_burned >= 0),
    completed_at TIMESTAMP WITH TIME ZONE,
    celebration_triggered BOOLEAN DEFAULT FALSE,
    notes TEXT,
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    meditation_streak INTEGER DEFAULT 0 CHECK (meditation_streak >= 0),
    workout_streak INTEGER DEFAULT 0 CHECK (workout_streak >= 0),
    last_meditation_date DATE,
    last_workout_date DATE,
    longest_meditation_streak INTEGER DEFAULT 0 CHECK (longest_meditation_streak >= 0),
    longest_workout_streak INTEGER DEFAULT 0 CHECK (longest_workout_streak >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    celebration_viewed BOOLEAN DEFAULT FALSE,
    points_awarded INTEGER DEFAULT 0 CHECK (points_awarded >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_interactions table
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('mood_analysis', 'recommendation', 'chat', 'weekly_insights')),
    input_text TEXT,
    ai_response TEXT,
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
    tokens_used INTEGER CHECK (tokens_used >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mood_checkins table
CREATE TABLE IF NOT EXISTS public.mood_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 5),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create celebration_events table
CREATE TABLE IF NOT EXISTS public.celebration_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('meditation_complete', 'workout_complete', 'streak_milestone', 'badge_unlock', 'level_up')),
    audio_file VARCHAR(255),
    animation_type VARCHAR(50),
    score_increment INTEGER DEFAULT 0,
    badge_unlocked VARCHAR(100),
    message TEXT,
    viewed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audio_feedback table
CREATE TABLE IF NOT EXISTS public.audio_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    audio_type VARCHAR(50) NOT NULL CHECK (audio_type IN ('meditation', 'workout', 'celebration', 'ambient')),
    file_path VARCHAR(500) NOT NULL,
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('play', 'pause', 'stop', 'skip', 'like', 'dislike')),
    duration_seconds INTEGER CHECK (duration_seconds >= 0),
    volume_level INTEGER CHECK (volume_level >= 0 AND volume_level <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('meditation', 'workout', 'streak', 'achievement', 'mood')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_value INTEGER NOT NULL CHECK (target_value > 0),
    current_value INTEGER DEFAULT 0 CHECK (current_value >= 0),
    unit VARCHAR(20) DEFAULT 'count',
    deadline DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_notifications table
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('achievement', 'reminder', 'streak', 'recommendation', 'system')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_analytics table
CREATE TABLE IF NOT EXISTS public.user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meditation_minutes INTEGER DEFAULT 0 CHECK (meditation_minutes >= 0),
    workout_minutes INTEGER DEFAULT 0 CHECK (workout_minutes >= 0),
    mood_rating DECIMAL(3,2) CHECK (mood_rating >= 1.0 AND mood_rating <= 5.0),
    energy_level DECIMAL(3,2) CHECK (energy_level >= 1.0 AND energy_level <= 5.0),
    stress_level DECIMAL(3,2) CHECK (stress_level >= 1.0 AND stress_level <= 5.0),
    sleep_hours DECIMAL(4,2) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    calories_burned INTEGER DEFAULT 0 CHECK (calories_burned >= 0),
    achievements_unlocked INTEGER DEFAULT 0 CHECK (achievements_unlocked >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON public.meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_completed_at ON public.meditation_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed_at ON public.workout_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_badge_type ON public.user_achievements(badge_type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON public.ai_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_mood_checkins_user_id ON public.mood_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_checkins_created_at ON public.mood_checkins(created_at);
CREATE INDEX IF NOT EXISTS idx_celebration_events_user_id ON public.celebration_events(user_id);
CREATE INDEX IF NOT EXISTS idx_celebration_events_viewed ON public.celebration_events(viewed);
CREATE INDEX IF NOT EXISTS idx_audio_feedback_user_id ON public.audio_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON public.user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON public.user_notifications(read);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id_date ON public.user_analytics(user_id, date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_meditation_sessions_updated_at BEFORE UPDATE ON public.meditation_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON public.user_achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_interactions_updated_at BEFORE UPDATE ON public.ai_interactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mood_checkins_updated_at BEFORE UPDATE ON public.mood_checkins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_celebration_events_updated_at BEFORE UPDATE ON public.celebration_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_audio_feedback_updated_at BEFORE UPDATE ON public.audio_feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON public.user_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_notifications_updated_at BEFORE UPDATE ON public.user_notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_analytics_updated_at BEFORE UPDATE ON public.user_analytics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meditation_sessions
CREATE POLICY "Users can view own meditation sessions" ON public.meditation_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meditation sessions" ON public.meditation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meditation sessions" ON public.meditation_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meditation sessions" ON public.meditation_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for workout_sessions
CREATE POLICY "Users can view own workout sessions" ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout sessions" ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout sessions" ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout sessions" ON public.workout_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_streaks
CREATE POLICY "Users can view own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON public.user_achievements FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for ai_interactions
CREATE POLICY "Users can view own AI interactions" ON public.ai_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI interactions" ON public.ai_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI interactions" ON public.ai_interactions FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for mood_checkins
CREATE POLICY "Users can view own mood checkins" ON public.mood_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood checkins" ON public.mood_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood checkins" ON public.mood_checkins FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for celebration_events
CREATE POLICY "Users can view own celebration events" ON public.celebration_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own celebration events" ON public.celebration_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own celebration events" ON public.celebration_events FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for audio_feedback
CREATE POLICY "Users can view own audio feedback" ON public.audio_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audio feedback" ON public.audio_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own audio feedback" ON public.audio_feedback FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_goals
CREATE POLICY "Users can view own goals" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.user_goals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_notifications
CREATE POLICY "Users can view own notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.user_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_analytics
CREATE POLICY "Users can view own analytics" ON public.user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON public.user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON public.user_analytics FOR UPDATE USING (auth.uid() = user_id);

-- Insert some default achievement types
INSERT INTO public.user_achievements (user_id, badge_type, badge_name, badge_description, points_awarded) 
SELECT 
    uuid_generate_v4() as user_id,
    'first_meditation' as badge_type,
    'First Steps' as badge_name,
    'Complete your first meditation session' as badge_description,
    10 as points_awarded
WHERE NOT EXISTS (SELECT 1 FROM public.user_achievements WHERE badge_type = 'first_meditation');

-- Create function to initialize user streaks when a new user is created
CREATE OR REPLACE FUNCTION public.initialize_user_streaks()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_streaks (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to initialize user streaks
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.initialize_user_streaks();

-- Create function to calculate and update streaks
CREATE OR REPLACE FUNCTION public.update_user_streaks(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_last_meditation_date DATE;
    v_last_workout_date DATE;
    v_meditation_streak INTEGER := 0;
    v_workout_streak INTEGER := 0;
    v_current_date DATE := CURRENT_DATE;
BEGIN
    -- Get last meditation and workout dates
    SELECT last_meditation_date, last_workout_date
    INTO v_last_meditation_date, v_last_workout_date
    FROM public.user_streaks
    WHERE user_id = p_user_id;

    -- Calculate meditation streak
    IF v_last_meditation_date IS NOT NULL THEN
        IF v_last_meditation_date = v_current_date THEN
            -- Activity today, increment streak
            v_meditation_streak := (SELECT meditation_streak FROM public.user_streaks WHERE user_id = p_user_id) + 1;
        ELSIF v_last_meditation_date = v_current_date - INTERVAL '1 day' THEN
            -- Activity yesterday, increment streak
            v_meditation_streak := (SELECT meditation_streak FROM public.user_streaks WHERE user_id = p_user_id) + 1;
        ELSE
            -- Gap in streak, reset to 0
            v_meditation_streak := 0;
        END IF;
    END IF;

    -- Calculate workout streak (similar logic)
    IF v_last_workout_date IS NOT NULL THEN
        IF v_last_workout_date = v_current_date THEN
            v_workout_streak := (SELECT workout_streak FROM public.user_streaks WHERE user_id = p_user_id) + 1;
        ELSIF v_last_workout_date = v_current_date - INTERVAL '1 day' THEN
            v_workout_streak := (SELECT workout_streak FROM public.user_streaks WHERE user_id = p_user_id) + 1;
        ELSE
            v_workout_streak := 0;
        END IF;
    END IF;

    -- Update streaks
    UPDATE public.user_streaks
    SET 
        meditation_streak = v_meditation_streak,
        workout_streak = v_workout_streak,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ language 'plpgsql';

COMMENT ON TABLE public.meditation_sessions IS 'User meditation session records';
COMMENT ON TABLE public.workout_sessions IS 'User workout session records';
COMMENT ON TABLE public.user_streaks IS 'User streak tracking for meditation and workouts';
COMMENT ON TABLE public.user_achievements IS 'User achievements and badges';
COMMENT ON TABLE public.ai_interactions IS 'AI service interactions and responses';
COMMENT ON TABLE public.mood_checkins IS 'Daily mood and wellness check-ins';
COMMENT ON TABLE public.celebration_events IS 'Celebration events for achievements and milestones';
COMMENT ON TABLE public.audio_feedback IS 'Audio playback feedback and preferences';
COMMENT ON TABLE public.user_goals IS 'User-defined wellness goals and targets';
COMMENT ON TABLE public.user_notifications IS 'User notifications and messages';
COMMENT ON TABLE public.user_analytics IS 'Daily aggregated user analytics data';

