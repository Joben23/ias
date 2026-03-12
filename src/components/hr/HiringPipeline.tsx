import { motion } from 'framer-motion';
import { pipelineStats } from '@/data/sampleData';

const stages = [
  { key: 'applied', label: 'Applied', color: 'bg-pipeline-applied' },
  { key: 'screening', label: 'Screening', color: 'bg-pipeline-screening' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'bg-pipeline-interview' },
  { key: 'interview', label: 'Interview', color: 'bg-pipeline-interview' },
  { key: 'selected', label: 'Selected', color: 'bg-pipeline-selected' },
  { key: 'offerSent', label: 'Offer Sent', color: 'bg-pipeline-offer-sent' },
  { key: 'offerAccepted', label: 'Accepted', color: 'bg-pipeline-offer-accepted' },
  { key: 'hired', label: 'Hired', color: 'bg-pipeline-hired' },
] as const;

export function HiringPipeline() {
  const total = Object.values(pipelineStats).reduce((a, b) => a + b, 0) - pipelineStats.rejected;

  return (
    <div className="card-elevated p-6">
      <h3 className="text-lg font-display font-semibold text-foreground mb-6">Hiring Pipeline</h3>
      <div className="flex items-center gap-1.5 mb-6">
        {stages.map((stage, i) => {
          const count = pipelineStats[stage.key as keyof typeof pipelineStats];
          const width = total > 0 ? Math.max((count / total) * 100, 6) : 12;
          return (
            <motion.div
              key={stage.key}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`${stage.color} h-3 rounded-full origin-left`}
              style={{ width: `${width}%` }}
              title={`${stage.label}: ${count}`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {stages.map((stage, i) => {
          const count = pipelineStats[stage.key as keyof typeof pipelineStats];
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className={`inline-flex w-3 h-3 rounded-full ${stage.color} mb-1.5`} />
              <p className="text-2xl font-display font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground">{stage.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
