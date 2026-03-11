
-- Interviews table
CREATE TABLE public.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
  job_posting_id uuid REFERENCES public.job_postings(id) ON DELETE SET NULL,
  interview_date text NOT NULL,
  interview_time text NOT NULL,
  interview_type text NOT NULL DEFAULT 'On-site',
  location text,
  meeting_link text,
  panel_members text[] DEFAULT '{}',
  notes text,
  status text NOT NULL DEFAULT 'Scheduled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view interviews" ON public.interviews
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "HR and Admin can manage interviews" ON public.interviews
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

-- Interview evaluations table
CREATE TABLE public.interview_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
  evaluator_name text NOT NULL,
  technical_skills integer NOT NULL CHECK (technical_skills BETWEEN 1 AND 5),
  communication_skills integer NOT NULL CHECK (communication_skills BETWEEN 1 AND 5),
  medical_knowledge integer NOT NULL CHECK (medical_knowledge BETWEEN 1 AND 5),
  professionalism integer NOT NULL CHECK (professionalism BETWEEN 1 AND 5),
  cultural_fit integer NOT NULL CHECK (cultural_fit BETWEEN 1 AND 5),
  overall_score numeric GENERATED ALWAYS AS (
    (technical_skills + communication_skills + medical_knowledge + professionalism + cultural_fit)::numeric / 5.0 * 20.0
  ) STORED,
  comments text,
  recommendation text NOT NULL DEFAULT 'Hire',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view evaluations" ON public.interview_evaluations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "HR and Admin can manage evaluations" ON public.interview_evaluations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));
