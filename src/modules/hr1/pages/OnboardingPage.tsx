import { motion } from 'framer-motion';
import { UserPlus, FileText, BookOpen, ShieldCheck, CheckCircle2, Users } from 'lucide-react';
import { OnboardingEmployee, useOnboardingEmployees } from '@/hooks/useOnboarding';
import { OnboardingEmployeeCard } from '@/modules/hr1/components/OnboardingEmployeeCard';

export default function OnboardingPage() {
  const { data: employees = [], isLoading } = useOnboardingEmployees();

  const placeholderEmployees: OnboardingEmployee[] = [
    {
      id: 'placeholder-1',
      full_name: 'Jane Doe',
      position: 'Nurse Coordinator',
      department: 'Nursing',
      employee_id: 'EMP-001',
      start_date: new Date().toISOString(),
      employment_type: 'Full-time',
      onboarding_status: 'Documents Submitted',
      email: 'jane.doe@example.com',
    },
    {
      id: 'placeholder-2',
      full_name: 'John Smith',
      position: 'Lab Technician',
      department: 'Laboratory',
      employee_id: 'EMP-002',
      start_date: new Date().toISOString(),
      employment_type: 'Full-time',
      onboarding_status: 'Orientation Completed',
      email: 'john.smith@example.com',
    },
  ];

  const displayEmployees = employees.length >= 2 ? employees : [...employees, ...placeholderEmployees].slice(0, 2);

  const statusCounts = {
    offerAccepted: displayEmployees.filter(e => e.onboarding_status === 'Offer Accepted').length,
    documentsSubmitted: displayEmployees.filter(e => e.onboarding_status === 'Documents Submitted').length,
    orientationCompleted: displayEmployees.filter(e => e.onboarding_status === 'Orientation Completed').length,
    activated: displayEmployees.filter(e => e.onboarding_status === 'Employee Activated').length,
  };

  const flowSteps = [
    { label: 'Offer Accepted', count: statusCounts.offerAccepted, color: 'gradient-warm', icon: FileText },
    { label: 'Documents', count: statusCounts.documentsSubmitted, color: 'gradient-primary', icon: ShieldCheck },
    { label: 'Orientation', count: statusCounts.orientationCompleted, color: 'gradient-cool', icon: BookOpen },
    { label: 'Activated', count: statusCounts.activated, color: 'gradient-success', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">New Hire Onboarding</h1>
        <p className="text-muted-foreground text-sm mt-1">Transition hired candidates into fully onboarded hospital employees</p>
      </div>

      {/* Onboarding flow summary */}
      <div className="card-elevated p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Onboarding Pipeline</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {flowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-2 shrink-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`${step.color} px-5 py-3 rounded-xl text-primary-foreground text-center min-w-[130px]`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1 opacity-80" />
                  <p className="text-xl font-display font-bold">{step.count}</p>
                  <p className="text-xs opacity-90">{step.label}</p>
                </motion.div>
                {i < flowSteps.length - 1 && <div className="w-6 h-0.5 bg-border shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Employee cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-semibold text-foreground">
            Employees in Onboarding ({employees.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="card-elevated p-8 text-center text-muted-foreground">Loading onboarding data...</div>
        ) : employees.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <UserPlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No employees currently in onboarding</p>
            <p className="text-xs text-muted-foreground mt-1">Hired applicants will appear here automatically</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {displayEmployees.map((emp, i) => (
              <OnboardingEmployeeCard key={emp.id} employee={emp} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
