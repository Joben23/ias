-- Create leaves table for HR3 Leave Management
CREATE TABLE public.leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL, -- sick, vacation, emergency, personal
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (start_date <= end_date)
);

-- Enable Row Level Security
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

-- Create indexes for faster queries
CREATE INDEX idx_leaves_employee_id ON public.leaves(employee_id);
CREATE INDEX idx_leaves_start_date ON public.leaves(start_date);
CREATE INDEX idx_leaves_end_date ON public.leaves(end_date);
CREATE INDEX idx_leaves_status ON public.leaves(status);
CREATE INDEX idx_leaves_created_at ON public.leaves(created_at);

-- RLS Policies for leaves
-- Authenticated users can view all leaves (read-only by default)
CREATE POLICY "Authenticated can view leaves"
  ON public.leaves FOR SELECT TO authenticated
  USING (true);

-- Employees can only view their own leaves
CREATE POLICY "Employees can view own leaves"
  ON public.leaves FOR SELECT TO authenticated
  USING (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- Employees can insert their own leave requests
CREATE POLICY "Employees can create own leave requests"
  ON public.leaves FOR INSERT TO authenticated
  WITH CHECK (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- HR and admin can manage all leaves
CREATE POLICY "HR and admin can manage leaves"
  ON public.leaves FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));