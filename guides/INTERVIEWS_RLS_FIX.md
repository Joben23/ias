# Fix: Interviews Table RLS Policy Violation Error

## Problem
Error: `new row violates row-level security policy for table 'interviews'`

This occurs when HR users try to schedule interviews but don't have RLS permissions to insert into the `interviews` table.

---

## Root Cause

Your `interviews` table has one of these issues:
1. **RLS is enabled but no policies exist** for HR/admin users to INSERT
2. **RLS policies are too restrictive** and don't match your user roles
3. **Missing policy for SELECT** on the interviews table

---

## Solution

### Option 1: Disable RLS (Quick Fix - For Testing)
If you're in development/testing phase:

1. Go to Supabase Console → Authentication → Policies
2. Find the `interviews` table
3. Disable RLS (toggle the "RLS enabled" switch OFF)
4. Test if scheduling interviews works now

⚠️ **NOT RECOMMENDED FOR PRODUCTION** - RLS provides security

---

### Option 2: Add Proper RLS Policies (Recommended)

Run this SQL in your Supabase SQL Editor:

```sql
-- First, DISABLE existing policies (if any exist and are blocking)
DROP POLICY IF EXISTS "Enable insert for HR and admin users" ON interviews;
DROP POLICY IF EXISTS "Enable select for HR and admin users" ON interviews;
DROP POLICY IF EXISTS "Enable update for HR and admin users" ON interviews;
DROP POLICY IF EXISTS "Enable delete for HR and admin users" ON interviews;

-- ENABLE RLS on interviews table
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow SELECT (read) for HR and admin users
CREATE POLICY "HR and admin can view interviews"
ON interviews FOR SELECT
USING (
  auth.jwt() ->> 'role' IN ('hr', 'admin')
);

-- Policy 2: Allow INSERT (create) for HR and admin users
CREATE POLICY "HR and admin can create interviews"
ON interviews FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'role' IN ('hr', 'admin')
);

-- Policy 3: Allow UPDATE (modify) for HR and admin users
CREATE POLICY "HR and admin can update interviews"
ON interviews FOR UPDATE
USING (
  auth.jwt() ->> 'role' IN ('hr', 'admin')
)
WITH CHECK (
  auth.jwt() ->> 'role' IN ('hr', 'admin')
);

-- Policy 4: Allow DELETE for HR and admin users
CREATE POLICY "HR and admin can delete interviews"
ON interviews FOR DELETE
USING (
  auth.jwt() ->> 'role' IN ('hr', 'admin')
);
```

---

## Steps to Apply Fix

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project: **llraqbaooppyxzuipicl**
3. Click on **SQL Editor** (bottom left)
4. Click **New Query**

### Step 2: Copy & Paste the SQL
Copy the SQL from **Option 2** above and paste it into the query editor.

### Step 3: Run the Query
Click the **Play/Run** button to execute.

You should see: ✅ `[Success] Query executed successfully`

### Step 4: Test the Feature
1. Go back to your app
2. Open **Applicant Management → Applicant Details → Schedule Interview**
3. Try scheduling an interview again
4. It should work now! ✅

---

## If It Still Doesn't Work

### Check 1: Verify Your User Has HR Role
```sql
-- Run this in SQL Editor to check user roles
SELECT id, email, raw_user_meta_data FROM auth.users;
SELECT * FROM user_roles WHERE user_id = 'your-user-id';
```

Make sure your user has role = 'hr' or 'admin'

### Check 2: Enable RLS Debug Mode
Add this to Console in DevTools to see what's being sent:
```javascript
localStorage.setItem('sb-logs', 'true');
```

### Check 3: Check Other Related Tables
The interviews table might reference other tables. Make sure these also have proper policies:
- `applicants` table
- `job_postings` table (if applicable)

---

## RLS Policies Breakdown

| Policy | Purpose | Actions Allowed |
|--------|---------|-----------------|
| View interviews | HR/admins can read | SELECT |
| Create interviews | HR/admins can insert | INSERT |
| Modify interviews | HR/admins can update | UPDATE |
| Remove interviews | HR/admins can delete | DELETE |

All policies require user role to be `hr` or `admin` via JWT

---

## Security Note

These policies ensure:
✅ Only HR and admin users can manage interviews
✅ Regular employees can't insert/modify interview records
✅ Data is protected at database level (not just app level)

---

## Still Getting Errors?

If you're still getting errors after applying this fix:

1. **Clear browser cache**: `Ctrl+Shift+Delete` (DevTools → Application → Clear Storage)
2. **Reload the app**: `Ctrl+R` (hard refresh)
3. **Check Supabase logs**: 
   - Go to Supabase → Auth → Logs
   - Look for your user's failed requests
4. **Verify JWT token has role**:
   ```javascript
   // In browser console:
   console.log(localStorage.getItem('sb-auth-token'));
   ```

---

## Questions?

If you need further help:
- Check Supabase docs: https://supabase.com/docs/guides/auth/row-level-security
- Review your roles setup in `user_roles` table
- Ensure your login process stores the 'hr' or 'admin' role in JWT
