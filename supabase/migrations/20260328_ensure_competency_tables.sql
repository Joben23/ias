-- Migration: 20260328_ensure_competency_tables.sql

-- Ensure required competency tables exist and have RLS configured

-- Competencies
CREATE TABLE IF NOT EXISTS competencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proficiency levels
CREATE TABLE IF NOT EXISTS proficiency_levels (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee competencies
CREATE TABLE IF NOT EXISTS employee_competencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  proficiency_level_id VARCHAR(50) NOT NULL REFERENCES proficiency_levels(id),
  assessed_by UUID REFERENCES employees(id),
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, competency_id)
);

-- RLS for competencies
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read competencies" ON competencies
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Allow authenticated users to manage competencies" ON competencies
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS for proficiency levels
ALTER TABLE proficiency_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read proficiency levels" ON proficiency_levels
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS for employee competencies
ALTER TABLE employee_competencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read employee competencies" ON employee_competencies
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Allow authenticated users to manage employee competencies" ON employee_competencies
  FOR ALL USING (auth.role() = 'authenticated');

-- Enforce relation employee_competencies.employee_id -> employees.id implicitly by FK (guaranteed above)

-- Ensure data for proficiency levels exists
INSERT INTO proficiency_levels (id, name, description, level_order) VALUES
  ('beginner', 'Beginner', 'Basic understanding and limited experience', 1),
  ('basic', 'Basic', 'Fundamental knowledge and some practical experience', 2),
  ('intermediate', 'Intermediate', 'Good understanding and practical experience', 3),
  ('advanced', 'Advanced', 'Strong expertise and extensive experience', 4),
  ('expert', 'Expert', 'Mastery level with deep expertise and leadership', 5)
ON CONFLICT (id) DO NOTHING;
