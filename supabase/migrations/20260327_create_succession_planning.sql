-- Create key_positions table for critical hospital roles
CREATE TABLE public.key_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position_name text NOT NULL,
  department text NOT NULL,
  is_critical boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.key_positions ENABLE ROW LEVEL SECURITY;

-- Policies for key_positions
CREATE POLICY "Authenticated can view key positions"
  ON public.key_positions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "HR and Admin can create key positions"
  ON public.key_positions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR and Admin can update key positions"
  ON public.key_positions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR and Admin can delete key positions"
  ON public.key_positions FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

-- Create succession_candidates table
CREATE TABLE public.succession_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  key_position_id uuid NOT NULL REFERENCES public.key_positions(id) ON DELETE CASCADE,
  readiness_level text NOT NULL DEFAULT 'In Development', -- Ready Now, Ready Soon, In Development
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, key_position_id)
);

ALTER TABLE public.succession_candidates ENABLE ROW LEVEL SECURITY;

-- Policies for succession_candidates
CREATE POLICY "Authenticated can view succession candidates"
  ON public.succession_candidates FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Employees can view their own succession info"
  ON public.succession_candidates FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR and Admin can manage succession candidates"
  ON public.succession_candidates FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR and Admin can update succession candidates"
  ON public.succession_candidates FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR and Admin can delete succession candidates"
  ON public.succession_candidates FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

-- Create development_plans table
CREATE TABLE public.development_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'Active', -- Active, Completed, On Hold
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;

-- Policies for development_plans
CREATE POLICY "Authenticated can view development plans"
  ON public.development_plans FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Employees can view their own development plans"
  ON public.development_plans FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR and Admin can manage development plans"
  ON public.development_plans FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

-- Create indexes for better performance
CREATE INDEX idx_key_positions_department ON public.key_positions(department);
CREATE INDEX idx_key_positions_is_critical ON public.key_positions(is_critical);
CREATE INDEX idx_succession_candidates_employee_id ON public.succession_candidates(employee_id);
CREATE INDEX idx_succession_candidates_key_position_id ON public.succession_candidates(key_position_id);
CREATE INDEX idx_succession_candidates_readiness_level ON public.succession_candidates(readiness_level);
CREATE INDEX idx_development_plans_employee_id ON public.development_plans(employee_id);
CREATE INDEX idx_development_plans_status ON public.development_plans(status);
CREATE INDEX idx_development_plans_target_date ON public.development_plans(target_date);

-- Create indexes for better performance
CREATE INDEX idx_key_positions_department ON public.key_positions(department);
CREATE INDEX idx_key_positions_is_critical ON public.key_positions(is_critical);
CREATE INDEX idx_succession_candidates_employee_id ON public.succession_candidates(employee_id);
CREATE INDEX idx_succession_candidates_key_position_id ON public.succession_candidates(key_position_id);
CREATE INDEX idx_succession_candidates_readiness_level ON public.succession_candidates(readiness_level);
CREATE INDEX idx_development_plans_employee_id ON public.development_plans(employee_id);
CREATE INDEX idx_development_plans_status ON public.development_plans(status);
CREATE INDEX idx_development_plans_target_date ON public.development_plans(target_date);
