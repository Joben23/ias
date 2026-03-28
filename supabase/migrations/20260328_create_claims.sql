-- Create claims table for HR3 Claims & Reimbursement System
CREATE TABLE public.claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  claim_type text NOT NULL, -- travel, meal, medical, others
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  receipt_url text,
  status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Create indexes for faster queries
CREATE INDEX idx_claims_employee_id ON public.claims(employee_id);
CREATE INDEX idx_claims_claim_type ON public.claims(claim_type);
CREATE INDEX idx_claims_status ON public.claims(status);
CREATE INDEX idx_claims_submitted_at ON public.claims(submitted_at);
CREATE INDEX idx_claims_created_at ON public.claims(created_at);

-- RLS Policies for claims
-- Authenticated users can view all claims (read-only by default)
CREATE POLICY "Authenticated can view claims"
  ON public.claims FOR SELECT TO authenticated
  USING (true);

-- Employees can only view their own claims
CREATE POLICY "Employees can view own claims"
  ON public.claims FOR SELECT TO authenticated
  USING (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- Employees can insert their own claims
CREATE POLICY "Employees can create own claims"
  ON public.claims FOR INSERT TO authenticated
  WITH CHECK (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- HR and admin can manage all claims
CREATE POLICY "HR and admin can manage claims"
  ON public.claims FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));