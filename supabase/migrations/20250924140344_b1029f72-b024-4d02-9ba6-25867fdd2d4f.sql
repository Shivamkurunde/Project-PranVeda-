-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'English' CHECK (preferred_language IN ('English', 'Hindi', 'Marathi')),
  bio TEXT,
  wellness_goals TEXT[],
  experience_level TEXT DEFAULT 'Beginner' CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "celebration_audio": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sessions table for meditation and workout content
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('meditation', 'workout', 'breathing', 'yoga')),
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_minutes INTEGER NOT NULL,
  language TEXT DEFAULT 'English' CHECK (language IN ('English', 'Hindi', 'Marathi')),
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

-- Create user_sessions table for tracking completion and progress
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_minutes INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  mood_before TEXT CHECK (mood_before IN ('happy', 'sad', 'anxious', 'stressed', 'calm', 'energetic', 'tired')),
  mood_after TEXT CHECK (mood_after IN ('happy', 'sad', 'anxious', 'stressed', 'calm', 'energetic', 'tired')),
  celebration_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_progress table for streaks and achievements
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  weekly_goal_minutes INTEGER DEFAULT 120,
  weekly_progress_minutes INTEGER DEFAULT 0,
  last_session_date DATE,
  achievements TEXT[],
  badges_earned TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mood_logs table for tracking emotional wellness
CREATE TABLE public.mood_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'sad', 'anxious', 'stressed', 'calm', 'energetic', 'tired')),
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  description TEXT,
  triggers TEXT[],
  session_id UUID REFERENCES public.sessions(id),
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_interactions table for chatbot conversations
CREATE TABLE public.ai_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai')),
  message_content TEXT NOT NULL,
  context_data JSONB,
  response_audio_url TEXT,
  session_context UUID REFERENCES public.sessions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create celebrations table for milestone tracking
CREATE TABLE public.celebrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  celebration_type TEXT NOT NULL CHECK (celebration_type IN ('streak', 'milestone', 'session_complete', 'level_up', 'badge_unlock')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  value INTEGER,
  audio_played BOOLEAN DEFAULT false,
  visual_effect TEXT CHECK (visual_effect IN ('confetti', 'burst', 'glow', 'fireworks')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for sessions (public content)
CREATE POLICY "Sessions are viewable by everyone" ON public.sessions
  FOR SELECT USING (true);

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for mood_logs
CREATE POLICY "Users can view their own mood logs" ON public.mood_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mood logs" ON public.mood_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for ai_interactions
CREATE POLICY "Users can view their own AI interactions" ON public.ai_interactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own AI interactions" ON public.ai_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for celebrations
CREATE POLICY "Users can view their own celebrations" ON public.celebrations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own celebrations" ON public.celebrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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

-- Insert sample session data
INSERT INTO public.sessions (title, description, instructor, session_type, category, difficulty, duration_minutes, language, video_url, audio_preview_url, equipment_needed, tags, rating, participant_count, calories_burned, is_featured) VALUES
('Morning Mindfulness', 'Start your day with peaceful awareness and gentle breathing exercises', 'Dr. Priya Sharma', 'meditation', 'Mindfulness', 'Beginner', 10, 'English', 'dQw4w9WgXcQ', '/audio/morning-preview.mp3', '{}', '{"Morning", "Beginner", "Mindfulness"}', 4.8, 12500, 0, true),
('तनाव मुक्ति ध्यान', 'गहरी श्वास और मन की शांति के लिए विशेष ध्यान तकनीक', 'Guru Rajesh', 'meditation', 'Stress Relief', 'Intermediate', 15, 'Hindi', 'dQw4w9WgXcQ', '/audio/stress-relief-preview.mp3', '{}', '{"Stress", "Hindi", "Breathing"}', 4.9, 8900, 0, true),
('Deep Sleep Meditation', 'Guided meditation to help you fall asleep peacefully and sleep deeply', 'Sarah Johnson', 'meditation', 'Sleep', 'Beginner', 20, 'English', 'dQw4w9WgXcQ', '/audio/sleep-preview.mp3', '{}', '{"Sleep", "Relaxation", "Night"}', 4.7, 15200, 0, false),
('High Energy Morning Workout', 'Kickstart your day with this energizing full-body HIIT workout', 'Coach Alex', 'workout', 'HIIT', 'Intermediate', 20, 'English', 'dQw4w9WgXcQ', '', '{"None"}', '{"Morning", "Energy", "Full Body"}', 4.8, 25400, 180, true),
('Strength Building Circuit', 'Build lean muscle with this challenging strength training circuit', 'Maya Fitness', 'workout', 'Strength', 'Advanced', 30, 'English', 'dQw4w9WgXcQ', '', '{"Dumbbells", "Resistance Band"}', '{"Strength", "Muscle", "Equipment"}', 4.9, 18900, 250, false),
('Gentle Yoga Flow', 'Improve flexibility and find balance with this peaceful yoga sequence', 'Zen Master Lisa', 'yoga', 'Flexibility', 'Beginner', 25, 'English', 'dQw4w9WgXcQ', '', '{"Yoga Mat"}', '{"Yoga", "Flexibility", "Calm"}', 4.7, 32100, 120, true);