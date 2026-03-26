# Hiring Workflow - Quick Test (5 Minutes)

## Right Now

### 1. Open Supabase Dashboard
https://supabase.com/dashboard → Your Project → Edge Functions
- Look for `hire-applicant`
- Should show green checkmark ✅ or "Ready"

### 2. Clear Cache & Restart Dev Server
```bash
# Windows Terminal
Ctrl+C   # Stop current dev server

npm run dev   # Start fresh

# Browser: Ctrl+Shift+R  (hard refresh)
```

### 3. Open Applicants Page
1. Go to Applicants
2. Choose ANY applicant with "Interview Completed" status
3. **Note: Write down their ID or email**

---

## Test Sequence (Step by Step)

### Step A: Send Job Offer
1. Click applicant → Opens dialog
2. Click "Send Job Offer" button
3. Fill: Salary ($50,000), Start Date (2025-03-10 or later)
4. Click "Send Offer"
5. **Wait for toast**: "✅ Offer sent" 

### Step B: Accept Offer
1. In applicant's status line, find action for "Offer Pending"
2. Click to accept
3. **Verify**: Status changes to "Offer Accepted"

### Step C: Hire & Create Employee Account
1. **BEFORE clicking**, open DevTools (F12) → Console tab
2. Click "Hire & Create Employee Account" button
3. **WATCH console** for logs appearing:
   ```
   [FRONTEND] Calling hire-applicant for: [ID-HERE]
   [FRONTEND] Response - Data: {...}
   ```

### Step D: Check Result

✅ **SUCCESS IF YOU SEE:**
```
Toast message appears:
✅ Applicant Hired Successfully!
Employee Account Created
ID: EMP-...
Username: ...
Password: ...
Start Date: 2025-03-10
```

❌ **FAILURE IF YOU SEE:**
- Red toast with error message
- No logs appear  
- Error in console like "404", "401", "500"

---

## If It Fails

### Nothing Appears in Console

**Action List:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Stop dev server (Ctrl+C) → Start again (npm run dev)
3. Check Supabase Dashboard → Functions → hire-applicant → Logs
4. Look for error messages in function logs

### Red Toast with Error Message

**By Error Message:**
- "Applicant not found" → Use different applicant
- "User already exists" → Email already in auth (skip this applicant)
- "Failed to create employee" → Database issue (check RLS policies)
- "Already hired" → This applicant already hired (use different one)

### No Console Logs at All

**Most likely:** Edge function didn't deploy

**Action:**
1. Supabase Dashboard → Functions → hire-applicant
2. Check status (should be green ✅)
3. If red ❌, click and check "View Logs" for deployment error
4. If shows download icon 📥, redeploy manually:
   - Click three dots → Redeploy
   - Wait for green checkmark

---

## Full Diagnostic Logs to Check

**Browser Console (F12 → Console):**
```
// Should appear in order:
[FRONTEND] Calling hire-applicant for: 550e8400-...
[FRONTEND] Response - Data: {employee_id: "EMP-...", ...} Error: null
// OR
[FRONTEND] Hire error: Error: ...message...
```

**Supabase Function Logs:**
Supabase Dashboard → Functions → hire-applicant → Logs section:
```
[HIRE] Function started
[HIRE] Processing applicant: [ID]
[HIRE] Creating auth user: [email]
[HIRE] Auth user created: [UUID]
[HIRE] Employee created: [EMP-ID]
[HIRE] SUCCESS
```

---

## What Gets Created

When hiring succeeds, verify:

**In Employee Directory Page:**
- New employee appears in list
- Name: Same as applicant
- Status: "Active" (green badge)
- Position: Matches job position

**In Database (Supabase SQL Editor):**
```sql
SELECT * FROM employees WHERE employee_id LIKE 'EMP-%' 
ORDER BY created_at DESC LIMIT 1;
-- Should show new employee with all fields populated

SELECT * FROM applicants WHERE id = '[applicant-id]';
-- Should show status = 'Hired'
```

---

## Next: Full Test Scenarios

Once basic hire works, test these:

1. **Multiple Applicants** - Hire 3+ different applicants
2. **Salary Variations** - Different job offers with various salaries
3. **Search & Filter** - Find new employees in directory by name/position
4. **Employee Dashboard** - New employee can login with provided credentials
5. **Email Tracking** - Check email_logs table shows hire notifications (if enabled)

---

## Reference Files

- **Full Debug Guide**: HIRING_DEBUG_GUIDE.md
- **Deployment Checklist**: DEPLOYMENT_VERIFICATION.md
- **Implementation Details**: HIRING_COMPLETE_FIX_GUIDE.md

---

## Stuck? Quick Decision Tree

```
Does console show "[FRONTEND]" log?
├─ NO  → Function not responding → Check deployment status
├─ YES ├─ Shows "SUCCESS" → Edge function worked, check toast
       ├─ Shows error message → Read error, follow specific action
       ├─ Shows "non-2xx" → Function returned error code (check Supabase logs)
       └─ Shows "CORS error" → CORS headers issue (rare, check function code)

Can you find logs in Supabase function logs?
├─ NO  → Function not executing at all → Redeploy manually
└─ YES ├─ Shows "[HIRE]" prefix → Function running correctly
       ├─ Stops after "Processing applicant" → Applicant not found
       └─ Shows error after "Creating auth user" → Auth user exists
```

**Need more? Read:** HIRING_DEBUG_GUIDE.md (comprehensive, 200+ lines)
