# 🚀 Quick Playwright Test Commands

## ⚡ FASTEST - Desktop Only (2-3 minutes)
```powershell
cd frontend
$env:CI="true"; npx playwright test firebase-auth.spec.ts --reporter=list
```

## 🌐 FULL - All Browsers Including Mobile (5-8 minutes)
```powershell
cd frontend
npx playwright test firebase-auth.spec.ts --reporter=list
```

## 🎯 SINGLE BROWSER - Quick Test
```powershell
# Chromium only
cd frontend
npx playwright test firebase-auth.spec.ts --grep "chromium" --reporter=list

# Firefox only
cd frontend
npx playwright test firebase-auth.spec.ts --grep "firefox" --reporter=list
```

## 🐛 DEBUG MODE - See What's Happening
```powershell
cd frontend
npx playwright test firebase-auth.spec.ts --headed --debug
```

## 📊 WITH HTML REPORT
```powershell
cd frontend
npx playwright test firebase-auth.spec.ts --reporter=html
npx playwright show-report
```

## ⚠️ IMPORTANT NOTES

1. **Dev servers must be running:**
   - Frontend: http://localhost:8082
   - Backend: http://localhost:5000
   - Playwright will auto-start them if not running

2. **PowerShell syntax:**
   - Use `;` instead of `&&`
   - Set env vars with `$env:VAR="value"`

3. **First run may be slower:**
   - Playwright needs to start servers
   - Subsequent runs reuse existing servers

---

## 📋 EXECUTION CHECKLIST

```
✅ COMPLETED OPTIMIZATIONS:
[✓] Issue #1: Form submission timeouts increased to 90s
[✓] Issue #2: Network timeout mocked (no real 30s wait)
[✓] Issue #3: Navigation uses domcontentloaded (faster)
[✓] Issue #4: Mobile config with conditional CI/local
[✓] Issue #5: Retry logic (CI=2, local=1)

🧪 READY TO TEST:
[ ] Run desktop-only tests (fastest)
[ ] Run full test suite (all browsers)
[ ] Generate HTML report
[ ] Verify all tests pass
[ ] Check test duration < 8 minutes

📊 SUCCESS CRITERIA:
[ ] No tests timeout
[ ] Form submission < 40s
[ ] Network timeout < 15s
[ ] Navigation < 12s
[ ] Total duration < 8 minutes (local) or < 3 minutes (CI)
```

---

**Run this command now:**
```powershell
cd frontend; npx playwright test firebase-auth.spec.ts --reporter=list
```

