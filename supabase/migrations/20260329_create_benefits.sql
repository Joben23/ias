-- Create benefits table for HR4 Benefits Administration
CREATE TABLE public.benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('government', 'company')),
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_benefits_type ON public.benefits(type);
CREATE INDEX idx_benefits_created_at ON public.benefits(created_at);

-- RLS Policies for benefits
-- Authenticated users can view all benefits (read-only by default)
CREATE POLICY "Authenticated can view benefits"
  ON public.benefits FOR SELECT TO authenticated
  USING (true);

-- HR and admin can manage all benefits
CREATE POLICY "HR and admin can manage benefits"
  ON public.benefits FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));

-- Create trigger for updated_at
CREATE TRIGGER update_benefits_updated_at
  BEFORE UPDATE ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();