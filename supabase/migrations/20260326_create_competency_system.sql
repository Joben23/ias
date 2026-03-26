-- Create competency management system tables
-- Migration: 20260326_create_competency_system.sql

-- Competencies table
CREATE TABLE IF NOT EXISTS competencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proficiency levels (static data)
CREATE TABLE IF NOT EXISTS proficiency_levels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee competencies table
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

-- Role competencies table (required competencies for positions)
CREATE TABLE IF NOT EXISTS role_competencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    position VARCHAR(255) NOT NULL,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    required_proficiency_level_id VARCHAR(50) NOT NULL REFERENCES proficiency_levels(id),
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(position, competency_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competencies_category ON competencies(category);
CREATE INDEX IF NOT EXISTS idx_employee_competencies_employee_id ON employee_competencies(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_competencies_competency_id ON employee_competencies(competency_id);
CREATE INDEX IF NOT EXISTS idx_role_competencies_position ON role_competencies(position);

-- Row Level Security (RLS)
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE proficiency_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_competencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to read competencies" ON competencies
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage competencies" ON competencies
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read proficiency levels" ON proficiency_levels
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read employee competencies" ON employee_competencies
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage employee competencies" ON employee_competencies
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read role competencies" ON role_competencies
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage role competencies" ON role_competencies
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert default proficiency levels
INSERT INTO proficiency_levels (id, name, description, level_order) VALUES
    ('beginner', 'Beginner', 'Basic understanding and limited experience', 1),
    ('basic', 'Basic', 'Fundamental knowledge and some practical experience', 2),
    ('intermediate', 'Intermediate', 'Good understanding and practical experience', 3),
    ('advanced', 'Advanced', 'Strong expertise and extensive experience', 4),
    ('expert', 'Expert', 'Mastery level with deep expertise and leadership', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert sample competencies
INSERT INTO competencies (name, category, description) VALUES
    ('Patient Care', 'Medical', 'Providing direct care to patients including assessment, treatment, and monitoring'),
    ('Emergency Response', 'Medical', 'Handling medical emergencies and critical situations'),
    ('Communication', 'Soft Skills', 'Effective verbal and written communication with patients, families, and colleagues'),
    ('Medical Documentation', 'Technical', 'Accurate and timely documentation of patient care and procedures'),
    ('Infection Control', 'Medical', 'Maintaining sterile environments and preventing healthcare-associated infections'),
    ('Team Collaboration', 'Soft Skills', 'Working effectively within multidisciplinary healthcare teams'),
    ('Clinical Decision Making', 'Medical', 'Making informed clinical judgments and treatment decisions'),
    ('Patient Education', 'Medical', 'Educating patients and families about health conditions and treatments'),
    ('Time Management', 'Soft Skills', 'Prioritizing tasks and managing workload efficiently'),
    ('Ethical Practice', 'Soft Skills', 'Maintaining professional ethics and patient confidentiality'),
    ('Technical Skills', 'Technical', 'Proficiency with medical equipment, software, and technical procedures'),
    ('Leadership', 'Soft Skills', 'Leading teams, mentoring staff, and managing healthcare operations'),
    ('Quality Assurance', 'Technical', 'Ensuring quality standards and continuous improvement in healthcare delivery'),
    ('Cultural Competence', 'Soft Skills', 'Understanding and respecting diverse patient backgrounds and needs'),
    ('Critical Thinking', 'Soft Skills', 'Analyzing complex situations and making evidence-based decisions')
ON CONFLICT DO NOTHING;

-- Insert sample role competencies (for common positions)
INSERT INTO role_competencies (position, competency_id, required_proficiency_level_id, is_required) VALUES
    ('Registered Nurse', (SELECT id FROM competencies WHERE name = 'Patient Care'), 'advanced', true),
    ('Registered Nurse', (SELECT id FROM competencies WHERE name = 'Emergency Response'), 'intermediate', true),
    ('Registered Nurse', (SELECT id FROM competencies WHERE name = 'Communication'), 'advanced', true),
    ('Registered Nurse', (SELECT id FROM competencies WHERE name = 'Medical Documentation'), 'advanced', true),
    ('Registered Nurse', (SELECT id FROM competencies WHERE name = 'Infection Control'), 'advanced', true),
    ('Registered Nurse', (SELECT id FROM competencies WHERE name = 'Team Collaboration'), 'intermediate', true),
    ('Registered Nurse', (SELECT id FROM competencies WHERE name = 'Patient Education'), 'intermediate', true),
    ('Physician', (SELECT id FROM competencies WHERE name = 'Clinical Decision Making'), 'expert', true),
    ('Physician', (SELECT id FROM competencies WHERE name = 'Patient Care'), 'expert', true),
    ('Physician', (SELECT id FROM competencies WHERE name = 'Communication'), 'advanced', true),
    ('Physician', (SELECT id FROM competencies WHERE name = 'Emergency Response'), 'expert', true),
    ('Physician', (SELECT id FROM competencies WHERE name = 'Medical Documentation'), 'advanced', true),
    ('Medical Assistant', (SELECT id FROM competencies WHERE name = 'Patient Care'), 'intermediate', true),
    ('Medical Assistant', (SELECT id FROM competencies WHERE name = 'Medical Documentation'), 'intermediate', true),
    ('Medical Assistant', (SELECT id FROM competencies WHERE name = 'Communication'), 'intermediate', true),
    ('Medical Assistant', (SELECT id FROM competencies WHERE name = 'Infection Control'), 'basic', true),
    ('Pharmacist', (SELECT id FROM competencies WHERE name = 'Clinical Decision Making'), 'advanced', true),
    ('Pharmacist', (SELECT id FROM competencies WHERE name = 'Medical Documentation'), 'advanced', true),
    ('Pharmacist', (SELECT id FROM competencies WHERE name = 'Communication'), 'intermediate', true),
    ('Pharmacist', (SELECT id FROM competencies WHERE name = 'Patient Education'), 'advanced', true),
    ('Lab Technician', (SELECT id FROM competencies WHERE name = 'Medical Documentation'), 'intermediate', true),
    ('Lab Technician', (SELECT id FROM competencies WHERE name = 'Infection Control'), 'advanced', true),
    ('Lab Technician', (SELECT id FROM competencies WHERE name = 'Technical Skills'), 'intermediate', true),
    ('Administrative Assistant', (SELECT id FROM competencies WHERE name = 'Communication'), 'intermediate', true),
    ('Administrative Assistant', (SELECT id FROM competencies WHERE name = 'Time Management'), 'intermediate', true),
    ('Administrative Assistant', (SELECT id FROM competencies WHERE name = 'Medical Documentation'), 'basic', true)
ON CONFLICT DO NOTHING;