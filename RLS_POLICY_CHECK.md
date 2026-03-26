# RLS Policy Quick Verification

## Check Policies in Dashboard

Supabase Dashboard → Authentication → Policies

### Required Policies

**For `employees` table:**
- ✅ Allow service role (anon) to SELECT
- ✅ Allow service role (anon) to INSERT
- ✅ Allow authenticated users to SELECT their own
- ✅ No policy should block INSERT from authenticated

**For `user_roles` table:**
- ✅ Allow service role to INSERT
- ✅ Minimal restrictions during creation

**For `job_offers` table:**
- ✅ Allow SELECT by authenticated users
- ✅ Allow UPDATE status by applicant or admin

**For `applicants` table:**
- ✅ Allow SELECT by authenticated users
- ✅ Allow UPDATE status by admin/system

### Quick Test Query

Run in Supabase SQL Editor:

```sql
-- Test 1: Check if policies exist for employees
SELECT * FROM pg_policies WHERE tablename = 'employees';

-- Test 2: Try INSERT as service role (should work)
INSERT INTO employees (
  user_id, applicant_id, employee_id, full_name, email, 
  position, department, status
) VALUES (
  gen_random_uuid(), 'test-id', 'EMP-TEST', 'Test',
  'test@example.com', 'Dev', 'Eng', 'Active'
);

-- Test 3: Verify it was inserted
SELECT * FROM employees WHERE employee_id = 'EMP-TEST';

-- Test 4: Delete test record
DELETE FROM employees WHERE employee_id = 'EMP-TEST';
```

## If Hiring Still Fails After All Fixes

Check console for error messages:

**Error: "new row violates row-level security policy"**
- Cause: RLS policy blocking INSERT
- Solution: Review employees table policies, ensure INSERT allowed

**Error: "permission denied for schema public"**
- Cause: Role doesn't have schema access
- Solution: Grant USAGE on schema to role

**Action:**
1. Enable RLS debugging in logs
2. Run above test query
3. If test query fails, RLS is blocking
4. Update policies to allow service role operations

---

## Most Likely Policy Issue

If edge function returns `500` error with message about "violates row-level security":

**Fix:**
Go to Supabase Dashboard → Authentication → Policies → employees table

Ensure exists a policy like:
```sql
CREATE POLICY "Allow service role full access"
ON employees
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

Or for specific operations:
```sql
CREATE POLICY "Allow insert for authenticated"
ON employees
FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

## One-Line Fix

If you suspect RLS is blocking, disable RLS temporarily to test:

```sql
-- TEMPORARY - for testing only
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- After testing, RE-ENABLE RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

Then retry hiring. If it works with RLS disabled, RLS policy is the issue.

**Do NOT leave RLS disabled in production.**
