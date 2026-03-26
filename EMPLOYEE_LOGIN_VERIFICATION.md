# ✅ Employee Login System - Verification Checklist

## Pre-Deployment Checklist

- [ ] **Code Changes Deployed**
  - [ ] `ApplicantDetailDialog.tsx` - Updated to use hire-applicant function
  - [ ] `AuthContext.tsx` - Added fallback profile creation + logging
  - [ ] `StaffLoginModal.tsx` - Added login debugging logs
  - [ ] `lib/utils.ts` - Fixed hasRole with maybeSingle() + logging

- [ ] **Migration Applied**
  - [ ] Ran `20260327_fix_employee_auth_linkage.sql` in Supabase
  - [ ] Migration completed without errors
  - [ ] Check Supabase logs for confirmation

- [ ] **Environment Variables**
  - [ ] Supabase URL is correct
  - [ ] Supabase Anon Key is correct
  - [ ] Edge Functions are enabled

---

## Post-Deployment Verification

### 1. Database Check (Supabase SQL Editor)

```sql
-- Query 1: Check profiles exist
SELECT COUNT(*) as total_profiles, 
       COUNT(CASE WHEN role = 'employee' THEN 1 END) as employee_profiles
FROM public.profiles;

-- Expected: Should show reasonable count of profiles

-- Query 2: Check employee linkage
SELECT COUNT(*) as total_employees,
       COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as linked_employees,
       COUNT(CASE WHEN user_id IS NULL THEN 1 END) as broken_employees
FROM public.employees;

-- Expected: linked_employees should be high, broken_employees = 0 after new hires

-- Query 3: Check roles
SELECT role, COUNT(*) FROM public.user_roles GROUP BY role;

-- Expected: Should see 'employee', 'hr', 'admin' roles

-- Query 4: Find test user (if hired during testing)
SELECT u.id, u.email, p.full_name, p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%test%'
LIMIT 5;
```

### 2. New Hiring Test

**Setup:**
- [ ] Go to HR Dashboard
- [ ] Find an applicant with "Offer Extended" status (create one if needed)

**Test:**
- [ ] Click "Hire" button
- [ ] Watch for success message showing:
  - [ ] Employee ID (EMP-XXXX-XXXX)
  - [ ] Username (firstname.lastname)
  - [ ] Temporary Password
  - [ ] Start Date

**Browser Console Check:**
```
Look for logs like:
[HIRE] Backend response: {success: true, employee_id: "EMP-...", ...}
[HIRE] SUCCESS
```

- [ ] Open browser DevTools → Application → Cookies
- [ ] Clear all cookies for your domain
- [ ] Refresh page to clear local storage

### 3. Login Test

**Test with new employee:**
- [ ] Click Staff Login
- [ ] Enter email from hiring test
- [ ] Enter temporary password from hiring test
- [ ] Click "Send Verification Code"
- [ ] Enter code from email
- [ ] Enter password again
- [ ] Click "Sign In"

**Browser Console Should Show:**
```
[AUTH] Setting up auth listener
[AUTH] Auth state changed: SIGNED_IN
[AUTH] User logged in: email@example.com
[AUTH] Fetching profile after auth state change
[AUTH] Profile loaded: Full Name
[LOGIN] Checking user roles for: xxxx...
[ROLE-CHECK] Checking role: admin  [RESULT: false]
[ROLE-CHECK] Checking role: hr     [RESULT: false]  
[ROLE-CHECK] Checking role: employee [RESULT: true]
[LOGIN] User is employee, redirecting to employee portal
```

- [ ] Page redirects to /employee-portal
- [ ] Employee can see their information

### 4. HR Login Test

**Setup:**
- [ ] Add test HR user in Supabase (`user_roles` table with role='hr')

**Test:**
- [ ] Log out current user
- [ ] Use Staff Login with HR user
- [ ] Browser console should show:
  ```
  [LOGIN] User is admin/hr, redirecting to dashboard
  ```
