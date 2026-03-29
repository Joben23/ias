-- Create benefit_transactions table for HR4 Benefits Administration
CREATE TABLE public.benefit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  benefit_id uuid NOT NULL REFERENCES public.benefits(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deduction', 'contribution')),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  payroll_id uuid REFERENCES public.payrolls(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.benefit_transactions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_benefit_transactions_employee_id ON public.benefit_transactions(employee_id);
CREATE INDEX idx_benefit_transactions_benefit_id ON public.benefit_transactions(benefit_id);
CREATE INDEX idx_benefit_transactions_transaction_date ON public.benefit_transactions(transaction_date);
CREATE INDEX idx_benefit_transactions_transaction_type ON public.benefit_transactions(transaction_type);
CREATE INDEX idx_benefit_transactions_payroll_id ON public.benefit_transactions(payroll_id);
CREATE INDEX idx_benefit_transactions_created_at ON public.benefit_transactions(created_at);

-- RLS Policies for benefit_transactions
-- Authenticated users can view all benefit transactions (read-only by default)
CREATE POLICY "Authenticated can view benefit transactions"
  ON public.benefit_transactions FOR SELECT TO authenticated
  USING (true);

-- Employees can only view their own benefit transactions
CREATE POLICY "Employees can view their own benefit transactions"
  ON public.benefit_transactions FOR SELECT TO authenticated
  USING (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- HR and admin can manage all benefit transactions
CREATE POLICY "HR and admin can manage benefit transactions"
  ON public.benefit_transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));