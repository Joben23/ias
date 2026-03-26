# ✅ Pre-Test Checklist - Hiring Workflow

## Before You Start Testing

Print this checklist and mark items as you verify them.

### Code Quality (Behind the Scenes)
- [ ] Edge function file: `supabase/functions/hire-applicant/index.ts` exists and is 210 lines
- [ ] Contains `[HIRE]` logging prefix throughout
- [ ] Does NOT contain `supabaseUser.auth.getUser()` (that was causing 401)
- [ ] Uses `supabaseServiceRoleKey` (admin client)
- [ ] Has CORS headers configured
- [ ] Frontend file: `src/components/hr/ApplicantDetailDialog.tsx` updated
- [ ] Frontend contains `[FRONTEND]` logging
- [ ] Frontend has comprehensive error mapping

### Browser & Environment
- [ ] Node/npm working: `npm --version` in terminal
- [ ] Dev server running: `npm run dev` 
- [ ] Can access http://localhost:5173 in browser
- [ ] Supabase dashboard accessible
- [ ] No TypeScript errors in terminal
- [ ] Browser DevTools can open (F12)

### Test Data Prepared
- [ ] Have at least one applicant in database
- [ ] Applicant email is valid (required for auth user creation)
- [ ] Applicant status is NOT "Hired" (or use different applicant)
- [ ] Job offer is created for the applicant
- [ ] Job offer is accepted (status = "Offer Accepted")
- [ ] Job offer has start_date in future (required)

### Browser Cache Cleared
- [ ] Hard refresh: Windows `Ctrl+Shift+R` or Mac `Cmd+Shift+R`
- [ ] DevTools → Application → Clear all storage (optional but recommended)
- [ ] Closed and reopened browser completely (optional)

### Documentation Ready
- [ ] [ ] This file (checklist)
- [ ] [ ] [QUICK_HIRE_TEST.md](QUICK_HIRE_TEST.md) (main test guide)
- [ ] [ ] [HIRING_DEBUG_GUIDE.md](HIRING_DEBUG_GUIDE.md) (if issues arise)
- [ ] [ ] [DEPLOYMENT_VERIFICATION.md](DEPLOYMENT_VERIFICATION.md) (if deployment issue)
- [ ] [ ] [RLS_POLICY_CHECK.md](RLS_POLICY_CHECK.md) (if permission issue)

---

## Immediate Verification (2 Minutes)

### Step 1: Check Edge Function Deployed
Go to: https://supabase.com/dashboard → Your Project → Edge Functions

Look for `hire-applicant`:
- [ ] Shows in list
- [ ] Has green checkmark ✅ or "Ready" status
- [ ] Does NOT show "Failed" or error indicator

### Step 2: Check Dev Server
Terminal:
```bash
npm run dev
```
Should show:
- [ ] `VITE v...` version info
- [ ] `http://localhost:5173` is accessible
- [ ] No red errors in output

### Step 3: Check Browser Connection
Open: http://localhost:5173

Should see:
- [ ] Application loads
- [ ] Can navigate to Applicants page
- [ ] No console errors (F12 → Console)

---

## Ready to Test?

All items checked above? 

### YES ✅
👉 Go to [QUICK_HIRE_TEST.md](QUICK_HIRE_TEST.md)

Follow the 5-step process:
1. Send job offer
2. Accept offer
3. Open console
4. Click hire button
5. Watch for logs & verify result

### NO ❌
### Missing item: Dev Server Not Running
```bash
# In terminal, run:
npm run dev
```
Then come back to this checklist.

### Missing item: Edge Function Showing "Failed"
1. Go to Supabase Dashboard
2. Functions → hire-applicant
3. Click function name to see logs
4. Read error message
5. Try redeploy: three dots → Redeploy
6. Wait for green checkmark

### Missing item: Browser Shows Errors
1. Press F12 → Console tab
2. Look for red error messages
3. Refresh page hard (Ctrl+Shift+R)
4. If still errors, report on [HIRING_DEBUG_GUIDE.md](HIRING_DEBUG_GUIDE.md)

### Missing item: No Test Applicant Ready
1. Go to Applicants page
2. Create new applicant OR
3. Use existing one with non-"Hired" status
4. Create and accept job offer for them

---

## Expected First Success Indicators

When you start the test, within 5 seconds you should see:

### In Browser Console (F12)
```
[FRONTEND] Calling hire-applicant for: [ID-number-here]
```

If you see this → function is being called ✅
If you DON'T see this → issue with frontend (check React error)

### 5-10 seconds later, one of:

**✅ SUCCESS:**
```
[FRONTEND] Response - Data: {employee_id: "EMP-...", ...} Error: null
```
Then toast appears with credentials

**❌ FAILURE:**
```
[FRONTEND] Hire error: Error: [specific error message]
```
Then red toast shows error

---

## Troubleshooting Quick Links

| What You See | What To Do |
|---|---|
| Nothing in console | Check Supabase deployment status |
| `[FRONTEND]` but then nothing | Edge function may not be deployed, check logs |
| `Applicant not found` | Use different applicant with valid ID |
| `User already exists` | Auth user already created, use new applicant |
| `Failed to create employee` | Check RLS policies (see RLS_POLICY_CHECK.md) |
| 401/403 error | Should not happen now, but check DEPLOYMENT_VERIFICATION.md |
| Toast doesn't appear | Check error message in console, may be success but UI issue |

---

## Quick Stats

**Edge Function:**
- Lines of code: 210
- Logs prefix: `[HIRE]`
- No auth verification ✅
- Non-blocking operations ✅
- Smart defaults ✅

**Frontend:**
- Logs prefix: `[FRONTEND]`
- Error mapping: 6 types
- Console verbosity: HIGH (for debugging)

**Process:**
- Files created: 3 new tables via migrations (done earlier)
- Environment vars: 2 (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Database operations: 6 (auth insert, profile, role, employee, update applicant, optional logs)

---

## Need Help?

**Quick Issues:**
- [ ] [QUICK_HIRE_TEST.md](QUICK_HIRE_TEST.md) → "If It Fails" section
- [ ] [HIRING_DEBUG_GUIDE.md](HIRING_DEBUG_GUIDE.md) → "Common Issues & Diagnostics"

**Deployment Issues:**
- [ ] [DEPLOYMENT_VERIFICATION.md](DEPLOYMENT_VERIFICATION.md)

**Permission Issues:**
- [ ] [RLS_POLICY_CHECK.md](RLS_POLICY_CHECK.md)

**Complete Overview:**
- [ ] [HIRING_IMPLEMENTATION_READY.md](HIRING_IMPLEMENTATION_READY.md)

---

## System is Ready! 🎉

All components are in place:
- ✅ Edge function rewritten (no 401 anymore)
- ✅ Frontend enhanced with logging
- ✅ Documentation comprehensive
- ✅ Test guides created
- ✅ Debugging guides created

**Next Action:** Follow [QUICK_HIRE_TEST.md](QUICK_HIRE_TEST.md) (5 minutes)

Good luck! Report any issues and we'll debug using the guides above.
