-- Create training_programs table
CREATE TABLE public.training_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  competency_id uuid REFERENCES public.competencies(id) ON DELETE SET NULL,
  required_skill_level integer NOT NULL DEFAULT 1, -- 1-5 proficiency level
  training_type text NOT NULL DEFAULT 'Technical', -- Technical, Medical, Soft Skills
  duration_hours numeric NOT NULL,
  trainer_name text,
  schedule_date timestamptz,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;

-- Policies for training_programs
CREATE POLICY "Authenticated can view training programs"
  ON public.training_programs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "HR and Admin can create training programs"
  ON public.training_programs FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR and Admin can update training programs"
  ON public.training_programs FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR and Admin can delete training programs"
  ON public.training_programs FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

-- Create employee_trainings table (training assignments)
CREATE TABLE public.employee_trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  training_id uuid NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Assigned', -- Assigned, In Progress, Completed, Missed, Cancelled
  assigned_date timestamptz NOT NULL DEFAULT now(),
  attendance_date timestamptz,
  completion_date timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, training_id)
);

ALTER TABLE public.employee_trainings ENABLE ROW LEVEL SECURITY;

-- Policies for employee_trainings
CREATE POLICY "Authenticated can view employee trainings"
  ON public.employee_trainings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Employees can view their own trainings"
  ON public.employee_trainings FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR and Admin can manage employee trainings"
  ON public.employee_trainings FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR and Admin can update employee trainings"
  ON public.employee_trainings FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR and Admin can delete employee trainings"
  ON public.employee_trainings FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

-- Create training_evaluations table
CREATE TABLE public.training_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_training_id uuid NOT NULL REFERENCES public.employee_trainings(id) ON DELETE CASCADE,
  knowledge_improvement integer, -- 1-5 rating
  performance_improvement integer, -- 1-5 rating
  trainer_feedback text,
  overall_rating integer NOT NULL, -- 1-5 rating
  evaluator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_evaluations ENABLE ROW LEVEL SECURITY;

-- Policies for training_evaluations
CREATE POLICY "Authenticated can view training evaluations"
  ON public.training_evaluations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "HR and Admin can manage training evaluations"
  ON public.training_evaluations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

-- Create indexes for better performance
CREATE INDEX idx_training_programs_competency_id ON public.training_programs(competency_id);
CREATE INDEX idx_training_programs_course_id ON public.training_programs(course_id);
CREATE INDEX idx_training_programs_created_at ON public.training_programs(created_at DESC);

CREATE INDEX idx_employee_trainings_employee_id ON public.employee_trainings(employee_id);
CREATE INDEX idx_employee_trainings_training_id ON public.employee_trainings(training_id);
CREATE INDEX idx_employee_trainings_status ON public.employee_trainings(status);
CREATE INDEX idx_employee_trainings_assigned_date ON public.employee_trainings(assigned_date DESC);

CREATE INDEX idx_training_evaluations_employee_training_id ON public.training_evaluations(employee_training_id);
CREATE INDEX idx_training_evaluations_evaluator_id ON public.training_evaluations(evaluator_id);
CREATE INDEX idx_training_evaluations_evaluated_at ON public.training_evaluations(evaluated_at DESC);

-- Create function to get employees with skill gaps for automatic training recommendation
CREATE OR REPLACE FUNCTION get_employees_with_skill_gaps()
RETURNS TABLE (
  employee_id uuid,
  employee_name text,
  competency_id uuid,
  competency_name text,
  current_level integer,
  target_level integer,
  gap_level integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as employee_id,
    COALESCE(e.first_name || ' ' || e.last_name, e.email) as employee_name,
    c.id as competency_id,
    c.name as competency_name,
    COALESCE(ec.proficiency_level, 0) as current_level,
    tp.required_skill_level as target_level,
    tp.required_skill_level - COALESCE(ec.proficiency_level, 0) as gap_level
  FROM public.employees e
  CROSS JOIN public.training_programs tp
  CROSS JOIN public.competencies c
  LEFT JOIN public.employee_competencies ec 
    ON e.id = ec.employee_id 
    AND c.id = ec.competency_id
  WHERE 
    e.status = 'Employee Activated'
    AND tp.competency_id = c.id
    AND COALESCE(ec.proficiency_level, 0) < tp.required_skill_level
    AND NOT EXISTS (
      SELECT 1 FROM public.employee_trainings et
      WHERE et.employee_id = e.id 
        AND et.training_id = tp.id
        AND et.status IN ('Assigned', 'In Progress', 'Completed')
    )
  ORDER BY e.id, c.name, gap_level DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-assign trainings based on skill gaps
CREATE OR REPLACE FUNCTION auto_assign_trainings_for_employee(p_employee_id uuid)
RETURNS TABLE (
  assignment_id uuid,
  training_id uuid,
  training_name text,
  gap_level integer
) AS $$
DECLARE
  v_gap_record RECORD;
  v_assignment_id uuid;
BEGIN
  FOR v_gap_record IN
    SELECT * FROM get_employees_with_skill_gaps() 
    WHERE employee_id = p_employee_id
  LOOP
    -- Check if training already assigned
    IF NOT EXISTS (
      SELECT 1 FROM public.employee_trainings et
      INNER JOIN public.training_programs tp ON et.training_id = tp.id
      WHERE et.employee_id = p_employee_id 
        AND tp.competency_id = v_gap_record.competency_id
        AND et.status IN ('Assigned', 'In Progress', 'Completed')
    ) THEN
      -- Find matching training program
      SELECT tp.id INTO v_assignment_id
      FROM public.training_programs tp
      WHERE tp.competency_id = v_gap_record.competency_id
        AND tp.required_skill_level <= v_gap_record.target_level
      LIMIT 1;
      
      IF v_assignment_id IS NOT NULL THEN
        -- Create training assignment
        INSERT INTO public.employee_trainings (employee_id, training_id, status)
        VALUES (p_employee_id, v_assignment_id, 'Assigned')
        RETURNING id INTO v_assignment_id;
        
        RETURN QUERY
        SELECT 
          v_assignment_id,
          tp.id,
          tp.name,
          v_gap_record.gap_level
        FROM public.training_programs tp
        WHERE tp.id = v_assignment_id;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