- [ ] Page redirects to /dashboard (not employee portal)

### 5. Role Assignment Verification

**In Supabase dashboard:**
- [ ] Go to `user_roles` table
- [ ] Find the test employee user_id
- [ ] Verify there's a row with `role = 'employee'`
- [ ] Verify `assigned_at` is recent (from migration or hire)

**Expected:**
```
user_id: [UUID of test employee]
role: 'employee'
assigned_at: [recent timestamp]
```

### 6. Profile Linkage Verification

**In Supabase dashboard:**
- [ ] Go to `profiles` table
- [ ] Find the test employee profile by id (user_id from employees table)
- [ ] Verify fields are populated:
  - [ ] `full_name` - Employee name
  - [ ] `email` - Employee email
  - [ ] `department` - Employee department
  - [ ] `role` - Should be 'employee'

**In employees table:**
- [ ] Find test employee record
- [ ] Verify `user_id` field is populated with UUID from auth.users
- [ ] Verify it matches the profile id

---

## Troubleshooting Issues

### ❌ "Login failed: Invalid email or password"
**Check:**
- [ ] Verify credentials shown during hire match what you're entering
- [ ] Check password is exactly as shown (case-sensitive)
- [ ] Try hiring another applicant to get fresh credentials
- [ ] Check Supabase Auth logs for login failures

### ❌ "Access Denied: You do not have permission"
**Check:**
- [ ] Go to `user_roles` table
- [ ] Find the test user by user_id
- [ ] Verify there's a row with role = 'employee'
- [ ] If missing, manually insert:
  ```sql
  INSERT INTO public.user_roles (user_id, role)
  VALUES ('UUID', 'employee');
  ```

### ❌ "Profile not found" or shows blank profile
**Check:**
- [ ] Go to `profiles` table
- [ ] Verify row exists with id = user's UUID
- [ ] If missing, it should be auto-created on next login
- [ ] Check browser console for [AUTH] logs
- [ ] Try logging out and back in

### ❌ Hire button shows error
**Check:**
- [ ] Browser console for specific error message
- [ ] Supabase Edge Functions are enabled
- [ ] `hire-applicant` function exists and shows "Default" deployment
- [ ] Check function logs in Supabase dashboard
- [ ] Verify applicant status is not already "Hired"

### ⚠️ Employee redirects to dashboard instead of portal
**Cause:** User has multiple roles (hr + employee)  
**Fix:** This is intentional - admins/hr always get dashboard access
- [ ] If employee should only see portal, remove hr/admin role

---

## Performance Check

**Test several hires and logins:**
- [ ] Hiring completes in < 5 seconds
- [ ] Login completes in < 3 seconds
- [ ] No console errors
- [ ] No database timeouts

**If slow:**
- [ ] Check Supabase CPU/connections
- [ ] Check browser network tab (DevTools)
- [ ] Check for slow queries in Supabase logs

---

## Security Check

- [ ] All auth operations use HTTPS
- [ ] Passwords are not logged anywhere
- [ ] Temporary passwords are rotated on first login
- [ ] User sessions timeout appropriately
- [ ] RLS policies are enabled on all tables

**Verify RLS:**
In Supabase dashboard:
- [ ] `profiles` table → Row Level Security: ON
- [ ] `user_roles` table → Row Level Security: ON
- [ ] `employees` table → Row Level Security: ON

---

## Final Sign-Off

- [ ] All checklist items completed
- [ ] No errors in console
- [ ] Employee can successfully:
  - [ ] Create account (via hire)
  - [ ] Log in
  - [ ] Access employee portal
  - [ ] See their information
- [ ] HR can still access dashboard
- [ ] Ready for production

---

## Notes / Issues Found

Use this space to document any issues:

```
[Date] [Issue] [Resolution]
```

---

**Last Verified:** _____________  
**Verified By:** _____________  
**Status:** ☐ PASS ☐ FAIL
