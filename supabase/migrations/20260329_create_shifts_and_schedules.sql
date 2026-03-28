-- Create shifts table for HR3 Shift & Schedule Management
CREATE TABLE public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create schedules table for HR3 Shift & Schedule Management
CREATE TABLE public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_id uuid NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'scheduled', -- scheduled, completed
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create indexes for faster queries
CREATE INDEX idx_shifts_name ON public.shifts(name);
CREATE INDEX idx_schedules_employee_id ON public.schedules(employee_id);
CREATE INDEX idx_schedules_shift_id ON public.schedules(shift_id);
CREATE INDEX idx_schedules_date ON public.schedules(date);
CREATE INDEX idx_schedules_status ON public.schedules(status);

-- RLS Policies for shifts
-- Authenticated users can view all shifts (read-only by default)
CREATE POLICY "Authenticated can view shifts"
  ON public.shifts FOR SELECT TO authenticated
  USING (true);

-- Only HR and admin can manage shifts
CREATE POLICY "HR and admin can manage shifts"
  ON public.shifts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));

-- RLS Policies for schedules
-- Authenticated users can view all schedules (read-only by default)
CREATE POLICY "Authenticated can view schedules"
  ON public.schedules FOR SELECT TO authenticated
  USING (true);

-- Employees can only view their own schedules
CREATE POLICY "Employees can view own schedules"
  ON public.schedules FOR SELECT TO authenticated
  USING (
    employee_id = (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- HR and admin can manage all schedules
CREATE POLICY "HR and admin can manage schedules"
  ON public.schedules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'));

-- Insert some default shifts
INSERT INTO public.shifts (name, start_time, end_time) VALUES
  ('Morning Shift', '08:00:00', '17:00:00'),
  ('Night Shift', '20:00:00', '05:00:00'),
  ('Afternoon Shift', '14:00:00', '23:00:00'),
  ('Early Morning', '06:00:00', '15:00:00');