import { CheckCircle2, Circle } from 'lucide-react';

const pipelineStages = [
  'Applied',
  'Under Screening',
  'Shortlisted',
  'Interview Scheduled',
  'Interview Completed',
  'Selected',
  'Offer Sent',
  'Offer Accepted',
  'Hired',
];

interface Props {
  currentStatus: string;
}

export function RecruitmentTimeline({ currentStatus }: Props) {
  const currentIdx = pipelineStages.indexOf(currentStatus);
  const isRejected = currentStatus === 'Rejected';
  const isDeclined = currentStatus === 'Offer Declined';

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Recruitment Journey</p>
      <div className="space-y-0">
        {pipelineStages.map((stage, i) => {
          const completed = i <= currentIdx && !isRejected && !isDeclined;
          const isCurrent = stage === currentStatus;

          return (
            <div key={stage} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                {completed ? (
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-primary' : 'text-primary/60'}`} />
                ) : (
                  <Circle className="w-4 h-4 shrink-0 text-muted-foreground/30" />
                )}
                {i < pipelineStages.length - 1 && (
                  <div className={`w-0.5 h-5 ${completed && i < currentIdx ? 'bg-primary/40' : 'bg-muted-foreground/15'}`} />
                )}
              </div>
              <span className={`text-xs leading-4 ${completed ? (isCurrent ? 'text-foreground font-semibold' : 'text-foreground/70') : 'text-muted-foreground/50'}`}>
                {stage}
              </span>
            </div>
          );
        })}
        {(isRejected || isDeclined) && (
          <div className="flex items-start gap-3 mt-1">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-destructive" />
            <span className="text-xs leading-4 text-destructive font-semibold">{currentStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
}
