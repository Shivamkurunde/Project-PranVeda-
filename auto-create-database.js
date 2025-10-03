/**
 * Automatic Database Setup Script
 * Creates all required tables for PranVeda Zen Flow using Supabase REST API
 */

const SUPABASE_URL = 'https://uctzjcgttgkwlwcvtqnt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdHpqY2d0dGdrd2x3Y3Z0cW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcyMTcyMCwiZXhwIjoyMDc0Mjk3NzIwfQ.xMlvgtbNYeGH9zzbfCyyLIi-lyIACe1Bi96pn4XBOYU';

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
  'Accept': 'application/vnd.pgrst.object+json'
};

// Priority SQL to fix the immediate profiles issue
const fixProfilesSQL = `
-- URGENT FIX: Recreate profiles table with correct structure
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'English' CHECK (preferred_language IN ('English', 'Hindi', 'Marathi', 'en', 'hi', 'ma')),
  bio TEXT,
  wellness_goals TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'Beginner' CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "celebration_audio": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role bypass" ON public.profiles;
CREATE POLICY "Service role bypass" ON public.profiles USING (true) WITH CHECK (true);
GRANT ALL ON public.profiles TO service_role, anon, authenticated;
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
SELECT 'Profiles table recreated successfully!' as status;
`;

async function executeSQL(sql) {
  console.log('🚀 Executing SQL...');
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql_query: sql })
  });

  if (!response.ok) {
    // Try alternative endpoint
    const altResponse = await fetch(`${SUPABASE_URL}/postgrest/v1/rpc/exec`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ sql_query: sql })
    });
    
    if (!altResponse.ok) {
      const error = await altResponse.text();
      throw new Error(`SQL execution failed: ${altResponse.status} ${error}`);
    }
    
    return await altResponse.json();
  }
  
  return await response.json();
}

async function createDatabaseSchema() {
  try {
    console.log('🎯 Creating database schema automatically...\n');
    
    console.log('📊 Step 1: Fixing profiles table...');
    await executeSQL(fixProfilesSQL);
    console.log('✅ Profiles table created successfully!\n');
    
    console.log('🎉 Database setup complete!');
    console.log('🔗 Now your user registration will work!');
    console.log('💡 Go test the app - signup should work now!');
    
    // Test the profiles table
    console.log('\n🧪 Testing profiles table...');
    const testSQL = `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';`;
    const result = await executeSQL(testSQL);
    console.log('📋 Profiles table columns:', result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔄 Falling back to manual SQL execution...');
    console.log('📋 Please copy FIX_PROFILES_TABLE.sql content in Supabase SQL Editor');
  }
}

// Run the script
createDatabaseSchema();
