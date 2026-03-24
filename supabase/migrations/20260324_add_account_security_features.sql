-- Add account security and management features
-- Account status for employees (active, inactive, suspended)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended'));

-- Track if user must change password on next login (after admin reset)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_account_status ON public.employees(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_must_change_password ON public.profiles(must_change_password);

-- Function to update employee account status
CREATE OR REPLACE FUNCTION public.update_employee_account_status(emp_id uuid, new_status text)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF new_status NOT IN ('active', 'inactive', 'suspended') THEN
    RETURN QUERY SELECT false::boolean, 'Invalid status. Must be: active, inactive, or suspended'::text;
    RETURN;
  END IF;

  UPDATE public.employees
  SET account_status = new_status
  WHERE id = emp_id;

  RETURN QUERY SELECT true::boolean, 'Account status updated successfully'::text;
END;
$$;

-- Function to mark user as must change password
CREATE OR REPLACE FUNCTION public.mark_user_must_change_password(user_id uuid)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET must_change_password = true
  WHERE id = user_id;

  RETURN QUERY SELECT true::boolean, 'User marked to change password on next login'::text;
END;
$$;

-- Function to clear must change password flag after user changes it
CREATE OR REPLACE FUNCTION public.clear_must_change_password(user_id uuid)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET must_change_password = false
  WHERE id = user_id;

  RETURN QUERY SELECT true::boolean, 'Must change password flag cleared'::text;
END;
$$;
