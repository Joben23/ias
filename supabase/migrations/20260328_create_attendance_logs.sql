-- Create attendance_logs table for HR3 Time & Attendance System
CREATE TABLE public.attendance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date date NOT NULL,
  time_in timestamptz,
  time_out timestamptz,
  total_hours numeric(5, 2),
  status text NOT NULL DEFAULT 'present', -- present, late, absent
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_attendance_logs_employee_id ON public.attendance_logs(employee_id);
CREATE INDEX idx_attendance_logs_date ON public.attendance_logs(date);
CREATE INDEX idx_attendance_logs_status ON public.attendance_logs(status);
CREATE INDEX idx_attendance_logs_created_at ON public.attendance_logs(created_at);

-- RLS Policies for attendance_logs

-- Authenticated users can view all attendance logs (read-only by default)
CREATE POLICY "Authenticated can view attendance logs"
  ON public.attendance_logs FOR SELECT TO authenticated
  USING (true);

-- Employees can only insert/update their own records
CREATE POLICY "Employees can clock in/out for themselves"
  ON public.attendance_logs FOR INSERT TO authenticated
  WITH CHECK (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update their own attendance"
  ON public.attendance_logs FOR UPDATE TO authenticated
  USING (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- HR and Admin can read and update all attendance logs
CREATE POLICY "HR can manage all attendance records"
  ON public.attendance_logs FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));

CREATE POLICY "HR can delete attendance records"
  ON public.attendance_logs FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr'));
