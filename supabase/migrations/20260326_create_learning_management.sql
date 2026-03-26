-- Create learning management system tables
-- Migration: 20260326_create_learning_management.sql

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    duration_hours INTEGER NOT NULL DEFAULT 1,
    instructor VARCHAR(255),
    objectives TEXT,
    prerequisites TEXT,
    created_by UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course competencies (link courses to competencies they develop)
CREATE TABLE IF NOT EXISTS course_competencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    proficiency_level_id VARCHAR(50) NOT NULL REFERENCES proficiency_levels(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, competency_id)
);

-- Employee courses table (enrollments and progress)
CREATE TABLE IF NOT EXISTS employee_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'Not Started',
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, course_id)
);

-- Course certifications table
CREATE TABLE IF NOT EXISTS course_certifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_course_id UUID NOT NULL REFERENCES employee_courses(id) ON DELETE CASCADE,
    certificate_number VARCHAR(255) NOT NULL UNIQUE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    issued_by UUID REFERENCES employees(id),
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_employee_courses_employee_id ON employee_courses(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_courses_course_id ON employee_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_employee_courses_status ON employee_courses(status);
CREATE INDEX IF NOT EXISTS idx_course_competencies_course_id ON course_competencies(course_id);
CREATE INDEX IF NOT EXISTS idx_course_competencies_competency_id ON course_competencies(competency_id);
CREATE INDEX IF NOT EXISTS idx_course_certifications_employee_course_id ON course_certifications(employee_course_id);

-- Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to read courses" ON courses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage courses" ON courses
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read course competencies" ON course_competencies
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage course competencies" ON course_competencies
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read employee courses" ON employee_courses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage employee courses" ON employee_courses
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read course certifications" ON course_certifications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage course certifications" ON course_certifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample courses
INSERT INTO courses (name, category, description, duration_hours, instructor, objectives, prerequisites) VALUES
    ('Advanced Patient Care Techniques', 'Medical', 'Learn advanced patient care methodologies including assessment, treatment planning, and patient monitoring in complex scenarios.', 8, 'Dr. Sarah Johnson', 'Master advanced patient care techniques, improve assessment skills, enhance treatment planning abilities', 'Basic Patient Care certification'),
    ('Emergency Response Training', 'Medical', 'Comprehensive training on handling medical emergencies, crisis management, and rapid response protocols.', 12, 'Dr. Michael Chen', 'Develop emergency response skills, learn crisis management protocols, master rapid assessment techniques', 'Basic Life Support certification'),
    ('Effective Healthcare Communication', 'Soft Skills', 'Master communication skills essential for healthcare professionals including patient interaction, team collaboration, and difficult conversations.', 6, 'Dr. Emily Rodriguez', 'Improve patient communication, enhance team collaboration, develop conflict resolution skills', 'None'),
    ('Medical Documentation Excellence', 'Technical', 'Learn proper medical documentation practices, electronic health records management, and compliance requirements.', 4, 'Lisa Thompson, RN', 'Master EHR systems, understand documentation compliance, improve record accuracy', 'Basic computer skills'),
    ('Infection Control & Prevention', 'Medical', 'Comprehensive training on infection prevention, sterilization techniques, and maintaining sterile environments.', 6, 'Dr. Robert Kim', 'Understand infection control protocols, master sterilization techniques, implement prevention strategies', 'None'),
    ('Clinical Decision Making', 'Medical', 'Develop critical thinking and decision-making skills for complex clinical scenarios and patient care decisions.', 10, 'Dr. Jennifer Walsh', 'Enhance clinical judgment, improve decision-making processes, reduce medical errors', '2+ years clinical experience'),
    ('Team Leadership in Healthcare', 'Soft Skills', 'Learn leadership skills specific to healthcare settings, team management, and interdisciplinary collaboration.', 8, 'Dr. David Park', 'Develop leadership skills, improve team management, enhance interdisciplinary collaboration', '3+ years healthcare experience'),
    ('Patient Education & Counseling', 'Medical', 'Master techniques for patient education, health counseling, and promoting patient engagement in their care.', 5, 'Maria Gonzalez, NP', 'Improve patient education skills, develop counseling techniques, enhance patient engagement', 'Basic communication skills'),
    ('Time Management for Healthcare Professionals', 'Soft Skills', 'Learn effective time management strategies, prioritization techniques, and work-life balance in demanding healthcare environments.', 4, 'Dr. Amanda Foster', 'Master time management techniques, improve work efficiency, achieve work-life balance', 'None'),
    ('Ethical Practice in Healthcare', 'Soft Skills', 'Explore ethical dilemmas in healthcare, understand professional codes of conduct, and develop ethical decision-making frameworks.', 6, 'Dr. Thomas Wright', 'Understand healthcare ethics, develop ethical decision-making, maintain professional standards', 'None')
ON CONFLICT DO NOTHING;

-- Link courses to competencies they develop
INSERT INTO course_competencies (course_id, competency_id, proficiency_level_id) VALUES
    ((SELECT id FROM courses WHERE name = 'Advanced Patient Care Techniques'), (SELECT id FROM competencies WHERE name = 'Patient Care'), 'advanced'),
    ((SELECT id FROM courses WHERE name = 'Emergency Response Training'), (SELECT id FROM competencies WHERE name = 'Emergency Response'), 'intermediate'),
    ((SELECT id FROM courses WHERE name = 'Effective Healthcare Communication'), (SELECT id FROM competencies WHERE name = 'Communication'), 'advanced'),
    ((SELECT id FROM courses WHERE name = 'Medical Documentation Excellence'), (SELECT id FROM competencies WHERE name = 'Medical Documentation'), 'advanced'),
    ((SELECT id FROM courses WHERE name = 'Infection Control & Prevention'), (SELECT id FROM competencies WHERE name = 'Infection Control'), 'advanced'),
    ((SELECT id FROM courses WHERE name = 'Clinical Decision Making'), (SELECT id FROM competencies WHERE name = 'Clinical Decision Making'), 'expert'),
    ((SELECT id FROM courses WHERE name = 'Team Leadership in Healthcare'), (SELECT id FROM competencies WHERE name = 'Team Collaboration'), 'advanced'),
    ((SELECT id FROM courses WHERE name = 'Patient Education & Counseling'), (SELECT id FROM competencies WHERE name = 'Patient Education'), 'intermediate'),
    ((SELECT id FROM courses WHERE name = 'Time Management for Healthcare Professionals'), (SELECT id FROM competencies WHERE name = 'Time Management'), 'intermediate'),
    ((SELECT id FROM courses WHERE name = 'Ethical Practice in Healthcare'), (SELECT id FROM competencies WHERE name = 'Ethical Practice'), 'advanced')
ON CONFLICT DO NOTHING;