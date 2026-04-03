# Hospital HR System - Database Schema Reference

## Overview

The database is organized into three main modules:

1. **Applicant Management** - Track job applications and hiring pipeline
2. **Employee Management** - Track active employees and their onboarding
3. **System Administration** - Users, roles, and security

---

## Module 1: Applicant Management

### Table: applicants

Stores information about job applicants.

```sql
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  position_applied TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT DEFAULT 'Applied',
  -- Status values: Applied, Under Screening, Shortlisted, Interview Scheduled,
  -- Interview Completed, Selected, Offer Sent, Offer Accepted, Hired, Rejected
  application_date TIMESTAMP DEFAULT now(),
  resume_file TEXT, -- Storage bucket path
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Indexes:**
- `idx_applicants_status` - For filtering by status
- `idx_applicants_email` - Email lookup
- `idx_applicants_created_at` - For sorting

**RLS Policies:**
- HR/Admin: Full read/write access
- Applicants: Read-only own record
- Employees: Read-only all records

---

### Table: interview_evaluations

Stores interview feedback and scoring.

```sql
CREATE TABLE interview_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID REFERENCES interview_schedules(id),
  applicant_id UUID REFERENCES applicants(id),
  interviewer_id UUID REFERENCES auth.users(id),
  technical_score INT, -- 1-10
  communication_score INT, -- 1-10
  cultural_fit_score INT, -- 1-10
  overall_score INT, -- 1-10
  recommendation TEXT, -- 'Hire', 'Reject', 'Maybe', 'Reconsider'
  feedback TEXT,
  evaluated_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);
```

---

### Table: interview_schedules

(Assumed from component usage)

```sql
CREATE TABLE interview_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES applicants(id),
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  interviewer_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'Scheduled', -- 'Scheduled', 'Completed', 'Cancelled'
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

### Table: job_offers

Stores job offer details and tracking.

```sql
CREATE TABLE job_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES applicants(id),
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  salary_offer DECIMAL(12, 2),
  start_date DATE,
  contract_type TEXT, -- 'Full-Time', 'Part-Time', 'Contract', 'Temporary'
  benefits TEXT[], -- Array of benefit codes
  status TEXT DEFAULT 'Offer Sent', -- 'Offer Sent', 'Offer Accepted', 'Offer Rejected', 'Withdrawn'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Important:** 
- Status must be either `'Offer Sent'` or `'Offer Accepted'` for hire button to work
- Used by `hire-applicant` Edge Function

---

### Table: job_postings

Active job positions in the system.

```sql
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  position TEXT NOT NULL, -- Job position (e.g., 'Staff Nurse')
  department TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  salary_range TEXT,
  status TEXT DEFAULT 'Open', -- 'Open', 'Closed', 'Filled'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## Module 2: Employee Management

### Table: employees

Stores hired employees and their information.

```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id),
  applicant_id UUID REFERENCES applicants(id),
  employee_id TEXT UNIQUE NOT NULL, -- Format: 'EMP-2026-0001'
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT,
  start_date DATE,
  status TEXT DEFAULT 'Active', -- 'Active', 'On Leave', 'Resigned', 'Terminated'
  onboarding_status TEXT DEFAULT 'Offer Accepted', 
  -- Status progression:
  -- 'Offer Accepted' → 'Documents Submitted' → 'Orientation Completed' → 'Employee Activated'
  employment_type TEXT, -- 'Full-Time', 'Part-Time', 'Contract'
  salary DECIMAL(12, 2),
  manager_id UUID REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Relationships:**
- `user_id` → auth.users (authentication account)
- `applicant_id` → applicants (hiring pipeline)
- `manager_id` → employees (self-referential)

**Critical Fields:**
- `employee_id` - Auto-generated during hire (EMP-YYYY-XXXX format)
- `onboarding_status` - Used to track progression and directory visibility
- `status` - Different from onboarding_status; tracks employment state

**Indexes:**
- `idx_employees_user_id` - For auth lookups
- `idx_employees_employee_id` - Employee ID searches
- `idx_employees_onboarding_status` - Onboarding page queries
- `idx_employees_department` - Department filtering

**RLS Policies:**
```sql
-- Anyone can view (read-only)
(auth.role() = 'authenticated')

-- Only employees can view their own record
(auth.uid() = user_id AND auth.role() = 'employee')

