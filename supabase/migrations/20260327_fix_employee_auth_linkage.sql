-- Migration: Fix broken employee auth linkage
-- Purpose: Create missing profiles and roles for existing employees
-- Date: 2026-03-27

-- Step 1: Create profiles for employees with user_id but no profile
INSERT INTO public.profiles (id, full_name, email, phone, department, role, created_at, updated_at)
SELECT 
  e.user_id,
  e.full_name,
  e.email,
  e.phone,
  e.department,
  'employee',
  NOW(),
  NOW()
FROM public.employees e
WHERE e.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = e.user_id
  )
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create employee roles for users without employee role
INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
SELECT DISTINCT
  e.user_id,
  'employee'::app_role,
  (SELECT id FROM auth.users LIMIT 1), -- Use first admin user as assigner
  NOW()
FROM public.employees e
WHERE e.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = e.user_id AND ur.role = 'employee'
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Log the results
DO $$
DECLARE
  profiles_created INT;
  roles_created INT;
BEGIN
  SELECT COUNT(*) INTO profiles_created 
  FROM public.profiles p
  WHERE p.id IN (
    SELECT user_id FROM public.employees WHERE user_id IS NOT NULL
  )
  AND p.role = 'employee';
  
  SELECT COUNT(*) INTO roles_created
  FROM public.user_roles ur
  WHERE ur.role = 'employee';
  
  RAISE NOTICE 'Auth Linkage Fix Complete: % profiles, % roles assigned', profiles_created, roles_created;
END $$;
