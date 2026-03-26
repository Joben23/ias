# Employee Login System Fix Guide

## 🎯 Problem Summary

Employees could not log in after migration to new Supabase project because:
- **Frontend hire logic** created employees without creating Supabase Auth users
- **No profile linkage** between auth.users and profiles table  
- **Missing role assignments** in user_roles table
- **No fallback mechanism** for missing profiles during login

## ✅ What Was Fixed

### 1. **Frontend Hiring Logic** (`ApplicantDetailDialog.tsx`)
**BEFORE:** Created employee record directly without auth user  
**AFTER:** Calls backend `hire-applicant` edge function which:
- ✔ Creates Supabase Auth user with email + password
- ✔ Creates profile linked to user.id
- ✔ Assigns 'employee' role in user_roles table
- ✔ Creates employee record with user_id linkage
- ✔ Returns credentials for display

### 2. **Auth Context** (`AuthContext.tsx`)
**ADDED:**
- ✔ Fallback profile creation if profile doesn't exist
- ✔ Creates profile from auth user metadata
- ✔ Attempts to persist fallback to database
- ✔ Comprehensive logging for debugging
- ✔ Better error handling

### 3. **Role Checking** (`lib/utils.ts`)
**IMPROVED:**
- ✔ Changed `.single()` to `.maybeSingle()` to avoid errors on empty result
- ✔ Added role normalization (lowercase, trim)
- ✔ Added console logging for debugging
- ✔ Better error handling

### 4. **Login Flow** (`StaffLoginModal.tsx`)
**IMPROVED:**
- ✔ Added detailed logging at each step
- ✔ Better error messages
- ✔ Proper role checking before redirect
- ✔ Graceful fallback if no roles found

### 5. **Cleanup Migration** (NEW)
**Creates:**
- ✔ Profiles for employees with user_id but no profile
- ✔ Employee roles for users without them
- ✔ Fixes any broken linkage from before update

---

## 🚀 Deployment Steps

### Step 1: Deploy Code Changes
```bash
# 1. Pull/merge the code changes:
#    - ApplicantDetailDialog.tsx (uses hire-applicant function)
#    - AuthContext.tsx (adds fallback + logging)
#    - StaffLoginModal.tsx (adds logging)
#    - lib/utils.ts (fixes hasRole)

# 2. Test locally:
npm run dev

# 3. Deploy to production
npm run build
# Deploy built files to your hosting
```

### Step 2: Run Migration in Supabase
```bash
# 1. Go to Supabase dashboard
# 2. Navigate to SQL Editor
# 3. Create new query
# 4. Copy content from: supabase/migrations/20260327_fix_employee_auth_linkage.sql
# 5. Run the migration
# 6. Check results in database
```

### Step 3: Test New Hiring Process
```bash
# 1. Go to HR Dashboard
# 2. Find an applicant with "Offer Extended" status
# 3. Click "Hire" button
# 4. Verify:
#    ✔ Employee record created
#    ✔ Auth user created
#    ✔ Credentials displayed (email, temporary password)
#    ✔ Success messages shown

# 5. Test login:
#    - Use provided email + password in staff login
#    - Should redirect to /employee-portal
#    - Check browser console for [LOGIN] logs
```

---

## 🔍 Verification Checklist

### Check 1: Database Integrity
```sql
-- Verify profiles exist for all employees with user_id
SELECT COUNT(*) as total_profiles FROM public.profiles;
SELECT COUNT(*) as employees_with_user FROM public.employees WHERE user_id IS NOT NULL;
-- These should be equal or close

-- Verify roles assigned
SELECT user_id, COUNT(*) as role_count FROM public.user_roles GROUP BY user_id;
-- All should have at least 1 role

-- Check for employees without user_id
SELECT COUNT(*) as broken_employees FROM public.employees WHERE user_id IS NULL;
-- Should be 0 after new hiring
```

### Check 2: RLS Policies
Verify these policies exist in Supabase:
```
✔ Profiles:
   - Users can view own profile
   - Users can update own profile
   
✔ User Roles:
   - Users can view own roles
   - Admins can manage all roles
   
✔ Employees:
   - Users can view own employee record
   - Admin and HR can manage employees
```

### Check 3: Console Logging
When testing login, check browser console for logs:
```
[AUTH] Setting up auth listener
[AUTH] Fetching profile for user: ...
[AUTH] Profile loaded: email@example.com
[LOGIN] Checking user roles for: ...
[ROLE-CHECK] Checking role: admin
[ROLE-CHECK] Checking role: hr
[ROLE-CHECK] Checking role: employee
[ROLE-CHECK] Result: true
[LOGIN] User is employee, redirecting to employee portal
```

---

## 🐛 Troubleshooting

### Issue: "User has no valid roles"
**Cause:** Employee record created but no role assigned  
**Fix:** 
1. Go to Supabase dashboard
2. Check `user_roles` table - should have entry for user with 'employee' role
3. If missing, manually insert: `INSERT INTO user_roles (user_id, role) VALUES (user_id, 'employee')`

