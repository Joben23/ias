import { newHires } from '@/data/sampleData';
import { OnboardingProgress } from '@/components/hr/OnboardingProgress';
import { motion } from 'framer-motion';
import { UserPlus, FileText, Stethoscope, BookOpen, CreditCard, CheckCircle2 } from 'lucide-react';

const onboardingChecklist = [
  { task: 'Submit Medical Examination Results', icon: Stethoscope, status: 'done' },
  { task: 'Submit Government IDs', icon: FileText, status: 'done' },
  { task: 'Sign Employment Contract', icon: FileText, status: 'in-progress' },
  { task: 'Complete Hospital Orientation', icon: BookOpen, status: 'pending' },
  { task: 'Setup Payroll Enrollment', icon: CreditCard, status: 'pending' },
  { task: 'Receive ID Badge', icon: UserPlus, status: 'pending' },
];

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">New Hire Onboarding</h1>
        <p className="text-muted-foreground text-sm mt-1">Transition candidates into official hospital employees</p>
      </div>

      {/* Onboarding flow visual */}
      <div className="card-elevated p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Onboarding Flow</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { label: 'Offer Sent', color: 'gradient-cool', count: 0 },
            { label: 'Offer Accepted', color: 'gradient-warm', count: 1 },
            { label: 'Documents', color: 'gradient-primary', count: 1 },
            { label: 'Orientation', color: 'gradient-warm', count: 1 },
            { label: 'Activated', color: 'gradient-success', count: 0 },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 shrink-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`${step.color} px-5 py-3 rounded-xl text-primary-foreground text-center min-w-[120px]`}
              >
                <p className="text-xl font-display font-bold">{step.count}</p>
                <p className="text-xs opacity-90">{step.label}</p>
              </motion.div>
              {i < 4 && <div className="w-6 h-0.5 bg-border shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* New Hires */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Current New Hires</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          {newHires.map((hire, i) => (
            <OnboardingProgress key={hire.id} hire={hire} index={i} />
          ))}
        </div>
      </div>

      {/* Checklist Example */}
      <div className="card-elevated p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Onboarding Checklist — Mama Coco</h3>
        <div className="space-y-3">
          {onboardingChecklist.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.task}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  item.status === 'done' ? 'bg-pipeline-hired/5' : item.status === 'in-progress' ? 'bg-pipeline-screening/5' : 'bg-muted/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.status === 'done' ? 'bg-pipeline-hired/15' : item.status === 'in-progress' ? 'bg-pipeline-screening/15' : 'bg-muted'
                }`}>
                  {item.status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4 text-pipeline-hired" />
                  ) : (
                    <Icon className={`w-4 h-4 ${item.status === 'in-progress' ? 'text-pipeline-screening' : 'text-muted-foreground'}`} />
                  )}
                </div>
                <span className={`text-sm flex-1 ${item.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {item.task}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  item.status === 'done' ? 'bg-pipeline-hired/10 text-pipeline-hired' :
                  item.status === 'in-progress' ? 'bg-pipeline-screening/10 text-pipeline-screening animate-pulse-soft' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {item.status === 'done' ? 'Complete' : item.status === 'in-progress' ? 'In Progress' : 'Pending'}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
