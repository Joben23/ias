-- Create salary_structures table for HR4 Compensation Planning
CREATE TABLE public.salary_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position text NOT NULL,
  department text NOT NULL,
  min_salary numeric(12,2) NOT NULL CHECK (min_salary >= 0),
  max_salary numeric(12,2) NOT NULL CHECK (max_salary >= min_salary),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(position, department)
);

-- Enable Row Level Security
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_salary_structures_position ON public.salary_structures(position);
CREATE INDEX idx_salary_structures_department ON public.salary_structures(department);
CREATE INDEX idx_salary_structures_created_at ON public.salary_structures(created_at);

-- RLS Policies for salary_structures
-- Authenticated users can view all salary structures (read-only by default)
CREATE POLICY "Authenticated can view salary structures"
  ON public.salary_structures FOR SELECT TO authenticated
  USING (true);

-- HR and admin can manage all salary structures
CREATE POLICY "HR and admin can manage salary structures"
  ON public.salary_structures FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));

-- Create trigger for updated_at
CREATE TRIGGER update_salary_structures_updated_at
  BEFORE UPDATE ON public.salary_structures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();