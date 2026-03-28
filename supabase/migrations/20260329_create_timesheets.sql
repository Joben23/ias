-- Create timesheets table for HR3 Timesheet Management
CREATE TABLE public.timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_hours numeric(5, 2) NOT NULL DEFAULT 0,
  overtime_hours numeric(5, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

-- Create indexes for faster queries
CREATE INDEX idx_timesheets_employee_id ON public.timesheets(employee_id);
CREATE INDEX idx_timesheets_date ON public.timesheets(date);
CREATE INDEX idx_timesheets_status ON public.timesheets(status);
CREATE INDEX idx_timesheets_created_at ON public.timesheets(created_at);

-- RLS Policies for timesheets
-- Authenticated users can view all timesheets (read-only by default)
CREATE POLICY "Authenticated can view timesheets"
  ON public.timesheets FOR SELECT TO authenticated
  USING (true);

-- Employees can only view their own timesheets
CREATE POLICY "Employees can view own timesheets"
  ON public.timesheets FOR SELECT TO authenticated
  USING (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- HR and admin can manage all timesheets
CREATE POLICY "HR and admin can manage timesheets"
  ON public.timesheets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));