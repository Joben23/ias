-- Create key_positions table for critical hospital roles
CREATE TABLE public.key_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text NOT NULL,
  description text,
  required_competencies uuid[], -- Array of competency IDs
  required_experience_level integer DEFAULT 3, -- 1-5 proficiency level
  is_critical boolean DEFAULT true, -- Mark as critical for dashboard
  current_holder_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  readiness_level text NOT NULL DEFAULT 'Needs Development', -- Ready Now, Ready Soon, Needs Development
  readiness_score integer DEFAULT 0, -- 0-100 based on competencies + training
  succession_order integer DEFAULT 3, -- 1 = Primary, 2 = Secondary, 3+ = Backup
  gap_analysis text, -- JSON or text describing what's missing
  targeted_completion_date timestamptz, -- When employee should be ready
  assigned_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_date timestamptz NOT NULL DEFAULT now(),
  last_reviewed_at timestamptz,
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

-- Create succession_development_plans table
CREATE TABLE public.succession_development_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  succession_candidate_id uuid NOT NULL REFERENCES public.succession_candidates(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  required_trainings uuid[], -- Array of training IDs
  required_competencies uuid[], -- Array of competency IDs to develop
  target_completion_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'Active', -- Active, Completed, On Hold, Cancelled
  progress_percentage integer DEFAULT 0, -- 0-100
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.succession_development_plans ENABLE ROW LEVEL SECURITY;

-- Policies for succession_development_plans
CREATE POLICY "Authenticated can view development plans"
  ON public.succession_development_plans FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "HR and Admin can manage development plans"
  ON public.succession_development_plans FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

-- Create indexes for better performance
CREATE INDEX idx_key_positions_department ON public.key_positions(department);
CREATE INDEX idx_key_positions_is_critical ON public.key_positions(is_critical);
CREATE INDEX idx_succession_candidates_employee_id ON public.succession_candidates(employee_id);
CREATE INDEX idx_succession_candidates_key_position_id ON public.succession_candidates(key_position_id);
CREATE INDEX idx_succession_candidates_readiness_level ON public.succession_candidates(readiness_level);
CREATE INDEX idx_succession_candidates_succession_order ON public.succession_candidates(succession_order);
CREATE INDEX idx_development_plans_status ON public.succession_development_plans(status);
CREATE INDEX idx_development_plans_target_date ON public.succession_development_plans(target_completion_date);

-- Create function to calculate readiness based on competencies and training
CREATE OR REPLACE FUNCTION calculate_succession_readiness(
  p_employee_id uuid,
  p_position_id uuid
)
RETURNS TABLE (
  readiness_score integer,
  readiness_level text,
  competency_score integer,
  training_score integer,
  gaps text[]
) AS $$
DECLARE
  v_competency_score integer;
  v_training_score integer;
  v_readiness_score integer;
  v_readiness_level text;
  v_gaps text[];
  v_required_competencies uuid[];
  v_competency_count integer;
  v_completed_competencies integer;
BEGIN
  -- Get required competencies for position
  SELECT required_competencies INTO v_required_competencies
  FROM public.key_positions
  WHERE id = p_position_id;

  IF v_required_competencies IS NULL THEN
    v_required_competencies := ARRAY[]::uuid[];
  END IF;

  -- Calculate competency score
  IF array_length(v_required_competencies, 1) > 0 THEN
    v_competency_count := array_length(v_required_competencies, 1);
    
    SELECT COUNT(*) INTO v_completed_competencies
    FROM public.employee_competencies ec
    WHERE ec.employee_id = p_employee_id
    AND ec.competency_id = ANY(v_required_competencies)
    AND ec.proficiency_level >= 4; -- Level 4+ considered competent
    
    v_competency_score := ROUND((v_completed_competencies::numeric / v_competency_count::numeric) * 50)::integer;
  ELSE
    v_competency_score := 50;
  END IF;

  -- Calculate training score (completed trainings)
  SELECT COUNT(*)::integer INTO v_training_score
  FROM public.employee_trainings et
  WHERE et.employee_id = p_employee_id
  AND et.status = 'Completed';
  
  v_training_score := LEAST(50, v_training_score * 10); -- Cap at 50 points

  -- Calculate overall readiness
  v_readiness_score := v_competency_score + v_training_score;

  -- Determine readiness level
  IF v_readiness_score >= 80 THEN
    v_readiness_level := 'Ready Now';
  ELSIF v_readiness_score >= 60 THEN
    v_readiness_level := 'Ready Soon';
  ELSE
    v_readiness_level := 'Needs Development';
  END IF;

  -- Identify gaps
  v_gaps := ARRAY[]::text[];
  IF v_competency_score < 40 THEN
    v_gaps := array_append(v_gaps, 'Significant competency gaps');
  END IF;
  IF v_training_score < 30 THEN
    v_gaps := array_append(v_gaps, 'Limited training completion');
  END IF;

  RETURN QUERY SELECT v_readiness_score, v_readiness_level, v_competency_score, v_training_score, v_gaps;
END;
$$ LANGUAGE plpgsql;

-- Create function to identify critical positions without successors
CREATE OR REPLACE FUNCTION get_critical_positions_without_successors()
RETURNS TABLE (
  position_id uuid,
  position_name text,
  department text,
  current_holder text,
  successor_count integer,
  ready_now_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kp.id,
    kp.name,
    kp.department,
    COALESCE(e.first_name || ' ' || e.last_name, 'Vacant') as current_holder,
    COUNT(sc.id)::integer as successor_count,
    COUNT(CASE WHEN sc.readiness_level = 'Ready Now' THEN 1 END)::integer as ready_now_count
  FROM public.key_positions kp
  LEFT JOIN public.employees e ON kp.current_holder_id = e.id
  LEFT JOIN public.succession_candidates sc ON kp.id = sc.key_position_id
  WHERE kp.is_critical = true
  GROUP BY kp.id, kp.name, kp.department, e.first_name, e.last_name
  HAVING COUNT(sc.id) = 0 OR COUNT(CASE WHEN sc.readiness_level = 'Ready Now' THEN 1 END) = 0;
END;
$$ LANGUAGE plpgsql;

-- Create function to get succession pipeline for a position
CREATE OR REPLACE FUNCTION get_succession_pipeline(p_position_id uuid)
RETURNS TABLE (
  employee_id uuid,
  employee_name text,
  position text,
  readiness_level text,
  readiness_score integer,
  succession_order integer,
  gap_analysis text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.employee_id,
    e.first_name || ' ' || e.last_name as employee_name,
    kp.name,
    sc.readiness_level,
    sc.readiness_score,
    sc.succession_order,
    sc.gap_analysis
  FROM public.succession_candidates sc
  INNER JOIN public.employees e ON sc.employee_id = e.id
  INNER JOIN public.key_positions kp ON sc.key_position_id = kp.id
  WHERE kp.id = p_position_id
  ORDER BY sc.succession_order, sc.readiness_score DESC;
END;
$$ LANGUAGE plpgsql;
