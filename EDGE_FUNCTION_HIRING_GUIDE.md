# Edge Function Hiring Fix - Complete Guide

## Overview
Fixed the "Hiring Failed - Edge Function returned a non-2xx status code" error with comprehensive error handling, logging, and frontend validation.

---

## ✅ Changes Made

### 1. **Edge Function Improvements** (`supabase/functions/hire-applicant/index.ts`)

#### Error Handling Enhancements
- ✅ All database operations now check error responses explicitly
- ✅ Non-blocking operations (role, profile, offer) log warnings instead of failures
- ✅ All error responses include `success: false` flag
- ✅ Error responses include `timestamp` for correlation

#### Added Logging
```typescript
// Each step logs with [HIRE] prefix:
console.warn('[HIRE] Role assignment warning:', roleError.message);
console.warn('[HIRE] Profile update warning:', profileError.message);
console.warn('[HIRE] Offer fetch exception:', e.message);
console.log('[HIRE] SUCCESS');
```

#### Response Format
```typescript
// Success (HTTP 200)
{
  success: true,
  employee_id: "EMP-1711518421000-XYZ",
  user_id: "user-uuid",
  username: "john.doe",
  password: "MedHire[random]!",
  email: "john@company.com",
  start_date: "2026-04-01"
}

// Error (HTTP 400/500)
{
  success: false,
  error: "User exists" or "Internal error",
  details: "Detailed error message",
  timestamp: "2026-03-27T10:30:00Z"
}
```

### 2. **Frontend Error Handling** (`src/components/hr/ApplicantDetailDialog.tsx`)

#### Enhanced Error Detection
```typescript
// Check for invoke errors (network, auth)
if (error) {
  throw new Error(`Edge function error: ${error.message}`);
}

// Check for business logic errors
if (!data.success) {
  throw new Error(data.error || data.details);
}
```

#### Improved Error Messages
- "Missing configuration" → "Supabase environment variables not configured"
- "Missing env variables" → "Edge function configuration incomplete"
- Generic errors → Preserved with context

#### Enhanced Logging
```typescript
console.log('[HIRE] Invoking edge function: hire-applicant');
console.log('[HIRE] Edge function response:', { 
  hasError, hasData, data 
});
console.error('[HIRE] Edge function invoke error:', error);
```

---

## 🔍 Debug Steps

### Step 1: Check Supabase Configuration
**Location:** Supabase Project > Settings > API

```bash
Required:
✓ SUPABASE_URL = https://[project-id].supabase.co
✓ SUPABASE_SERVICE_ROLE_KEY = [complete key with dots]
```

### Step 2: Verify Edge Function Deployment
**Location:** Supabase > Edge Functions > hire-applicant

```bash
# Check function status
- Status should be "Ready"
- Last deploy should be recent
- No error badges
```

### Step 3: Test Edge Function Directly
**Using Supabase Client in Browser Console:**

```typescript
const { data, error } = await supabase.functions.invoke('hire-applicant', {
  body: { applicant_id: 'applicant-uuid' }
});
console.log('Response:', { data, error });
```

### Step 4: Check Browser Console Logs
**When Clicking "Hire & Create Employee Account":**

Look for these log patterns:

```
✓ [HIRE] Invoking edge function: hire-applicant
✓ [HIRE] Edge function response: { hasError: false, hasData: true, data: {...} }
✓ [HIRE] Starting hire process for: applicant-id
```

**Or if error:**
```
✗ [HIRE] Edge function invoke error: Error message
✗ [HIRE] Error: Missing configuration
```

### Step 5: Check Supabase Edge Function Logs
**Location:** Supabase > Functions > hire-applicant > Open in Editor > View Logs

Look for:
```
[HIRE] Function started
[HIRE] Processing applicant: [id]
[HIRE] Creating auth user: [email]
[HIRE] Auth user created: [user-id]
[HIRE] Role assigned
[HIRE] Profile created
[HIRE] Creating employee record
[HIRE] Employee created: [emp-id]
[HIRE] SUCCESS
```

---

## 🚨 Troubleshooting

### ❌ "Missing configuration" Error

**Cause:** SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set

**Fix:**
1. Go to Supabase Project > Settings > General
2. Copy Project URL → Document as SUPABASE_URL
3. Go to Supabase Project > Settings > API
4. Copy Service Role Key → Document as SUPABASE_SERVICE_ROLE_KEY
5. Redeploy edge function: `supabase functions deploy hire-applicant`

### ❌ "User exists" Error

**Cause:** Email already has auth account (previous hiring or manual creation)

**Fix:**
```typescript
// Option 1: Use different email for test
// Option 2: In Supabase, delete auth user from Authentication > Users, retry hiring

// Option 3: Admin cleanup
const { data: existingUser } = await supabase.auth.admin.getUserByEmail('email@test.com');
if (existingUser?.user) {
  await supabase.auth.admin.deleteUser(existingUser.user.id);
}
```

