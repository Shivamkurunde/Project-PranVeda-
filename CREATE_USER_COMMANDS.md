# 🔧 Create User via Terminal Commands

## ✅ Method 1: Using PowerShell + Firebase REST API

Run this PowerShell command (all in one line):

```powershell
$body = @{
    email = "test@example.com"
    password = "Test1234!"
    returnSecureToken = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0" -Method POST -Body $body -ContentType "application/json"
```

### Change the email/password:
```powershell
# Example with different credentials
$body = @{
    email = "myemail@example.com"
    password = "MyPassword123!"
    returnSecureToken = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0" -Method POST -Body $body -ContentType "application/json"
```

---

## ✅ Method 2: Using curl

```bash
curl -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test1234!\",\"returnSecureToken\":true}"
```

---

## ✅ Method 3: Simple PowerShell One-Liner

```powershell
Invoke-WebRequest -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0" -Method POST -Body '{"email":"test@example.com","password":"Test1234!","returnSecureToken":true}' -ContentType "application/json"
```

---

## 📋 Expected Response

### Success:
```json
{
  "kind": "identitytoolkit#SignupNewUserResponse",
  "idToken": "eyJhbGci...",
  "email": "test@example.com",
  "refreshToken": "...",
  "expiresIn": "3600",
  "localId": "abc123..."
}
```

The `localId` is your User ID!

### Error - Email Already Exists:
```json
{
  "error": {
    "code": 400,
    "message": "EMAIL_EXISTS"
  }
}
```
**Solution**: Use a different email or sign in with existing one

### Error - Weak Password:
```json
{
  "error": {
    "code": 400,
    "message": "WEAK_PASSWORD : Password should be at least 6 characters"
  }
}
```
**Solution**: Use a stronger password (at least 6 characters)

---

## 🎯 Quick Test Users

### User 1:
```powershell
$body = @{ email = "demo@pranveda.com"; password = "Demo1234!"; returnSecureToken = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0" -Method POST -Body $body -ContentType "application/json"
```

### User 2:
```powershell
$body = @{ email = "student@pranveda.com"; password = "Student123!"; returnSecureToken = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0" -Method POST -Body $body -ContentType "application/json"
```

### User 3:
```powershell
$body = @{ email = "test123@gmail.com"; password = "TestPass123!"; returnSecureToken = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0" -Method POST -Body $body -ContentType "application/json"
```

---

## 🚀 After Creating User

1. **User is created in Firebase** ✅
2. **Go to**: `http://localhost:8082/auth/signin`
3. **Sign in** with the email/password you just created
4. **Profile will be auto-created** in Supabase on first sign-in
5. **Redirected to dashboard** ✅

---

## 💡 Tips

- **Password Requirements**: Minimum 6 characters (Firebase requirement)
- **Email Format**: Must be valid email format
- **Duplicate Email**: If email exists, just sign in instead
- **Display Name**: Can be set after sign-in in profile settings

---

## 🔍 Verify User Created

Check if user exists by trying to sign in:

```powershell
$body = @{ email = "test@example.com"; password = "Test1234!"; returnSecureToken = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0" -Method POST -Body $body -ContentType "application/json"
```

If successful, you'll get back an `idToken` - user exists!

---

**Copy and paste any of the commands above into PowerShell to create a new user!** 🎊