### Issue: "Profile not found" error
**Cause:** Profile missing or not linked to user_id  
**Fix:**
1. Check `profiles` table - should have row with id = user_id
2. If missing, manually insert from auth user metadata
3. AuthContext should auto-create fallback on next login attempt

### Issue: Login works but redirects to dashboard instead of employee portal
**Cause:** User has multiple roles (employee + hr/admin)  
**Fix:** This is intentional - HR/Admin get priority access. To restrict, remove hr/admin role:
```sql
DELETE FROM user_roles WHERE user_id = 'xxx' AND role IN ('hr', 'admin');
```

### Issue: Hire button not working or showing error
**Cause:** Backend function `hire-applicant` not accessible  
**Fix:**
1. Check Supabase Edge Functions are enabled
2. Verify `hire-applicant` function exists and is deployed
3. Check browser console for specific error message
4. Check Supabase function logs: https://app.supabase.com/project/[PROJECT_ID]/functions

---

## 🔐 Security Notes

### Temporary Passwords
- Generated passwords should be treated as temporary
- Employees should change on first login
- Consider implementing password reset requirement

### Email Verification
- Auth users are created with `email_confirm: true`
- This skips verification email to allow immediate login
- For production, consider requiring email verification

### RLS Policies
- Ensure only HR/Admin can create employees
- Employees can only view their own records
- Verify policies are enabled in Supabase

---

## 📝 How It Works Now

### Hiring Flow (New):
```
1. HR clicks "Hire" button
2. Frontend calls hire-applicant edge function
3. Backend (Deno):
   ├─ Creates Supabase Auth user (email + password)
   ├─ Creates profile (linked to user.id)
   ├─ Assigns 'employee' role
   └─ Creates employee record (with user_id)
4. Returns credentials to frontend
5. HR displays credentials to employee
```

### Login Flow (Improved):
```
1. Employee enters email & password
2. Supabase Auth validates credentials
3. AuthContext fetches profile:
   ├─ If found: use profile data
   └─ If missing: create fallback from auth metadata
4. Login flow checks roles:
   ├─ If admin/hr: redirect to /dashboard
   ├─ If employee: redirect to /employee-portal
   └─ If none: show "Access Denied"
5. Employee is logged in
```

---

## 📊 Database Schema Summary

```
auth.users (Supabase managed)
  ├─ id (UUID)
  ├─ email
  └─ user_metadata (full_name, department, role, etc.)

profiles
  ├─ id = auth.users.id
  ├─ full_name
  ├─ email
  ├─ department
  ├─ role
  └─ [other fields]

user_roles
  ├─ user_id → auth.users.id
  └─ role (admin, hr, employee)

employees
  ├─ id (UUID)
  ├─ user_id → auth.users.id (NOW LINKED!)
  ├─ applicant_id
  ├─ employee_id
  ├─ full_name
  ├─ email
  ├─ position
  └─ [other fields]
```

---

## ✨ Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Auth User** | ❌ Not created | ✅ Created automatically |
| **Profile** | ❌ Created without user_id | ✅ Linked to user.id |
| **Role** | ❌ Not assigned | ✅ 'employee' role assigned |
| **Employee Link** | ❌ No user_id | ✅ user_id set |
| **Login** | ❌ Fails (no auth user) | ✅ Works (all linked) |
| **Fallback** | ❌ None | ✅ Auto-create profile |
| **Logging** | ❌ Minimal | ✅ Comprehensive |
| **Error Handling** | ❌ Basic | ✅ Detailed messages |

---

## 🎓 Developer Notes

### Testing Locally
```bash
# Clear cookies/session
# 1. Open DevTools (F12)
# 2. Application tab → Clear storage
# 3. Refresh page

# Test hiring:
# 1. Go to HR Dashboard
# 2. Find "Offer Made" applicant
# 3. Click Hire
# 4. Check console for [HIRE] logs
# 5. Note credentials

# Test login:
# 1. Log out (if logged in)
# 2. Click Staff Login
# 3. Enter email + password from hiring step
# 4. Check console for [LOGIN] logs
# 5. Verify redirect to /employee-portal
```

### Debugging Tips
```javascript
// In browser console:
localStorage.getItem('sb-auth-token') // Check auth token
sessionStorage // Check session data

// Look for these patterns in console:
[AUTH]   - Auth context logs
[LOGIN]  - Login flow logs
[HIRE]   - Hiring process logs
[ROLE-CHECK] - Role verification logs
```

---

## 📞 Support

If issues persist after deployment:

1. **Check console logs** - Most detailed debugging info
2. **Check Supabase logs** - Edge functions, auth
3. **Verify database** - Use SQL editor to check tables
4. **Test manually** - Try creating user via Supabase dashboard
5. **Contact support** - Include console logs and error messages

---

**Last Updated:** 2026-03-27  
**Version:** 1.0 (Initial Fix)
