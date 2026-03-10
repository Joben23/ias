
-- Add new columns to applicants table
ALTER TABLE public.applicants ADD COLUMN IF NOT EXISTS cover_letter text;
ALTER TABLE public.applicants ADD COLUMN IF NOT EXISTS skills text[];
ALTER TABLE public.applicants ADD COLUMN IF NOT EXISTS job_posting_id uuid REFERENCES public.job_postings(id);

-- Add location to job_postings
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS location text DEFAULT 'On-site';

-- Allow anonymous to view open job postings
CREATE POLICY "Anon can view open jobs" ON public.job_postings
FOR SELECT TO anon
USING (status = 'Open');

-- Allow anonymous to submit applications
CREATE POLICY "Anon can submit applications" ON public.applicants
FOR INSERT TO anon
WITH CHECK (true);

-- Create role system
CREATE TYPE public.app_role AS ENUM ('admin', 'hr', 'employee');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Employees table
CREATE TABLE public.employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    applicant_id uuid REFERENCES public.applicants(id) ON DELETE SET NULL,
    employee_id text NOT NULL UNIQUE,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    position text NOT NULL,
    department text NOT NULL,
    start_date text DEFAULT to_char(now(), 'YYYY-MM-DD'),
    status text DEFAULT 'Active',
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view employees" ON public.employees
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admin and HR can manage employees" ON public.employees
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));

-- Resume storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

CREATE POLICY "Anyone can upload resumes" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Authenticated can read resumes" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'resumes');
