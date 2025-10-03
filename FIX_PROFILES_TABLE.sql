-- URGENT FIX: Recreate profiles table with correct structure
-- This fixes all constraint and column issues

-- Step 1: Drop existing profiles table (this will cascade delete related data)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 2: Recreate profiles table with correct structure
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,  -- TEXT for Firebase UIDs
  display_name TEXT,
  email TEXT NOT NULL UNIQUE,     -- Required field
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'English' CHECK (preferred_language IN ('English', 'Hindi', 'Marathi', 'en', 'hi', 'ma')),
  bio TEXT,
  wellness_goals TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'Beginner' CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "celebration_audio": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 3: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create service role bypass policy (for backend operations)
DROP POLICY IF EXISTS "Service role bypass" ON public.profiles;
CREATE POLICY "Service role bypass" ON public.profiles USING (true) WITH CHECK (true);

-- Step 5: Grant permissions
GRANT ALL ON public.profiles TO service_role, anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role, anon, authenticated;

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF EXISTS idx_profiles_email ON public.profiles(email);

-- Step 7: Verify table creation
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Success message
SELECT 'Profiles table recreated successfully!' as status;