-- HR/Admin can read/write all
(has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin'))
```

---

### Table: onboarding_tasks

Stores the 6 tasks each new employee must complete.

```sql
CREATE TABLE onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL, -- e.g., "Submit Government IDs"
  task_category TEXT, -- 'documentation', 'administrative', 'training', 'system'
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  due_date DATE,
  completed_at TIMESTAMP,
  completed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Default Tasks Created (automatic via trigger):**
1. Submit Government IDs
2. Upload Medical License
3. Sign Employment Contract
4. Complete HR Orientation
5. Receive Employee ID Badge
6. Payroll Registration

**Automatic Trigger:**
```sql
-- When all 6 tasks are marked 'completed':
-- the trigger update_onboarding_status_on_task_completion() fires
-- and sets employees.onboarding_status = 'Employee Activated'
```

---

### Table: onboarding_documents

Stores uploaded documents during onboarding.

```sql
CREATE TABLE onboarding_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  task_id UUID REFERENCES onboarding_tasks(id),
  document_name TEXT NOT NULL,
  document_type TEXT, -- 'id', 'license', 'contract', 'other'
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size INT,
  uploaded_by UUID REFERENCES auth.users(id),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

**Storage Bucket:**
- Bucket: `onboarding-documents` (private)
- Path: `{employee_id}/{document_type}/{filename}`

---

### Table: orientations

Stores orientation/training sessions.

```sql
CREATE TABLE orientations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  orientation_date DATE,
  orientation_time TIME,
  location TEXT,
  trainer_name TEXT,
  trainer_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'Scheduled', -- 'Scheduled', 'Completed', 'Cancelled', 'Rescheduled'
  duration_hours DECIMAL(4, 2), -- e.g., 2.5 hours
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## Module 3: System Administration

### Table: user_roles

Manages role assignments for authorization.

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'admin', 'hr', 'manager', 'employee'
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, role) -- Prevent duplicate role assignments
);
```

**Roles:**
- `admin` - Full system access, user management
- `hr` - Recruitment, hiring, onboarding workflows
- `manager` - Team management, performance reviews
- `employee` - Profile, basic access

---

### Table: profiles

Extended user information (denormalized from auth.users).

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  department TEXT,
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## Triggers & Functions

### Trigger: create_default_onboarding_tasks

**Fires on:** INSERT into `employees` table

**Action:** Creates 6 default onboarding tasks

```sql
CREATE TRIGGER trg_create_onboarding_tasks
AFTER INSERT ON employees
FOR EACH ROW
EXECUTE FUNCTION create_default_onboarding_tasks();
```

**Function Logic:**
```
1. Get new employee_id
2. Insert 6 tasks with status = 'pending':
   - Submit Government IDs
   - Upload Medical License
   - Sign Employment Contract
   - Complete HR Orientation
   - Receive Employee ID Badge
   - Payroll Registration
3. Set due_date to 30 days from hire date
```

---

### Trigger: update_onboarding_status_on_task_completion

**Fires on:** UPDATE `onboarding_tasks` when status changes

**Action:** Auto-promote employee when all tasks completed

```sql
CREATE TRIGGER trg_update_onboarding_on_task_change
AFTER UPDATE ON onboarding_tasks
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_onboarding_status_on_task_completion();
```

**Function Logic:**
```
1. Get employee_id from updated task
2. Query: COUNT tasks where status != 'completed'
3. If count = 0 (all tasks done):
   a. UPDATE employees SET onboarding_status = 'Employee Activated'
   b. UPDATE employees SET status = 'Active'
4. Return updated employee
```

**Critical:** Only fires if status field actually changed (WHEN clause prevents loops)

---

### Function: get_onboarding_stage_info

**Purpose:** Get current onboarding progress for UI display

**Called from:** OnboardingProgress component

**Returns:**
```json
{
  "current_stage": "Documents Submitted",
  "stage_number": 2,
  "completed_tasks": 1,
  "total_tasks": 6,
  "completion_percentage": 16.67,
  "is_completed": false
}
```

---

### Function: complete_all_onboarding_tasks

**Purpose:** Manual override to complete all tasks at once

**Called from:** Admin panel (if needed)

**Parameters:**
- `employee_id` (UUID)
- `update_by_user_id` (UUID) - Who is completing

**Action:**
```
1. UPDATE all tasks for employee to 'completed'
2. Set completed_at = now()
3. Set completed_by = user_id
4. Trigger fires automatically
5. Employee auto-promoted to 'Employee Activated'
```

---

## Views & Queries

### Important Queries

#### Get employees ready for directory
```sql
SELECT * FROM employees
WHERE onboarding_status = 'Employee Activated'
ORDER BY start_date DESC;
```

#### Get employees in onboarding
```sql
SELECT * FROM employees
WHERE onboarding_status IN ('Offer Accepted', 'Documents Submitted', 'Orientation Completed')
ORDER BY updated_at DESC;
```

#### Get applicant to employee mapping
```sql
SELECT 
  a.id as applicant_id,
  a.full_name,
  e.id as employee_id,
  e.employee_id,
  a.status as application_status,
  e.onboarding_status,
  o.position,
  o.status as offer_status
FROM applicants a
LEFT JOIN job_offers o ON a.id = o.applicant_id
LEFT JOIN employees e ON a.id = e.applicant_id
WHERE a.status = 'Hired';
```

#### Check for incomplete onboarding
```sql
SELECT 
  e.id,
  e.full_name,
  COUNT(*) as pending_tasks
