-- PranVeda Zen Flow Database Schema Creation Script
-- This script creates all necessary tables for the wellness application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Update existing one)
DO $$ 
BEGIN
    -- Add missing columns to profiles table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'notifications') THEN
        ALTER TABLE profiles ADD COLUMN notifications JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "meditation_reminders": true}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'privacy') THEN
        ALTER TABLE profiles ADD COLUMN privacy JSONB DEFAULT '{"profile_visibility": "public", "meditation_history": "private"}';
    END IF;
END $$;

-- 2. WORKOUTS TABLE (Fixed foreign key types)
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
    exercises JSONB DEFAULT '[]',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROGRESS_ENTRIES TABLE
CREATE TABLE IF NOT EXISTS progress_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('meditation', 'workout', 'wellness', 'general')),
    reference_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    metrics JSONB DEFAULT '{}',
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. GAMIFICATION_DATA TABLE
CREATE TABLE IF NOT EXISTS gamification_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    achievements_unlocked JSONB DEFAULT '[]',
    badges_earned JSONB DEFAULT '[]',
    weekly_goals JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AUDIO_FILES TABLE
CREATE TABLE IF NOT EXISTS audio_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    duration_seconds INTEGER,
    audio_type TEXT NOT NULL CHECK (audio_type IN ('meditation', 'workout', 'ambient', 'music', 'custom')),
    category TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. HEALTH_METRICS TABLE
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('weight', 'height', 'heart_rate', 'blood_pressure', 'sleep_hours', 'water_intake', 'steps', 'bmi', 'mood', 'energy', 'stress')),
    value NUMERIC,
    unit TEXT,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. WELLNESS_JOURNALS TABLE
CREATE TABLE IF NOT EXISTS wellness_journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT,
    content TEXT NOT NULL,
    mood TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'poor', 'terrible')),
    tags TEXT[],
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_data_user_id ON gamification_data(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_user_id ON audio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_journals_user_id ON wellness_journals(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing access only to own data)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view own meditation sessions" ON meditation_sessions FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can view own workouts" ON workouts FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can view own progress entries" ON progress_entries FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can view own gamification data" ON gamification_data FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can view own audio files" ON audio_files FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can view own health metrics" ON health_metrics FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can view own wellness journals" ON wellness_journals FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can view own achievements" ON achievements FOR ALL USING (auth.uid() = user_id::uuid);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meditation_sessions_updated_at BEFORE UPDATE ON meditation_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_entries_updated_at BEFORE UPDATE ON progress_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gamification_data_updated_at BEFORE UPDATE ON gamification_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audio_files_updated_at BEFORE UPDATE ON audio_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_metrics_updated_at BEFORE UPDATE ON health_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wellness_journals_updated_at BEFORE UPDATE ON wellness_journals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON meditation_sessions TO authenticated;
GRANT ALL ON workouts TO authenticated;
GRANT ALL ON progress_entries TO authenticated;
GRANT ALL ON gamification_data TO authenticated;
GRANT ALL ON audio_files TO authenticated;
GRANT ALL ON health_metrics TO authenticated;
GRANT ALL ON wellness_journals TO authenticated;
GRANT ALL ON achievements TO authenticated;

-- Insert some sample data for testing (optional)
INSERT INTO gamification_data (user_id, points, level, streak_days) 
SELECT 'test-user-123', 100, 2, 5
WHERE NOT EXISTS (SELECT 1 FROM gamification_data WHERE user_id = 'test-user-123');