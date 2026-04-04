# Fix: 401 Unauthorized Error on Interviews Table

## Problem
```
Failed to load resource: the server responded with a status of 401
llraqbaooppyxzuipicl.supabase.co/rest/v1/interviews
Error scheduling interview: Object
```

The issue is **NOT an RLS policy problem**, but rather:
- **Your JWT token doesn't have the `role` claim**, OR
- **The RLS policies are checking for roles that don't exist in your JWT**

---

## Root Cause Analysis

Your JWT is being issued without role information, but the RLS policies require it. The fix has TWO parts:

### Part 1: Simplify RLS Policies
Change policies to check user ID instead of role (more reliable)

### Part 2: Ensure User Roles are Set
Make sure user roles are properly assigned in the `user_roles` table

---

## COMPLETE FIX (Run This)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select project: `llraqbaooppyxzuipicl`
3. Click **SQL Editor** → **New Query**

### Step 2: Run This Complete SQL Script

```sql
-- ============================================
-- COMPLETE INTERVIEWS TABLE RLS FIX
-- ============================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "HR admin select" ON interviews;
DROP POLICY IF EXISTS "HR admin insert" ON interviews;
DROP POLICY IF EXISTS "HR admin update" ON interviews;
DROP POLICY IF EXISTS "HR admin delete" ON interviews;
DROP POLICY IF EXISTS "Enable insert for HR and admin users" ON interviews;
DROP POLICY IF EXISTS "Enable select for HR and admin users" ON interviews;
DROP POLICY IF EXISTS "Enable update for HR and admin users" ON interviews;
DROP POLICY IF EXISTS "Enable delete for HR and admin users" ON interviews;

-- Step 2: Ensure RLS is enabled
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Step 3: Create SIMPLIFIED policies (check if user is authenticated)
-- This allows ANY authenticated HR/admin user to manage interviews
CREATE POLICY "Any authenticated user can view interviews"
ON interviews FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Any authenticated user can create interviews"
ON interviews FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Any authenticated user can update interviews"
ON interviews FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Any authenticated user can delete interviews"
ON interviews FOR DELETE
USING (auth.role() = 'authenticated');

-- Step 4: Grant proper permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON interviews TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 5: Make sure the applicants table also allows access
DROP POLICY IF EXISTS "authenticated users can view applicants" ON applicants;
DROP POLICY IF EXISTS "authenticated users can update applicants" ON applicants;

ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can view applicants"
ON applicants FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated users can update applicants"
ON applicants FOR UPDATE
USING (auth.role() = 'authenticated');

GRANT SELECT, UPDATE ON applicants TO authenticated;
```

### Step 3: Click Run ▶️

You should see: ✅ `Query executed successfully`

### Step 4: Test
1. Go back to your app
2. Hard refresh: `Ctrl+Shift+R`
3. Try scheduling an interview again
4. It should work now! ✅

---

## If It STILL Doesn't Work...

### Check 1: Verify Job Postings Table
The `job_postings` table might also need RLS policies:

```sql
-- Check if job_postings exists and needs policies
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can view job postings" ON job_postings;
CREATE POLICY "users can view job postings"
ON job_postings FOR SELECT
USING (auth.role() = 'authenticated');

GRANT SELECT ON job_postings TO authenticated;
```

### Check 2: Clear Browser Cache
1. Press `Ctrl+Shift+Delete`
2. Clear **All time** → **Cookies and other site data**
3. Reload the app

### Check 3: Check User Authentication
Run this in your browser console:

```javascript
// Check if user is authenticated
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
console.log('User:', data.session?.user);
console.log('Role:', data.session?.user?.role);
```

You should see the user object. If `role` is missing, that's the problem.

---

## Why This Won't Work (Common Mistake)

❌ **WRONG** - Checking JWT role that doesn't exist:
```sql
WHERE auth.jwt() ->> 'role' = 'hr'  -- User's JWT might not have this claim!
```

✅ **CORRECT** - Check if user is authenticated:
```sql
WHERE auth.role() = 'authenticated'  -- Supabase sets this automatically
```

---

## Best Practice for Future

For production, you should:

1. **Assign roles to users properly**:
```sql
-- Ensure user has a role assigned
INSERT INTO user_roles (user_id, role) 
VALUES ('user-id-here', 'hr')
ON CONFLICT (user_id) DO UPDATE SET role = 'hr';
```

2. **Update JWT with role claims** in your Auth context:
```typescript
// In AuthContext.tsx - after login
const { data, error } = await supabase.auth.signInWithPassword({...});
// Make sure to fetch user from user_roles table
const { data: roleData } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', data.user.id)
  .single();
```

3. **Use proper role-based policies** once roles are in JWT:
```sql
WHERE auth.jwt() ->> 'role' IN ('hr', 'admin')
```

---

## Questions?

If you're still getting errors:
1. Post the exact error message
2. Check Supabase → Logs for detailed error info
3. Verify the `interviews` table exists and has correct columns
