
-- Onboarding tasks/checklist per employee
CREATE TABLE public.onboarding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  task_category text NOT NULL DEFAULT 'document',
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view onboarding tasks" ON public.onboarding_tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "HR and Admin can manage onboarding tasks" ON public.onboarding_tasks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr'::app_role));

-- Onboarding documents
CREATE TABLE public.onboarding_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.onboarding_tasks(id) ON DELETE SET NULL,
  document_name text NOT NULL,
  document_type text NOT NULL,
  file_path text NOT NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view onboarding documents" ON public.onboarding_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "HR and Admin can manage onboarding documents" ON public.onboarding_documents
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr'::app_role));

-- Orientation sessions
CREATE TABLE public.orientations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  orientation_date text NOT NULL,
  orientation_time text NOT NULL,
  location text NOT NULL DEFAULT 'Main Hospital Building',
  trainer_name text NOT NULL,
  status text NOT NULL DEFAULT 'Scheduled',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.orientations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view orientations" ON public.orientations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "HR and Admin can manage orientations" ON public.orientations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr'::app_role));

-- Add onboarding_status column to employees
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS onboarding_status text NOT NULL DEFAULT 'Offer Accepted';

-- Storage bucket for onboarding documents
INSERT INTO storage.buckets (id, name, public) VALUES ('onboarding-documents', 'onboarding-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated can upload onboarding docs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'onboarding-documents');

CREATE POLICY "Authenticated can view onboarding docs" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'onboarding-documents');

-- Trigger to create default onboarding tasks when employee is created
CREATE OR REPLACE FUNCTION public.create_default_onboarding_tasks()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.onboarding_tasks (employee_id, task_name, task_category) VALUES
    (NEW.id, 'Medical Examination', 'medical'),
    (NEW.id, 'Government IDs', 'document'),
    (NEW.id, 'Signed Employment Contract', 'document'),
    (NEW.id, 'Professional License Verification', 'license'),
    (NEW.id, 'Background Check', 'verification');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_onboarding_tasks
  AFTER INSERT ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_onboarding_tasks();