FROM employees e
LEFT JOIN onboarding_tasks ot ON e.id = ot.employee_id AND ot.status = 'pending'
WHERE e.onboarding_status != 'Employee Activated'
GROUP BY e.id, e.full_name
HAVING COUNT(*) > 0;
```

---

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- applicants table
CREATE POLICY "hr_can_manage_applicants" ON applicants
  USING (has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "applicants_view_own" ON applicants
  FOR SELECT
  USING (user_id = auth.uid());

-- employees table
CREATE POLICY "hr_can_manage_employees" ON employees
  USING (has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'hr') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "employees_can_view_all" ON employees
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "employees_view_own_record" ON employees
  FOR SELECT
  USING (user_id = auth.uid() AND auth.role() = 'employee');
```

### Function Permissions

```sql
-- Only HR/Admin can call hire-applicant function
GRANT EXECUTE ON FUNCTION create_default_onboarding_tasks TO "authenticated";
GRANT EXECUTE ON FUNCTION update_onboarding_status_on_task_completion TO "authenticated";
GRANT EXECUTE ON FUNCTION get_onboarding_stage_info TO "authenticated";
GRANT EXECUTE ON FUNCTION complete_all_onboarding_tasks TO "authenticated";
```

---

## Data Constraints

### Status Progression Rules

**Applicants:**
```
Applied → Under Screening → Shortlisted → Interview Scheduled 
  → Interview Completed → Selected → Offer Sent → Offer Accepted → Hired
```

**Employees (Onboarding):**
```
Offer Accepted → Documents Submitted → Orientation Completed → Employee Activated
```

**Job Offers:**
```
Offer Sent → Offer Accepted
           ↘ Offer Rejected
           ↘ Withdrawn
```

### Unique Constraints

- `applicants.email` - Each applicant has unique email
- `employees.user_id` - Each employee has one auth account
- `employees.employee_id` - Each employee has unique ID (EMP-2026-XXXX)
- `employees.email` - Each employee has unique email
- `user_roles(user_id, role)` - Can't assign same role twice

### Foreign Key Constraints

- `applicants.user_id` → `auth.users.id` (nullable)
- `employees.user_id` → `auth.users.id` (required, unique)
- `employees.applicant_id` → `applicants.id` (required)
- `job_offers.applicant_id` → `applicants.id` (required)
- `onboarding_tasks.employee_id` → `employees.id` (ON DELETE CASCADE)
- `onboarding_documents.employee_id` → `employees.id` (ON DELETE CASCADE)
- `orientations.employee_id` → `employees.id` (ON DELETE CASCADE)

---

## Indexes for Performance

```sql
-- Applicants
CREATE INDEX idx_applicants_status ON applicants(status);
CREATE INDEX idx_applicants_email ON applicants(email);
CREATE INDEX idx_applicants_department ON applicants(department);
CREATE INDEX idx_applicants_created_at ON applicants(created_at DESC);

-- Employees
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_onboarding_status ON employees(onboarding_status);
CREATE INDEX idx_employees_start_date ON employees(start_date DESC);

-- Onboarding Tasks
CREATE INDEX idx_onboarding_tasks_employee_id ON onboarding_tasks(employee_id);
CREATE INDEX idx_onboarding_tasks_status ON onboarding_tasks(status);
CREATE INDEX idx_onboarding_tasks_completed_at ON onboarding_tasks(completed_at);

-- Job Offers
CREATE INDEX idx_job_offers_applicant_id ON job_offers(applicant_id);
CREATE INDEX idx_job_offers_status ON job_offers(status);

-- User Roles
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

---

## Migration Files (In Order)

1. **20260308174548** - Initial schema
2. **20260308175735** - Applicant improvements
3. **20260310095308** - Employees table & RLS
4. **20260311142635** - Interview system
5. **20260312061354** - Job offers table
6. **20260314114634** - Onboarding (tasks, documents, orientations)
7. **20260321235843** - Onboarding auto-progression
8. **20260322_add_onboarding_auto_promotion** - **NEW** Auto-activation trigger

---

## Deployment Checklist

- [ ] All migrations applied in order
- [ ] RLS policies enabled on all tables
- [ ] Indexes created
- [ ] Triggers registered
- [ ] Functions compiled
- [ ] Permissions granted
- [ ] Auth rules configured
- [ ] Storage buckets created
- [ ] Environment variables set
- [ ] Edge Functions deployed

---

## Troubleshooting Notes

**Employee not appearing in directory:**
- Check: `onboarding_status = 'Employee Activated'`
- Check: `status = 'Active'`
- Check: No filters preventing display

**Auto-promotion not working:**
- Check: Trigger exists: `trg_update_onboarding_on_task_change`
- Check: All 6 tasks status = 'completed'
- Check: Try manual trigger: `SELECT complete_all_onboarding_tasks(emp_id, user_id);`

**Can't hire applicant:**
- Check: Job offer status = 'Offer Sent' OR 'Offer Accepted'
- Check: Applicant exists
- Check: Email not already registered in auth

**RLS blocking queries:**
- Check: User has correct role
- Check: Query satisfies policy conditions
- Check: Auth request includes proper JWT

---

**Last Updated:** 2026-03-22  
**Schema Version:** 8  
**Status:** ✅ COMPLETE
