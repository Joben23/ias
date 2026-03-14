import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Stethoscope, FileText, Shield, BadgeCheck, Search } from 'lucide-react';
import { useOnboardingTasks, useToggleTask } from '@/hooks/useOnboarding';

const categoryIcons: Record<string, typeof FileText> = {
  medical: Stethoscope,
  document: FileText,
  license: BadgeCheck,
  verification: Search,
};

interface Props {
  employeeId: string;
}

export function OnboardingChecklist({ employeeId }: Props) {
  const { data: tasks = [], isLoading } = useOnboardingTasks(employeeId);
  const toggleTask = useToggleTask();

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading checklist...</div>;

  return (
    <div>
      <h4 className="font-display font-semibold text-foreground text-sm mb-3">Pre-Employment Requirements</h4>
      <div className="space-y-2">
        {tasks.map((task, i) => {
          const Icon = categoryIcons[task.task_category] || FileText;
          const done = task.status === 'completed';
          return (
            <motion.button
              key={task.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggleTask.mutate({ taskId: task.id, currentStatus: task.status })}
              className={`flex items-center gap-3 p-3 rounded-xl w-full text-left transition-colors ${
                done ? 'bg-pipeline-hired/5' : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                done ? 'bg-pipeline-hired/15' : 'bg-muted'
              }`}>
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-pipeline-hired" />
                ) : (
                  <Icon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <span className={`text-sm flex-1 ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {task.task_name}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                done ? 'bg-pipeline-hired/10 text-pipeline-hired' : 'bg-muted text-muted-foreground'
              }`}>
                {done ? 'Complete' : 'Pending'}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
