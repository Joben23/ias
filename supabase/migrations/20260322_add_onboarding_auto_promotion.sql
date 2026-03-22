-- Auto-promote employee to 'Employee Activated' when all onboarding tasks are completed
-- This ensures smooth transition from onboarding to active employee status

-- Function to check and update onboarding status
CREATE OR REPLACE FUNCTION public.update_onboarding_status_on_task_completion()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  pending_count INTEGER;
  all_tasks_count INTEGER;
BEGIN
  -- Get counts for the employee
  SELECT COUNT(*) INTO all_tasks_count FROM public.onboarding_tasks
  WHERE employee_id = NEW.employee_id;

  SELECT COUNT(*) INTO pending_count FROM public.onboarding_tasks
  WHERE employee_id = NEW.employee_id AND status != 'completed';

  -- If all tasks are completed and onboarding_status is not already 'Employee Activated'
  IF pending_count = 0 AND all_tasks_count > 0 THEN
    UPDATE public.employees
    SET onboarding_status = 'Employee Activated'
    WHERE id = NEW.employee_id AND onboarding_status != 'Employee Activated';
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_update_onboarding_on_task_change ON public.onboarding_tasks;

-- Create trigger to run after task status update
CREATE TRIGGER trg_update_onboarding_on_task_change
  AFTER UPDATE ON public.onboarding_tasks
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION public.update_onboarding_status_on_task_completion();

-- Function to manage onboarding stage progression (for UI updates)
CREATE OR REPLACE FUNCTION public.get_onboarding_stage_info(emp_id uuid)
  RETURNS TABLE(
    current_stage text,
    completion_percentage integer,
    completed_tasks integer,
    total_tasks integer
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
DECLARE
  total_count INTEGER;
  completed_count INTEGER;
  current_status text;
BEGIN
  SELECT onboarding_status INTO current_status FROM public.employees WHERE id = emp_id;
  
  SELECT COUNT(*) INTO total_count FROM public.onboarding_tasks WHERE employee_id = emp_id;
  SELECT COUNT(*) INTO completed_count FROM public.onboarding_tasks 
  WHERE employee_id = emp_id AND status = 'completed';

  current_stage := COALESCE(current_status, 'Offer Accepted');
  completion_percentage := CASE 
    WHEN total_count = 0 THEN 0 
    ELSE ROUND((completed_count::numeric / total_count) * 100)::integer 
  END;

  RETURN QUERY SELECT current_stage, completion_percentage, completed_count, total_count;
END;
$$;

-- Additional: Function to manually mark all onboarding tasks as complete for an employee
-- (useful for manual activation in special cases)
CREATE OR REPLACE FUNCTION public.complete_all_onboarding_tasks(emp_id uuid)
  RETURNS TABLE(success boolean, message text)
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.onboarding_tasks
  SET status = 'completed', completed_at = now()
  WHERE employee_id = emp_id AND status != 'completed';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count > 0 THEN
    RETURN QUERY SELECT true::boolean, 'All tasks marked complete. Employee activated.'::text;
  ELSE
    RETURN QUERY SELECT false::boolean, 'No pending tasks found for this employee.'::text;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.get_onboarding_stage_info(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.complete_all_onboarding_tasks(uuid) TO authenticated, service_role;
