-- Create payrolls table for HR4 Payroll Management System
CREATE TABLE public.payrolls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2020 AND year <= 2100),
  basic_salary numeric(12,2) NOT NULL,
  total_days_worked integer NOT NULL DEFAULT 0,
  total_absent_days integer NOT NULL DEFAULT 0,
  total_leave_days integer NOT NULL DEFAULT 0,
  gross_salary numeric(12,2) NOT NULL,
  deductions numeric(12,2) NOT NULL DEFAULT 0,
  net_salary numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- Enable Row Level Security
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_payrolls_employee_id ON public.payrolls(employee_id);
CREATE INDEX idx_payrolls_month_year ON public.payrolls(month, year);
CREATE INDEX idx_payrolls_status ON public.payrolls(status);
CREATE INDEX idx_payrolls_created_at ON public.payrolls(created_at);

-- RLS Policies for payrolls
-- Authenticated users can view all payrolls (read-only by default)
CREATE POLICY "Authenticated can view payrolls"
  ON public.payrolls FOR SELECT TO authenticated
  USING (true);

-- Employees can only view their own payrolls
CREATE POLICY "Employees can view own payrolls"
  ON public.payrolls FOR SELECT TO authenticated
  USING (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- HR and admin can manage all payrolls
CREATE POLICY "HR and admin can manage payrolls"
  ON public.payrolls FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));