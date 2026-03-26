import { Applicant } from '@/data/sampleData';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const statusColors: Record<string, string> = {
  'Applied': 'bg-pipeline-applied/15 text-pipeline-applied border-pipeline-applied/30',
  'Under Screening': 'bg-pipeline-screening/15 text-pipeline-screening border-pipeline-screening/30',
  'Shortlisted': 'bg-pipeline-interview/15 text-pipeline-interview border-pipeline-interview/30',
  'Interview Scheduled': 'bg-pipeline-interview/15 text-pipeline-interview border-pipeline-interview/30',
  'Interview Completed': 'bg-pipeline-selected/15 text-pipeline-selected border-pipeline-selected/30',
  'Selected': 'bg-pipeline-selected/15 text-pipeline-selected border-pipeline-selected/30',
  'Offer Sent': 'bg-pipeline-offer-sent/15 text-pipeline-offer-sent border-pipeline-offer-sent/30',
  'Offer Accepted': 'bg-pipeline-offer-accepted/15 text-pipeline-offer-accepted border-pipeline-offer-accepted/30',
  'Offer Declined': 'bg-pipeline-offer-declined/15 text-pipeline-offer-declined border-pipeline-offer-declined/30',
  'Hired': 'bg-pipeline-hired/15 text-pipeline-hired border-pipeline-hired/30',
  'Rejected': 'bg-pipeline-rejected/15 text-pipeline-rejected border-pipeline-rejected/30',
};

interface ApplicantCardProps {
  applicant: Applicant;
  index?: number;
}

export function ApplicantCard({ applicant, index = 0 }: ApplicantCardProps) {
  const initials = applicant.fullName.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="card-elevated p-4 hover:border-primary/30 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className="gradient-primary w-11 h-11 rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-foreground truncate">{applicant.fullName}</h4>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusColors[applicant.status]}`}>
              {applicant.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{applicant.positionApplied} · {applicant.department}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-black dark:text-white" />
              {applicant.experience}
            </span>
            {applicant.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                {applicant.rating}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
