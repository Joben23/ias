
-- Create applicants table
CREATE TABLE public.applicants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  education TEXT,
  certifications TEXT[],
  position_applied TEXT NOT NULL,
  department TEXT NOT NULL,
  application_date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  status TEXT NOT NULL DEFAULT 'Applied',
  experience TEXT,
  resume_file TEXT,
  rating NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_postings table
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'Doctor',
  employment_type TEXT NOT NULL DEFAULT 'Full-Time',
  description TEXT NOT NULL,
  requirements TEXT[],
  applicant_count INTEGER NOT NULL DEFAULT 0,
  posted_date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  closing_date TEXT,
  status TEXT NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recognitions table
CREATE TABLE public.recognitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  award_type TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognitions ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth required for this HR dashboard)
CREATE POLICY "Allow full access to applicants" ON public.applicants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to job_postings" ON public.job_postings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to recognitions" ON public.recognitions FOR ALL USING (true) WITH CHECK (true);
