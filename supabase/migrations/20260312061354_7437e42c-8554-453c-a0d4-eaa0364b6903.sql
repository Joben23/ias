
CREATE TABLE public.job_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_id UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  salary_offer TEXT NOT NULL,
  start_date TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'Full-Time',
  offer_date TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  status TEXT NOT NULL DEFAULT 'Offer Sent',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view offers"
  ON public.job_offers FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "HR and Admin can manage offers"
  ON public.job_offers FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr'::app_role));
