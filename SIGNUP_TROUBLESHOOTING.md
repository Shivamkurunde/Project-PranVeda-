# 🔧 Sign-Up Troubleshooting Guide

## ✅ Fixed Issues

1. **signOut Naming Conflict** - Fixed the function naming conflict in `useFirebaseAuth.tsx`
2. **Import Paths** - All import paths corrected for feature-based architecture

---

## 🐛 How to Debug Sign-Up Issues

### **Step 1: Open Browser Console**

1. Open your browser (Chrome/Edge recommended)
2. Go to `http://localhost:8082`
3. Press `F12` to open Developer Tools
4. Click on the **Console** tab
5. Look for any error messages

### **Step 2: Try to Sign Up**

1. Go to Sign Up page (`http://localhost:8082/auth/signup`)
2. Fill in the form:
   - **Full Name**: Test User
   - **Email**: test@example.com
   - **Password**: Test1234! (at least 8 characters)
   - **Confirm Password**: Test1234!
   - ✅ Check "I agree to Terms and Conditions"
3. Click "Create Account"
4. **Watch the Console** for errors

### **Step 3: Check for Common Errors**

#### **Error 1: Firebase Configuration**
```
Missing Firebase environment variables
```
**Solution**: Make sure `frontend/frontend.env` has all Firebase variables

#### **Error 2: CORS Error**
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:8082' has been blocked by CORS
```
**Solution**: Backend is running and CORS is configured correctly ✅

#### **Error 3: Firebase Auth Error**
```
auth/email-already-in-use
```
**Solution**: Try a different email address

```
auth/weak-password
```
**Solution**: Use a stronger password (8+ characters, uppercase, lowercase, number, special char)

```
auth/invalid-email
```
**Solution**: Use a valid email format

#### **Error 4: Network Error**
```
Failed to fetch
```
**Solution**: Make sure backend is running on port 5000

---

## 🧪 Quick Test Commands

### **Test 1: Check if Backend is Running**
```powershell
curl http://localhost:5000/api/health
```
**Expected**: Should return health status JSON

### **Test 2: Check if Frontend is Running**
```powershell
curl http://localhost:8082
```
**Expected**: Should return HTML (200 OK)

### **Test 3: Check Firebase Connection**
Open browser console and type:
```javascript
console.log('Firebase configured:', !!window.firebase);
```

---

## 📋 What Should Happen During Sign-Up

### **Successful Sign-Up Flow:**

1. **User fills form** → Frontend validates input
2. **Click "Create Account"** → Frontend calls Firebase
3. **Firebase creates user** → Returns user credential
4. **Frontend updates profile** → Sets display name
5. **Get auth token** → Firebase generates ID token
6. **Backend sync** → Profile created in Supabase (automatic)
7. **Redirect to dashboard** → Success toast message

### **Expected Console Output:**
```
✅ Firebase configuration loaded: {...}
✅ Firebase initialized successfully
✅ Environment configuration validated successfully
(After signup) Account created successfully!
```

---

## 🔍 Specific Errors to Report

If sign-up fails, please share:

1. **Console Error Messages** (copy entire error)
2. **Network Tab** (F12 → Network → look for failed requests)
3. **What step failed** (form validation, Firebase, redirect, etc.)
4. **Form Data Used** (email format, password length)

---

## ✅ Environment Variables Check

Make sure `frontend/frontend.env` has these variables:

```env
VITE_FIREBASE_API_KEY=AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0
VITE_FIREBASE_AUTH_DOMAIN=pranveda-new-original.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pranveda-new-original
VITE_FIREBASE_STORAGE_BUCKET=pranveda-new-original.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=907165773979
VITE_FIREBASE_APP_ID=1:907165773979:web:26bd23ea3002e4ebfa963e
VITE_GOOGLE_CLIENT_ID=907165773979-o62v3u7r2h4trl1ebqmidhphhthuqd0c.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:8082
```

---

## 🚀 Quick Fix Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 8082
- [ ] Environment variables loaded (check console)
- [ ] Firebase credentials correct
- [ ] Password meets requirements (8+ chars)
- [ ] Email is valid format
- [ ] Terms checkbox is checked
- [ ] No browser console errors

---

## 💡 Try Google Sign-Up Instead

If email/password sign-up isn't working:

1. Click **"Sign up with Google"** button
2. Choose your Google account
3. Allow permissions
4. Should automatically create account and redirect

---

## 📞 Next Steps

**If you still can't sign up:**

1. Take a screenshot of browser console errors
2. Check the **Network** tab in DevTools for failed requests
3. Share the specific error message you're seeing

I'll help you debug based on the specific error!
