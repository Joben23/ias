/**
 * HRMS Data Models & Types
 * Defines all data structures for HR1-HR4 modules
 */

// ============================================
// EMPLOYEE DATA (Base - Used across all modules)
// ============================================

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Resigned' | 'Terminated';
  salary: number;
  hired_date: string;
  profile_avatar?: string;
  manager_id?: string;
  bio?: string;
  skills?: string[];
}

// ============================================
// HR2 - TALENT DEVELOPMENT DATA
// ============================================

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Technical' | 'Soft Skills' | 'Management' | 'Compliance';
  instructor: string;
  duration_hours: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  created_at: string;
  thumbnail_url?: string;
}

export interface Enrollment {
  id: string;
  employee_id: string;
  course_id: string;
  enrolled_date: string;
  status: 'Active' | 'Completed' | 'Dropped';
  completion_percentage: number;
  completion_date?: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  trainer: string;
  schedule_dates: string[];
  max_participants: number;
  current_participants: number;
  status: 'Planned' | 'In Progress' | 'Completed';
}

export interface TrainingAssignment {
  id: string;
  employee_id: string;
  training_id: string;
  assigned_date: string;
  status: 'Assigned' | 'Started' | 'Completed' | 'Not Attended';
  completion_date?: string;
  attendance_rate?: number;
  score?: number;
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  category: 'Technical' | 'Soft Skills' | 'Leadership' | 'Communication';
}

export interface EmployeeCompetency {
  id: string;
  employee_id: string;
  competency_id: string;
  level: number; // 1-5 scale
  last_assessed: string;
  verified_by?: string;
}

export interface CompetencyQuiz {
  id: string;
  competency_id: string;
  title: string;
  questions: QuizQuestion[];
  passing_score: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correct_answer: number;
}

export interface SuccessionPosition {
  id: string;
  position_name: string;
  department: string;
  current_holder_id: string;
  required_competencies: string[];
  retirement_date?: string;
  planned_replacement_id?: string;
}

export interface SuccessionCandidate {
  id: string;
  employee_id: string;
  position_id: string;
  readiness: 'Ready Now' | 'Ready in 1-2 Years' | 'Needs Development';
  development_plan_id?: string;
  assigned_date: string;
}

export interface DevelopmentPlan {
  id: string;
  employee_id: string;
  target_position?: string;
  start_date: string;
  end_date: string;
  goals: string[];
  assigned_trainings: string[];
  status: 'Active' | 'Completed' | 'Suspended';
}

// ============================================
// HR3 - WORKFORCE OPERATIONS DATA
// ============================================

export interface Shift {
  id: string;
  name: string;
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  break_duration: number; // in minutes
  description?: string;
}

export interface ShiftAssignment {
  id: string;
  employee_id: string;
  shift_id: string;
  assigned_date: string;
  assigned_until?: string;
}

export interface Schedule {
  id: string;
  employee_id: string;
  date: string;
  shift_id: string;
  notes?: string;
}

export interface AttendanceLog {
  id: string;
  employee_id: string;
  date: string;
  time_in?: string; // HH:mm format
  time_out?: string; // HH:mm format
  status: 'Present' | 'Late' | 'Absent' | 'Leave';
  total_hours?: number;
  notes?: string;
}

export interface Timesheet {
  id: string;
  employee_id: string;
  week_start_date: string;
  week_end_date: string;
  daily_hours: {
    [key: string]: number; // date -> hours
  };
  total_hours: number;
  status: 'Draft' | 'Submitted' | 'Approved';
  approved_by?: string;
  approved_date?: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Unpaid';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approved_by?: string;
  approved_date?: string;
  total_days: number;
}

export interface Claim {
  id: string;
  employee_id: string;
  claim_type: 'Travel' | 'Meal' | 'Medical' | 'Other';
  amount: number;
  currency: string;
  description: string;
  receipt_url?: string;
  submitted_date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  approved_by?: string;
  approved_date?: string;
}

// ============================================
// HR4 - COMPENSATION & PAYROLL DATA
// ============================================

export interface EmployeeSalary {
  id: string;
  employee_id: string;
  base_salary: number;
  currency: string;
  pay_frequency: 'Monthly' | 'Bi-weekly' | 'Weekly';
  effective_from: string;
  effective_until?: string;
  status: 'Active' | 'Inactive';
}

export interface Allowance {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: 'Fixed' | 'Percentage';
}

export interface EmployeeAllowance {
  id: string;
  employee_id: string;
  allowance_id: string;
  amount: number;
  effective_from: string;
  effective_until?: string;
}

export interface Deduction {
  id: string;
  name: string;
  description: string;
  type: 'Tax' | 'Insurance' | 'Loan' | 'Other';
  default_amount?: number;
}

export interface EmployeeDeduction {
  id: string;
  employee_id: string;
  deduction_id: string;
  amount: number;
  effective_from: string;
  effective_until?: string;
}

export interface Payslip {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  allowances: {
    [key: string]: number; // allowance_id -> amount
  };
  deductions: {
    [key: string]: number; // deduction_id -> amount
  };
  total_earnings: number;
  total_deductions: number;
  net_pay: number;
  generated_date: string;
  paid_date?: string;
  status: 'Draft' | 'Generated' | 'Paid';
}

export interface SalaryAdjustment {
  id: string;
  employee_id: string;
  reason: 'Promotion' | 'Performance' | 'Market Adjustment' | 'Other';
  old_salary: number;
  new_salary: number;
  effective_date: string;
  approved_by: string;
  approved_date: string;
}

export interface BenefitPlan {
  id: string;
  name: string;
  description: string;
  type: 'Health Insurance' | 'Life Insurance' | 'Pension' | 'Other';
  employer_contribution_percent: number;
  employee_contribution_percent: number;
}

export interface EmployeeBenefit {
  id: string;
  employee_id: string;
  benefit_plan_id: string;
  enrollment_date: string;
  status: 'Active' | 'Terminated';
  monthly_cost: number;
}

// ============================================
// DATA FLOW & AGGREGATED TYPES
// ============================================

export interface EmployeeComplete extends Employee {
  // HR2 data
  enrollments?: Enrollment[];
  competencies?: EmployeeCompetency[];
  development_plan?: DevelopmentPlan;
  
  // HR3 data
  current_shift?: Shift;
  today_attendance?: AttendanceLog;
  leave_days_used?: number;
  
  // HR4 data
  salary_info?: EmployeeSalary;
  current_payslip?: Payslip;
}

export interface HRMSDataContext {
  // HR2
  courses: Course[];
  trainings: TrainingProgram[];
  competencies: Competency[];
  
  // HR3
  shifts: Shift[];
  schedules: Schedule[];
  attendance: AttendanceLog[];
  leave_requests: LeaveRequest[];
  
  // HR4
  payroll_data: Payslip[];
  salary_adjustments: SalaryAdjustment[];
  benefits: BenefitPlan[];
}
