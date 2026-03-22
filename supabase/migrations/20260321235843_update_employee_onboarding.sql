-- Update employee onboarding system
-- Add employment_type to employees table
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS employment_type text DEFAULT 'Full-Time';

-- Update start_date from job_offers when hiring
-- This will be handled in the hire-applicant function

-- Update default onboarding tasks to match requirements
-- Delete existing trigger and function
DROP TRIGGER IF EXISTS trg_create_onboarding_tasks ON public.employees;
DROP FUNCTION IF EXISTS public.create_default_onboarding_tasks();

-- Create new function with updated tasks
CREATE OR REPLACE FUNCTION public.create_default_onboarding_tasks()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.onboarding_tasks (employee_id, task_name, task_category) VALUES
    (NEW.id, 'Submit Government IDs', 'document'),
    (NEW.id, 'Upload Medical License', 'license'),
    (NEW.id, 'Sign Employment Contract', 'document'),
    (NEW.id, 'Complete HR Orientation', 'verification'),
    (NEW.id, 'Receive Employee ID Badge', 'verification'),
    (NEW.id, 'Payroll Registration', 'verification');
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER trg_create_onboarding_tasks
  AFTER INSERT ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_onboarding_tasks();

-- Update existing employees' tasks if they have old tasks
-- This is optional, as new hires will get the new tasks