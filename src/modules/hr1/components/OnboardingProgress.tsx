import { NewHire } from '@/data/sampleData';
import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';

const onboardingSteps = ['Offer Sent', 'Offer Accepted', 'Documents Submitted', 'Orientation', 'Employee Activated'] as const;

interface OnboardingProgressProps {
  hire: NewHire;
  index?: number;
}

export function OnboardingProgress({ hire, index = 0 }: OnboardingProgressProps) {
  const currentIdx = onboardingSteps.indexOf(hire.onboardingStep);
  const initials = hire.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const progress = ((hire.completedTasks / hire.totalTasks) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="card-elevated p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="gradient-primary w-11 h-11 rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
          {initials}
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{hire.name}</h4>
          <p className="text-sm text-muted-foreground">{hire.position} · {hire.department}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm font-semibold text-foreground">{hire.completedTasks}/{hire.totalTasks}</p>
          <p className="text-xs text-muted-foreground">tasks done</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
          className="h-full gradient-primary rounded-full"
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {onboardingSteps.map((step, i) => {
          const isCompleted = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                )}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted ? 'bg-primary' : isCurrent ? 'bg-primary/20 border-2 border-primary' : 'bg-muted border border-border'
                }`}>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  ) : isCurrent ? (
                    <Circle className="w-2.5 h-2.5 fill-primary text-primary" />
                  ) : null}
                </div>
                {i < onboardingSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
              <span className={`text-[10px] mt-1.5 text-center leading-tight ${isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                {step.replace('Employee ', '')}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
