-- Create compensations table for HR4 Compensation Planning System
CREATE TABLE public.compensations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('bonus', 'incentive', 'allowance', 'deduction')),
  amount numeric(12,2) NOT NULL,
  description text,
  effective_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.compensations ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_compensations_employee_id ON public.compensations(employee_id);
CREATE INDEX idx_compensations_type ON public.compensations(type);
CREATE INDEX idx_compensations_effective_date ON public.compensations(effective_date);
CREATE INDEX idx_compensations_created_at ON public.compensations(created_at);

-- RLS Policies for compensations
-- Authenticated users can view all compensations (read-only by default)
CREATE POLICY "Authenticated can view compensations"
  ON public.compensations FOR SELECT TO authenticated
  USING (true);

-- Employees can only view their own compensations
CREATE POLICY "Employees can view own compensations"
  ON public.compensations FOR SELECT TO authenticated
  USING (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- HR and admin can manage all compensations
CREATE POLICY "HR and admin can manage compensations"
  ON public.compensations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_compensations_updated_at
  BEFORE UPDATE ON public.compensations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();