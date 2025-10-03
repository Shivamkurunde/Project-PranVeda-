# 🗄️ Supabase Database Setup Required

## ⚠️ **CRITICAL: Database Tables Missing**

Your Supabase keys are now working, but the database **has no tables yet**!

You need to run the SQL migration files to create the required tables.

---

## 📋 **Quick Setup Steps**

### **Step 1: Open Supabase SQL Editor**
```
1. Go to: https://supabase.com/dashboard/project/uctzjcgttgkwlwcvtqnt
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
```

### **Step 2: Run Migration File**

Copy and paste the contents of this file into the SQL Editor:
```
File: supabase/migrations/20250924140344_b1029f72-b024-4d02-9ba6-25867fdd2d4f.sql
```

Or use this quick SQL to create just the essential `profiles` table:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
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
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "celebration_audio": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
```

### **Step 3: Click "Run" or press F5**

You should see: `Success. No rows returned`

---

## 🧪 **Test After Setup**

After running the SQL, test the complete flow again:

```powershell
# Test complete auth flow
$signInBody = @{
    returnSecureToken='true'
    email='shivam.test@gmail.com'
    password='SecurePass123!'
} | ConvertTo-Json

$signInResponse = Invoke-WebRequest `
    -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0" `
    -Method POST `
    -Body $signInBody `
    -ContentType 'application/json' `
    -UseBasicParsing

$token = ($signInResponse.Content | ConvertFrom-Json).idToken

# Register profile in backend
$registerBody = @{
    displayName='Shivam Test'
    preferences=@{theme='light'}
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri 'http://localhost:5000/api/auth/register' `
    -Method POST `
    -Body $registerBody `
    -ContentType 'application/json' `
    -Headers @{Authorization="Bearer $token"} `
    -UseBasicParsing
```

**Expected**: `200 OK` with profile data

---

## 📁 **All Migration Files to Run (In Order)**

If you want the complete database setup, run these files in the Supabase SQL Editor:

1. **`supabase/migrations/20250924140344_b1029f72-b024-4d02-9ba6-25867fdd2d4f.sql`**
   - Creates profiles, sessions, user_sessions tables

2. **`supabase/migrations/20250125000000_add_security_tables.sql`**
   - Adds security and logging tables

3. **`supabase/migrations/20250125000001_create_wellness_tables.sql`**
   - Creates meditation_sessions, workout_sessions, streaks tables

Or just use the **`docs/supabase_setup.sql`** file which has everything!

---

## ✅ **What This Fixes**

After creating the `profiles` table:
- ✅ Backend can create user profiles
- ✅ Users can complete registration
- ✅ Dashboard will load user data
- ✅ All database operations will work

---

## 🎯 **Current Status**

| Component | Status |
|-----------|--------|
| Supabase Keys | ✅ Updated & Working |
| Backend Server | ✅ Running |
| Frontend Server | ✅ Running |
| **Database Tables** | **❌ MISSING - Need to run SQL** |

---

**Next Step**: Run the SQL script in Supabase SQL Editor, then test the auth flow!

