-- Create employee_compensation table for HR4 Compensation Planning
CREATE TABLE public.employee_compensation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  base_salary numeric(12,2) NOT NULL CHECK (base_salary >= 0),
  bonus numeric(12,2) NOT NULL DEFAULT 0 CHECK (bonus >= 0),
  incentives numeric(12,2) NOT NULL DEFAULT 0 CHECK (incentives >= 0),
  last_adjustment_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- Enable Row Level Security
ALTER TABLE public.employee_compensation ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_employee_compensation_employee_id ON public.employee_compensation(employee_id);
CREATE INDEX idx_employee_compensation_created_at ON public.employee_compensation(created_at);

-- RLS Policies for employee_compensation
-- Authenticated users can view all employee compensation (read-only by default)
CREATE POLICY "Authenticated can view employee compensation"
  ON public.employee_compensation FOR SELECT TO authenticated
  USING (true);

-- Employees can only view their own compensation
CREATE POLICY "Employees can view own compensation"
  ON public.employee_compensation FOR SELECT TO authenticated
  USING (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- HR and admin can manage all employee compensation
CREATE POLICY "HR and admin can manage employee compensation"
  ON public.employee_compensation FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));

-- Create trigger for updated_at
CREATE TRIGGER update_employee_compensation_updated_at
  BEFORE UPDATE ON public.employee_compensation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();