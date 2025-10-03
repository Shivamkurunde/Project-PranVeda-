# 🚀 Quick Start - Firebase Auth Testing

## ✅ Installation Complete

All dependencies have been installed and Playwright is configured!

---

## 🧪 Testing Commands

### **1. Start the Development Server**

Open a terminal and run:

```bash
cd frontend
npm run dev
```

**Keep this terminal running!** The server should start on http://localhost:8082

### **2. Check Browser Console**

Open http://localhost:8082 in your browser and press **F12** to open DevTools.

**Look for these console messages:**

✅ **SUCCESS - You should see:**
```
🚀 Initializing PranVeda Zen Flow...
✅ Firebase configuration loaded: { apiKey: "***L_0", ... }
🔥 Initializing Firebase...
✅ Firebase initialized successfully
✅ Environment configuration validated successfully
```

❌ **ERROR - You should NOT see:**
```
auth/api-key-not-valid
API key not valid
Missing Firebase environment variables
```

### **3. Run Firebase Tests**

Open a **NEW terminal** (keep dev server running) and run:

```bash
cd frontend
npm run test:firebase
```

**Expected:** All 15 tests should pass ✅

### **4. Run All Tests**

```bash
npm run test
```

**Expected:** All authentication tests pass

### **5. View Test Report**

```bash
npm run test:report
```

Opens a beautiful HTML report in your browser.

---

## 🎯 What Each Test Checks

### Firebase Configuration Tests (7 tests)
1. ✅ App loads without API key errors
2. ✅ Firebase initializes with valid config
3. ✅ Environment variables are loaded
4. ✅ No placeholder values detected
5. ✅ Configuration is properly logged
6. ✅ All required env vars present
7. ✅ Auth services available

### Authentication Flow Tests (6 tests)
1. ✅ Sign up page loads without errors
2. ✅ Sign in page loads without errors
3. ✅ Google OAuth button is present
4. ✅ Form submission works
5. ✅ Network errors handled gracefully
6. ✅ Protected routes work

### Security Tests (2 tests)
1. ✅ Sensitive data not exposed
2. ✅ API key properly handled

---

## 🔍 Quick Verification

Run this checklist in order:

1. **Terminal 1:** `cd frontend && npm run dev`
   - [ ] Server starts on port 8082
   - [ ] No errors in terminal

2. **Browser:** Open http://localhost:8082
   - [ ] Page loads successfully
   - [ ] Console shows "✅ Firebase initialized successfully"
   - [ ] No red errors in console

3. **Terminal 2:** `cd frontend && npm run test:firebase`
   - [ ] All 15 tests pass
   - [ ] No test failures
   - [ ] Completes in < 2 minutes

4. **Test Manual Navigation:**
   - [ ] Go to http://localhost:8082/auth/signup
   - [ ] Form appears with email/password fields
   - [ ] "Sign up with Google" button visible
   - [ ] No console errors

---

## 🐛 If Tests Fail

### Common Issues and Quick Fixes

**Issue: Port 8082 already in use**
```bash
# Kill existing process
Get-Process -Id (Get-NetTCPConnection -LocalPort 8082).OwningProcess | Stop-Process -Force
```

**Issue: Tests timeout**
```bash
# Run with more time
npm run test:firebase -- --timeout=60000
```

**Issue: Still seeing API key errors**
```bash
# Clear cache and restart
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

**Issue: Environment variables not loading**
- Check that `frontend.env` file exists (not `.env`)
- Restart dev server completely
- Check for typos in variable names

---

## 📊 Test Modes

```bash
# Normal mode (headless)
npm run test:firebase

# See browser while testing
npm run test:headed

# Interactive debugging
npm run test:debug

# UI mode (best for development)
npm run test:ui

# Show detailed report after tests
npm run test:report
```

---

## 🎉 Success Criteria

Your setup is working correctly if:

1. ✅ Dev server starts without errors
2. ✅ Browser console shows "Firebase initialized successfully"
3. ✅ All 15 Firebase tests pass
4. ✅ Auth pages load (signup/signin)
5. ✅ No 400/401 errors in Network tab
6. ✅ No "api-key-not-valid" errors anywhere

---

## 📝 What Was Fixed

1. **Vite Config:** Added explicit `envPrefix` and `envDir`
2. **Firebase Client:** Added validation and detailed logging
3. **Tests:** Created 15 comprehensive Firebase auth tests
4. **Playwright:** Enhanced config with dotenv support
5. **Package.json:** Added test scripts and dependencies

---

## 🆘 Still Having Issues?

1. Check the detailed guide: `FIREBASE_AUTH_FIX_COMPLETE.md`
2. Look at console logs (they're now very detailed)
3. Run in debug mode: `npm run test:debug`
4. Check Firebase Console for API restrictions
5. Verify all env vars in `frontend.env`

---

**Ready? Let's test! 🚀**

```bash
# Terminal 1
cd frontend
npm run dev

# Terminal 2 (new terminal)
cd frontend
npm run test:firebase
```

**Expected result:** 15 passed tests ✅