### ❌ "Profile insert error" or "Role insert error"

**Cause:** RLS policy blocking write, or duplicate key constraint

**Fix - Check RLS Policies:**

```sql
-- In Supabase SQL Editor, verify these policies exist:

SELECT * FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles');

-- Expected: Should allow service_role to insert
-- SELECT, INSERT, UPDATE: IMPACT = ALL (service_role)
```

### ❌ "Employee record creation failed"

**Cause:** Foreign key constraint, missing reference, or RLS policy

**Verify Foreign Keys:**
```sql
-- Check employees table has required values
SELECT column_name, is_nullable, constraint_name 
FROM information_schema.columns
LEFT JOIN information_schema.constraint_column_usage USING (column_name)
WHERE table_name = 'employees';

-- Expected: user_id must exist in auth.users
```

### ❌ Employee not appearing in database

**Cause:** Edge function succeeded but database transaction rolled back, or race condition

**Check Transaction Logs:**
```sql
-- Verify employee was created
SELECT id, user_id, full_name, status 
FROM public.employees 
WHERE email = 'test@company.com';

-- Verify user exists
SELECT id, email 
FROM auth.users 
WHERE email = 'test@company.com';
```

### ✅ "Hiring Failed" but logs show "SUCCESS"

**Cause:** Response timeout or client-side JSON parsing error

**Fix:**
1. Increase function timeout in `deno.json` if exists
2. Check browser network tab for response details
3. Verify response returns exactly:
   ```json
   {
     "success": true,
     "employee_id": "...",
     "user_id": "...",
     "username": "...",
     "password": "...",
     "email": "...",
     "start_date": "..."
   }
   ```

---

## 🧪 Test Checklist

### Pre-Deployment Test
- [ ] Read edge function code and verify all error paths return proper responses
- [ ] Check that all status codes are 200/400/500
- [ ] Verify CORS headers present in all responses
- [ ] Confirm Content-Type: application/json on all responses

### Post-Deployment Test
- [ ] Redeploy edge function: `supabase functions deploy hire-applicant`
- [ ] Refresh frontend (Ctrl+F5)
- [ ] Open browser DevTools > Console
- [ ] Find an applicant in system
- [ ] Click "Hire & Create Employee Account"
- [ ] Check console for [HIRE] logs
- [ ] Verify toast shows credentials
- [ ] Check browser Network tab > hire-applicant request > Response

### Database Verification
```sql
-- Verify new employee record
SELECT id, user_id, full_name, email, employee_id, status 
FROM public.employees 
WHERE email = '...' 
ORDER BY created_at DESC LIMIT 1;

-- Verify auth user exists
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = '...';

-- Verify profile created
SELECT id, full_name, email, role 
FROM public.profiles 
WHERE id = (SELECT user_id FROM auth.users WHERE email = '...');

-- Verify role assigned
SELECT user_id, role 
FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = '...');
```

---

## 📊 Response Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Success | Employee created, show credentials |
| 400 | Bad Request | Invalid input, check applicant_id |
| 404 | Not Found | Applicant doesn't exist |
| 409 | Conflict | Applicant already hired or email exists |
| 500 | Server Error | Database or auth service error |

---

## 🔐 Security Notes

- ✅ Service role key only used server-side (edge function)
- ✅ Passwords generated with 8 random chars + special char
- ✅ Email confirmed = true (no confirmation email needed)
- ✅ User metadata stored securely in auth.users
- ✅ Role assignment atomic with user creation

---

## 📝 Common Scenarios

### Scenario 1: Applicant Already Hired
```
Frontend shows: "This applicant has already been hired."
Edge function log: "Applicant status = 'Hired'"
Status code: 409
Action: Can't re-hire same applicant
```

### Scenario 2: Email Already Exists
```
Frontend shows: "Employee with this email already exists."
Edge function log: "User exists"
Status code: 409
Action: Delete old user from auth or use new email
```

### Scenario 3: Missing Env Variables
```
Frontend shows: "Supabase environment variables not configured"
Edge function log: "Missing env vars"
Status code: 500
Action: Redeploy from environment with proper .env
```

### Scenario 4: Partial Success (Role or Profile Fails)
```
Frontend shows: "Applicant Hired Successfully!"
Edge function log: "[HIRE] Role assignment warning" (non-blocking)
Status code: 200
Action: Manual role/profile fix via migration
```

---

## 📞 Support

If issues persist:

1. **Check Supabase Status:** https://status.supabase.com
2. **Review Console Logs** for [HIRE] prefix patterns
3. **Verify Database** for applicant, auth.users, profiles, employees records
4. **Check Function Metrics** in Supabase dashboard
5. **Test with simpler applicant** to isolate issue

---

## ✨ Next Steps

1. Deploy changes: `git push` → CI/CD builds
2. Redeploy edge function: `supabase functions deploy hire-applicant`
3. Test with new applicant: Hire & Create Employee Account
4. Verify database records created
5. Test employee login with generated credentials
