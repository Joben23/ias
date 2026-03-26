import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Stage {
  id: number;
  label: string;
  days: number;
  status: 'completed' | 'in-progress' | 'pending';
  completedDate?: string;
}

interface ProcessTimelineProps {
  stages: Stage[];
}

export function ProcessTimeline({ stages }: ProcessTimelineProps) {
  return (
    <div className="card-elevated p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground mb-4">Probation Process Flow</h3>
      <p className="text-sm text-muted-foreground mb-4">Review and confirm probation status for each stage</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1;
          const statusIcon = stage.status === 'completed' ? (
            <CheckCircle2 className="w-6 h-6 text-pipeline-hired" />
          ) : stage.status === 'in-progress' ? (
            <Clock className="w-6 h-6 text-pipeline-screening animate-pulse" />
          ) : (
            <AlertCircle className="w-6 h-6 text-muted-foreground" />
          );

          const [bgColor, borderColor, textColor] = stage.status === 'completed'
            ? ['gradient-warm', 'border-transparent', 'text-primary-foreground']
            : stage.status === 'in-progress'
            ? ['gradient-cool', 'border-transparent', 'text-primary-foreground']
            : ['gradient-primary', 'border-transparent', 'text-primary-foreground'];

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative p-4 rounded-lg border ${bgColor} ${borderColor} text-primary-foreground`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {statusIcon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${textColor}`}>{stage.label}</h4>
                  <p className="text-xs text-primary-foreground/80 mt-1">{stage.days} days</p>
                  {stage.completedDate && (
                    <p className="text-xs font-medium mt-1">✓ {stage.completedDate}</p>
                  )}
                </div>
              </div>

              {!isLast && (
                <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-0.5 bg-border mx-1" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
