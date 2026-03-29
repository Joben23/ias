-- Create salary_adjustments table for HR4 Compensation Planning
CREATE TABLE public.salary_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  previous_salary numeric(12,2) NOT NULL CHECK (previous_salary >= 0),
  new_salary numeric(12,2) NOT NULL CHECK (new_salary >= 0),
  reason text NOT NULL,
  adjusted_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.salary_adjustments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_salary_adjustments_employee_id ON public.salary_adjustments(employee_id);
CREATE INDEX idx_salary_adjustments_adjusted_by ON public.salary_adjustments(adjusted_by);
CREATE INDEX idx_salary_adjustments_created_at ON public.salary_adjustments(created_at);

-- RLS Policies for salary_adjustments
-- Authenticated users can view all salary adjustments (read-only by default)
CREATE POLICY "Authenticated can view salary adjustments"
  ON public.salary_adjustments FOR SELECT TO authenticated
  USING (true);

-- Employees can only view their own salary adjustments
CREATE POLICY "Employees can view own salary adjustments"
  ON public.salary_adjustments FOR SELECT TO authenticated
  USING (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- HR and admin can manage all salary adjustments
CREATE POLICY "HR and admin can manage salary adjustments"
  ON public.salary_adjustments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));