-- Extend employees table for HR4 Core Human Capital Management
-- Add HCM-related fields to existing employees table

ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS employment_type text DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract')),
ADD COLUMN IF NOT EXISTS salary numeric(12,2),
ADD COLUMN IF NOT EXISTS pay_frequency text DEFAULT 'monthly' CHECK (pay_frequency IN ('monthly', 'bi_weekly')),
ADD COLUMN IF NOT EXISTS hire_date date,
ADD COLUMN IF NOT EXISTS employment_status text DEFAULT 'active' CHECK (employment_status IN ('active', 'resigned', 'terminated')),
ADD COLUMN IF NOT EXISTS tax_id text,
ADD COLUMN IF NOT EXISTS sss_number text,
ADD COLUMN IF NOT EXISTS philhealth_number text,
ADD COLUMN IF NOT EXISTS pagibig_number text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_employment_type ON public.employees(employment_type);
CREATE INDEX IF NOT EXISTS idx_employees_employment_status ON public.employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON public.employees(hire_date);

-- Update existing RLS policies to include new fields
-- The existing policies should already cover these fields since they're in the same table