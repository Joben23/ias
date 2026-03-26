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
    <div className="card-elevated p-6">
      <h3 className="font-display font-semibold text-foreground mb-6">Probation Process Flow</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1;
          const statusIcon = stage.status === 'completed' ? (
            <CheckCircle2 className="w-6 h-6 text-pipeline-hired" />
          ) : stage.status === 'in-progress' ? (
            <Clock className="w-6 h-6 text-pipeline-screening animate-pulse" />
          ) : (
            <AlertCircle className="w-6 h-6 text-muted-foreground" />
          );

          const bgColor = stage.status === 'completed' ? 'bg-pipeline-hired/10' :
            stage.status === 'in-progress' ? 'bg-pipeline-screening/10' : 'bg-muted';

          const borderColor = stage.status === 'completed' ? 'border-pipeline-hired' :
            stage.status === 'in-progress' ? 'border-pipeline-screening' : 'border-border';

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative p-4 rounded-lg border ${bgColor} ${borderColor}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {statusIcon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground">{stage.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{stage.days} days</p>
                  {stage.completedDate && (
                    <p className="text-xs text-pipeline-hired font-medium mt-1">✓ {stage.completedDate}</p>
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
