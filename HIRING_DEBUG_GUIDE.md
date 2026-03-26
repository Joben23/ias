# Hiring Workflow Debug Guide

## Quick Verification Checklist

### 1. **Browser Console Checks** (Open DevTools with F12)
When you click "Hire & Create Employee Account", check the Console tab for these logs:
- `[FRONTEND] Calling hire-applicant for: [applicant_id]` 
- `[FRONTEND] Response - Data: {...} Error: null`
- Then ONE OF:
  - ✅ `[FRONTEND] SUCCESS` + toast with credentials
  - ❌ `[FRONTEND] Hire error: [error message]`

### 2. **Supabase Function Logs**
Go to [Supabase Dashboard](https://supabase.com/dashboard) → Functions → hire-applicant → Logs:
Look for `[HIRE]` prefixed logs like:
```
[HIRE] Function started
[HIRE] Processing applicant: [id]
[HIRE] Creating auth user: [email]
[HIRE] Auth user created: [user_id]
[HIRE] SUCCESS
```

### 3. **Step-by-Step Test Process**

#### Setup: Create Test Applicant
1. Go to Applicants page
2. Create applicant OR use existing with "Interview Completed" status
3. **Note the applicant ID** (from URL or database)

#### Step 1: Verify Applicant Data
```sql
-- Run in Supabase SQL Editor
SELECT id, full_name, email, status, position_applied, department
FROM applicants
WHERE id = '[YOUR_APPLICANT_ID]'
LIMIT 1;
```
Should show: Full name, valid email, status='Interview Completed' or similar

#### Step 2: Create Job Offer (if not exists)
1. Click "Send Job Offer" button
2. Fill in form:
   - Salary: 50000
   - Start Date: 2025-03-10 (tomorrow or later)
3. Click "Send Offer"
4. Verify toast shows "Offer sent"

#### Step 3: Accept Job Offer
1. In applicant's current status line, look for "Offer Pending" action
2. Click to "Accept Offer"
3. Verify status changes to "Offer Accepted"

#### Step 4: Execute Hire Action
1. Click "Hire & Create Employee Account" button
2. **IMMEDIATELY** open Browser DevTools (F12) → Console tab
3. Watch for `[FRONTEND]` logs appearing

#### Step 5: Verify Success
If hiring worked:
- ✅ Toast appears with credentials (Employee ID, Username, Password, Start Date)
- ✅ Applicant status changes to "Hired"
- ✅ New employee appears in Employee Directory
- ✅ Console shows `[FRONTEND] SUCCESS`

---

## Common Issues & Diagnostics

### Issue: Browser console shows `[FRONTEND] Calling hire-applicant...` but then nothing

**Cause:** Edge function either:
- Not deployed
- Won't start because of env var issues
- Throwing error immediately

**Actions:**
1. **Clear browser cache:**
   - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or DevTools → Application tab → Clear storage → Clear all

2. **Restart dev server:**
   ```bash
   # Terminal: Stop and restart
   Ctrl+C
   npm run dev
   ```

3. **Check Supabase deployment:**
   - Go to Supabase Dashboard → Functions → hire-applicant
   - Look for red "Error" banner or status
   - Click "View Logs" to see deployment errors

4. **Verify function file:**
   - File: `supabase/functions/hire-applicant/index.ts`
   - Should contain `[HIRE]` prefix logging
   - Should NOT contain `supabaseUser.auth.getUser()`
   - Should use `supabaseServiceRoleKey` (not anonKey)

### Issue: Console shows `[HIRE] Processing applicant: [id]` but then stops

**Cause:** Applicant not found or applicant data invalid

**Actions:**
1. **Verify applicant exists:**
   ```sql
   SELECT id, full_name, email, status FROM applicants WHERE id = '[YOUR_ID]';
   ```

2. **Check applicant status:**
   - Should be: "Interview Completed", "Offer Accepted", or similar
   - If "Hired" already: Hire again will fail with "Already hired"

3. **Verify email field:**
   - Must be valid email format
   - Cannot be empty or NULL
   - Cannot match existing auth user

### Issue: Console shows `Applicant not found` error

**Cause:** Applicant ID is wrong OR applicant was deleted

**Actions:**
1. Get correct applicant_id from URL or database
2. Verify applicant still exists in database
3. If applicant deleted, recreate it with all required fields

### Issue: Console shows `User exists` error

**Cause:** An auth user already exists with that email

**Actions:**
1. Delete the auth user:
   - Go to Supabase Dashboard → Auth → Users
   - Search for applicant's email
   - Click and delete user (if test account)
   
2. OR use different test applicant email

### Issue: Console shows `Failed to create employee` error

**Cause:** Database permission issue OR required fields missing

**Actions:**
1. **Check employees table structure:**
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'employees'
   ORDER BY ordinal_position;
   ```

2. **Try inserting manually:**
   ```sql
   INSERT INTO employees (
     user_id, applicant_id, employee_id, full_name, email,
     position, department, status
   ) VALUES (
     'test-uuid', 'applicant-id', 'EMP-12345', 'Test Person',
     'test@example.com', 'Developer', 'Engineering', 'Active'
   );
   ```

3. **Check RLS policies:**
   - Go to Supabase Dashboard → Authentication → Policies
   - Find employees table policies
   - Ensure service role can INSERT

### Issue: `[HIRE] SUCCESS` in logs but no credentials toast

**Cause:** Frontend error handling issue OR toast not showing

**Actions:**
1. **Check Network tab:**
   - DevTools → Network tab
   - Look for request to `functions/v1/hire-applicant`
   - Check response status (should be 200)
   - Check response body has employee_id, password, etc.

2. **Check if data is null:**
   - Console: `console.log()` the response manually
   - Should have: `{success: true, employee_id: "...", password: "..."`

3. **Verify toast library:**
   - Toast component should be imported in ApplicantDetailDialog
   - Check if `useToast()` hook is available

---

## Manual Testing Commands

### Test Edge Function Directly
Open Terminal in project and run:
```bash
# Windows PowerShell
$applicantId = "your-applicant-id-here"
$url = "http://localhost:54321/functions/v1/hire-applicant"

$body = @{ applicant_id = $applicantId } | ConvertTo-Json

curl.exe -X POST $url `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $(cat .env | grep SUPABASE_ANON_KEY | cut -d'=' -f2)" `
  -d $body
```

Or use Supabase Dashboard → Functions → hire-applicant → Test Invite

### Check Employee Was Created
```sql
SELECT * FROM employees 
WHERE employee_id LIKE 'EMP-%'
ORDER BY created_at DESC 
LIMIT 1;
```

### Check Auth User Was Created
In Supabase Dashboard → Auth → Users, search for applicant's email

---

## System Status Verification

### Frontend Code
- File: `src/components/hr/ApplicantDetailDialog.tsx`
- Should have: `[FRONTEND]` console logs
- Should have: Error mapping for all error types
- Should call: `supabase.functions.invoke('hire-applicant')`

### Edge Function Code
- File: `supabase/functions/hire-applicant/index.ts`
- Should have: `[HIRE]` console logs
- Should NOT have: Auth verification code
- Should have: Service role key usage
- Should have: Non-blocking role/profile operations

### Environment Variables
Check `.env` and `.env.local`:
```
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  (in edge function)
```

---

## Flow Diagram

```
User clicks "Hire & Create Employee Account"
    ↓
[FRONTEND] Logs: "Calling hire-applicant for: [ID]"
    ↓
Browser sends POST to /functions/v1/hire-applicant
    ↓
[HIRE] Logs: "Function started"
[HIRE] Logs: "Processing applicant: [ID]"
    ↓
Check applicant exists
    ↓
Create auth user (CRITICAL - fails if any issue)
    ↓
[HIRE] Logs: "Auth user created: [UUID]"
    ↓
Assign role (NON-BLOCKING - won't fail hiring)
    ↓
Create profile (NON-BLOCKING)
    ↓
Get job offer or use defaults
    ↓
Create employee record (CRITICAL)
    ↓
[HIRE] Logs: "Employee created: [EMPLOYEE_ID]"
[HIRE] Logs: "SUCCESS"
    ↓
[FRONTEND] Logs: "Response - Data: {...}"
    ↓
Toast shows: ✅ Hired Successfully with credentials
    ↓
Database updated:
  • auth.users - new user created
  • employees - new employee record
  • applicants - status = 'Hired'
  • user_roles - employee role assigned
```

---

## Expected Outputs

**Success Case:**
```javascript
// Console Logs
[FRONTEND] Calling hire-applicant for: 550e8400-e29b-41d4-a716-446655440000
[FRONTEND] Response - Data: {
  success: true,
  employee_id: "EMP-1741123456-ABC123",
  user_id: "550e8400-e29b-41d4-a716-446655440001",
  username: "john.smith",
  password: "MedHire7x9k2m3L!",
  email: "john.smith@example.com",
  start_date: "2025-03-10"
} Error: null

// Toast Message
✅ Applicant Hired Successfully!
Employee Account Created
ID: EMP-1741123456-ABC123
Username: john.smith
Password: MedHire7x9k2m3L!
Start Date: 2025-03-10
```

**Applicant not found:**
```javascript
[FRONTEND] Calling hire-applicant for: wrong-id
[FRONTEND] Response - Data: null Error: {message: "Applicant not found"}
[FRONTEND] Hire error: Error: Applicant not found
```

**User already exists:**
```javascript
[FRONTEND] Calling hire-applicant for: 550e8400-e29b-41d4-a716-446655440000
[FRONTEND] Response - Data: null Error: {message: "User exists"}
[FRONTEND] Hire error: Error: User exists
```

---

## Need More Help?

1. **Check the HIRING_COMPLETE_FIX_GUIDE.md** for original fix details
2. **Verify edge function deployment** in Supabase Dashboard → Functions
3. **Check Supabase function logs** for `[HIRE]` prefixed messages
4. **Verify database tables exist** with correct columns
5. **Check RLS policies** aren't blocking operations
6. **Clear browser cache** and restart dev server
