# 🗄️ Execute Database Setup

## ✅ **SQL Script Created: `CREATE_ALL_TABLES.sql`**

This script creates **ALL 10 TABLES** required by PranVeda Zen Flow:

1. ✅ `profiles` - User profiles
2. ✅ `sessions` - Content library (meditation/workout)
3. ✅ `user_sessions` - Progress tracking
4. ✅ `meditation_sessions` - Detailed meditation logs
5. ✅ `workout_sessions` - Detailed workout logs
6. ✅ `user_streaks` - Streak tracking
7. ✅ `achievements` - Achievement definitions
8. ✅ `user_achievements` - User unlocked achievements
9. ✅ `mood_entries` - Mood tracking
10. ✅ `ai_interactions` - AI coach conversations

---

## 🚀 **Option 1: Supabase Dashboard (RECOMMENDED)**

### **Step 1: Open SQL Editor**
```
1. Go to: https://supabase.com/dashboard/project/uctzjcgttgkwlwcvtqnt
2. Click "SQL Editor" in left sidebar
3. Click "+ New Query"
```

### **Step 2: Copy & Paste**
1. Open the file: `CREATE_ALL_TABLES.sql`
2. **Select ALL** (Ctrl+A)
3. **Copy** (Ctrl+C)
4. **Paste** into Supabase SQL Editor (Ctrl+V)

### **Step 3: Execute**
1. Click **"Run"** button (or press F5)
2. Wait 5-10 seconds
3. You should see: `✅ All tables created successfully!`

---

## 🚀 **Option 2: PowerShell Command**

Run this command to execute the SQL via Supabase REST API:

```powershell
# Read SQL file
$sql = Get-Content -Path "CREATE_ALL_TABLES.sql" -Raw

# Execute via Supabase SQL API
$headers = @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdHpqY2d0dGdrd2x3Y3Z0cW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcyMTcyMCwiZXhwIjoyMDc0Mjk3NzIwfQ.xMlvgtbNYeGH9zzbfCyyLIi-lyIACe1Bi96pn4XBOYU'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdHpqY2d0dGdrd2x3Y3Z0cW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcyMTcyMCwiZXhwIjoyMDc0Mjk3NzIwfQ.xMlvgtbNYeGH9zzbfCyyLIi-lyIACe1Bi96pn4XBOYU'
    'Content-Type' = 'application/json'
    'Prefer' = 'return=representation'
}

$body = @{
    query = $sql
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri 'https://uctzjcgttgkwlwcvtqnt.supabase.co/rest/v1/rpc/exec_sql' `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✅ Tables created successfully!"
    $response.Content
} catch {
    Write-Host "❌ Error: Using dashboard method instead"
    Write-Host $_.Exception.Message
}
```

**Note**: The REST API method might not work for complex SQL. **Use Dashboard method instead!**

---

## 🧪 **Verify Tables Were Created**

After running the SQL, verify all tables exist:

```powershell
$headers = @{
    'apikey'='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdHpqY2d0dGdrd2x3Y3Z0cW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcyMTcyMCwiZXhwIjoyMDc0Mjk3NzIwfQ.xMlvgtbNYeGH9zzbfCyyLIi-lyIACe1Bi96pn4XBOYU'
    'Authorization'='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdHpqY2d0dGdrd2x3Y3Z0cW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcyMTcyMCwiZXhwIjoyMDc0Mjk3NzIwfQ.xMlvgtbNYeGH9zzbfCyyLIi-lyIACe1Bi96pn4XBOYU'
}

$tables = @('profiles', 'sessions', 'user_sessions', 'meditation_sessions', 'workout_sessions', 'user_streaks', 'achievements', 'user_achievements', 'mood_entries', 'ai_interactions')

Write-Host "🔍 Checking tables...`n"
foreach ($table in $tables) {
    try {
        $response = Invoke-WebRequest `
            -Uri "https://uctzjcgttgkwlwcvtqnt.supabase.co/rest/v1/$table?select=*&limit=1" `
            -Headers $headers `
            -UseBasicParsing `
            -ErrorAction Stop
        Write-Host "✅ $table - EXISTS"
    } catch {
        Write-Host "❌ $table - NOT FOUND"
    }
}
```

**Expected Output**: All 10 tables should show `✅ EXISTS`

---

## 🧪 **Test Complete Auth Flow**

After tables are created, test the complete registration:

```powershell
# Step 1: Sign in to Firebase
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
Write-Host "✅ Step 1: Firebase Sign-In Success`n"

# Step 2: Register profile in backend
$registerBody = @{
    displayName='Shivam Test'
    preferences=@{theme='light'}
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest `
        -Uri 'http://localhost:5000/api/auth/register' `
        -Method POST `
        -Body $registerBody `
        -ContentType 'application/json' `
        -Headers @{Authorization="Bearer $token"} `
        -UseBasicParsing
    
    Write-Host "✅ Step 2: Backend Profile Registration Success!"
    Write-Host "Status: $($registerResponse.StatusCode)"
    Write-Host "Profile Created:`n"
    $registerResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Step 2 Failed: $($_.Exception.Message)"
}
```

**Expected**: `200 OK` with profile data

---

## 🌐 **Test Frontend Sign-In**

After tables are created:

1. Open: http://localhost:8082/auth/signin
2. Email: `shivam.test@gmail.com`
3. Password: `SecurePass123!`
4. Click "Sign In"

**Expected**: ✅ Redirect to dashboard with user profile loaded!

---

## 📊 **What This Creates**

| Table | Purpose | Records Expected |
|-------|---------|------------------|
| `profiles` | User accounts | 0 (will populate on sign-in) |
| `sessions` | Content library | 0 (add via admin) |
| `user_sessions` | Progress tracking | 0 (created when user completes session) |
| `meditation_sessions` | Meditation logs | 0 (legacy tracking) |
| `workout_sessions` | Workout logs | 0 (legacy tracking) |
| `user_streaks` | Streak tracking | 0 (auto-created per user) |
| `achievements` | Achievement defs | 5 (sample achievements) |
| `user_achievements` | Unlocked badges | 0 (earned by users) |
| `mood_entries` | Mood tracking | 0 (user-created) |
| `ai_interactions` | AI chat history | 0 (created during chats) |

---

## ✅ **After Setup Complete**

Your application will have:
- ✅ Full database schema
- ✅ Row Level Security enabled
- ✅ Service role bypass policies
- ✅ Indexes for performance
- ✅ Auto-update timestamps
- ✅ Sample achievements
- ✅ Foreign key relationships
- ✅ Check constraints

**Status**: Ready for production! 🚀

