/**
 * Create Database Tables Script
 * Creates all required tables for PranVeda Zen Flow using Supabase REST API
 */

const SUPABASE_URL = 'https://uctzjcgttgkwlwcvtqnt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdHpqY2d0dGdrd2x3Y3Z0cW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcyMTcyMCwiZXhwIjoyMDc0Mjk3NzIwfQ.xMlvgtbNYeGH9zzbfCyyLIi-lyIACe1Bi96pn4XBOYU';

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

// SQL statements for each table
const createTablesSQL = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'English',
  bio TEXT,
  wellness_goals TEXT[],
  experience_level TEXT DEFAULT 'Beginner',
  notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('meditation', 'workout', 'breathing', 'yoga')),
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Beginner',
  duration_minutes INTEGER NOT NULL,
  language TEXT DEFAULT 'English',
  video_url TEXT,
  audio_preview_url TEXT,
  equipment_needed TEXT[],
  tags TEXT[],
  rating DECIMAL(2,1) DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  calories_burned INTEGER,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. USER_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
  notes TEXT,
  celebration_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. MEDITATION_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
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

-- 5. WORKOUT_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  routine_type VARCHAR(50) NOT NULL,
  reps_completed INTEGER DEFAULT 0,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  calories_burned INTEGER CHECK (calories_burned >= 0),
  completed_at TIMESTAMP WITH TIME ZONE,
  celebration_triggered BOOLEAN DEFAULT FALSE,
  notes TEXT,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. USER_STREAKS TABLE
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  category VARCHAR(50) NOT NULL,
  points INTEGER DEFAULT 0,
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. USER_ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  achievement_id UUID NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 9. MOOD_ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  emotions TEXT[],
  notes TEXT,
  activities JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. AI_INTERACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  interaction_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Create service role bypass policies
DROP POLICY IF EXISTS "Service role bypass" ON public.profiles;
CREATE POLICY "Service role bypass" ON public.profiles USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON public.sessions;
CREATE POLICY "Service role bypass" ON public.sessions USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON public.user_sessions;
CREATE POLICY "Service role bypass" ON public.user_sessions USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON public.meditation_sessions;
CREATE POLICY "Service role bypass" ON public.meditation_sessions USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON public.workout_sessions;
CREATE POLICY "Service role bypass" ON public.workout_sessions USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON public.user_streaks;
CREATE POLICY "Service role bypass" ON public.user_streaks USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON public.achievements;
CREATE POLICY "Service role bypass" ON public.achievements USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON public.user_achievements;
CREATE POLICY "Service role bypass" ON public.user_achievements USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON public.mood_entries;
CREATE POLICY "Service role bypass" ON public.mood_entries USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON public.ai_interactions;
CREATE POLICY "Service role bypass" ON public.ai_interactions USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, anon, authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON public.meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON public.ai_interactions(user_id);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, category, points, requirement_type, requirement_value) VALUES
  ('First Steps', 'Complete your first meditation session', 'meditation', 10, 'session_count', 1),
  ('Week Warrior', 'Maintain a 7-day streak', 'streak', 50, 'streak_days', 7),
  ('Zen Master', 'Complete 100 meditation sessions', 'meditation', 200, 'session_count', 100),
  ('Fitness Fanatic', 'Complete 50 workout sessions', 'workout', 150, 'session_count', 50),
  ('Early Bird', 'Complete 10 morning sessions', 'habit', 30, 'morning_sessions', 10)
ON CONFLICT (name) DO NOTHING;

SELECT 'All tables created successfully!' as status;
`;

async function createTables() {
  console.log('🚀 Creating database tables...\n');
  
  try {
    // Try to execute SQL via the SQL endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: createTablesSQL })
    });
    
    if (response.ok) {
      console.log('✅ All tables created successfully via SQL endpoint!');
      return true;
    } else {
      console.log('❌ SQL endpoint failed, trying alternative method...');
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Direct SQL execution failed:', error.message);
    console.log('\n📋 MANUAL SETUP REQUIRED:');
    console.log('1. Go to: https://supabase.com/dashboard/project/uctzjcgttgkwlwcvtqnt');
    console.log('2. Click "SQL Editor" → "New Query"');
    console.log('3. Copy the SQL from CREATE_ALL_TABLES.sql');
    console.log('4. Paste and click "Run"\n');
    return false;
  }
}

// Run the function
createTables().then(success => {
  if (success) {
    console.log('🎉 Database setup complete!');
  } else {
    console.log('⚠️  Manual setup required - see instructions above');
  }
}).catch(console.error);
