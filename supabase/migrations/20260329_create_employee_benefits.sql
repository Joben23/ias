-- Create employee_benefits table for HR4 Benefits Administration
CREATE TABLE public.employee_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  benefit_id uuid NOT NULL REFERENCES public.benefits(id) ON DELETE CASCADE,
  contribution_amount numeric(12,2) NOT NULL DEFAULT 0,
  employer_share numeric(12,2) NOT NULL DEFAULT 0,
  employee_share numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, benefit_id)
);

-- Enable Row Level Security
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_employee_benefits_employee_id ON public.employee_benefits(employee_id);
CREATE INDEX idx_employee_benefits_benefit_id ON public.employee_benefits(benefit_id);
CREATE INDEX idx_employee_benefits_status ON public.employee_benefits(status);
CREATE INDEX idx_employee_benefits_created_at ON public.employee_benefits(created_at);

-- RLS Policies for employee_benefits
-- Authenticated users can view all employee benefits (read-only by default)
CREATE POLICY "Authenticated can view employee benefits"
  ON public.employee_benefits FOR SELECT TO authenticated
  USING (true);

-- Employees can only view their own benefits
CREATE POLICY "Employees can view their own benefits"
  ON public.employee_benefits FOR SELECT TO authenticated
  USING (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- HR and admin can manage all employee benefits
CREATE POLICY "HR and admin can manage employee benefits"
  ON public.employee_benefits FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));

-- Create trigger for updated_at
CREATE TRIGGER update_employee_benefits_updated_at
  BEFORE UPDATE ON public.employee_benefits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();