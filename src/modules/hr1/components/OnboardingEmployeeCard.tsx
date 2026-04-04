import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Building2, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { OnboardingEmployee, useOnboardingTasks } from '@/hooks/useOnboarding';
import { OnboardingChecklist } from '@/modules/hr1/components/OnboardingChecklist';
import { OnboardingDocumentUpload } from '@/modules/hr1/components/OnboardingDocumentUpload';
import { OrientationSection } from '@/modules/hr1/components/OrientationSection';

const statusSteps = ['Offer Accepted', 'Documents Submitted', 'Orientation Completed', 'Employee Activated'] as const;

interface Props {
  employee: OnboardingEmployee;
  index: number;
}

export function OnboardingEmployeeCard({ employee, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { data: tasks = [] } = useOnboardingTasks(employee.id);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length || 1;
  const progress = Math.round((completedCount / totalCount) * 100);
  const initials = employee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const currentStepIdx = statusSteps.indexOf(employee.onboarding_status as any);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="card-elevated overflow-hidden"
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="gradient-primary w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-foreground truncate">{employee.full_name}</h4>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{employee.position}</span>
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{employee.department}</span>
            </div>
            {employee.start_date && (
              <p className="text-xs text-muted-foreground mt-1">
                Start Date: {new Date(employee.start_date).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-display font-bold text-primary">{progress}%</p>
            <p className="text-[11px] text-muted-foreground">{completedCount}/{totalCount} tasks</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.3 + index * 0.08, duration: 0.6 }}
            className="h-full gradient-primary rounded-full"
          />
        </div>

        {/* Status steps */}
        <div className="flex items-center justify-between mb-3">
          {statusSteps.map((step, i) => {
            const isCompleted = i < currentStepIdx;
            const isCurrent = i === currentStepIdx;
            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {i > 0 && <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    isCompleted ? 'bg-primary text-primary-foreground' : isCurrent ? 'bg-primary/20 border-2 border-primary text-primary' : 'bg-muted border border-border text-muted-foreground'
                  }`}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  {i < statusSteps.length - 1 && <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />}
                </div>
                <span className={`text-[9px] mt-1 text-center leading-tight ${isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {step.replace('Employee ', '')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline w-full justify-center mt-2"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Collapse Details' : 'View Onboarding Details'}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-border"
        >
          <div className="p-5 space-y-6">
            <OnboardingChecklist employeeId={employee.id} />
            <OnboardingDocumentUpload employeeId={employee.id} />
            <OrientationSection employeeId={employee.id} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
