import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';

export type ReviewStatus = 'in-progress' | 'pending' | 'completed' | 'overdue';

interface EmployeeCardProps {
  id: string;
  name: string;
  position: string;
  department: string;
  avatarUrl?: string;
  reviewStatus: ReviewStatus;
  currentScore?: number;
  nextReviewDate?: string;
  daysUntilReview?: number;
  onStartReview?: () => void;
  onScheduleReview?: () => void;
  onViewDetails?: () => void;
  onExtendProbation?: () => void;
  onConfirmPermanent?: () => void;
  onTerminate?: () => void;
  probationEndDate?: string;
  stageName?: string;
}

export function EmployeeCard({
  id,
  name,
  position,
  department,
  avatarUrl,
  reviewStatus,
  currentScore,
  nextReviewDate,
  daysUntilReview,
  onStartReview,
  onScheduleReview,
  onViewDetails,
  onExtendProbation,
  onConfirmPermanent,
  onTerminate,
  probationEndDate,
  stageName,
}: EmployeeCardProps) {
  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-pipeline-hired/10 border-pipeline-hired/20 text-pipeline-hired';
      case 'in-progress':
        return 'bg-pipeline-screening/10 border-pipeline-screening/20 text-pipeline-screening';
      case 'pending':
        return 'bg-pipeline-selected/10 border-pipeline-selected/20 text-pipeline-selected';
      case 'overdue':
        return 'bg-pipeline-rejected/10 border-pipeline-rejected/20 text-pipeline-rejected';
    }
  };

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 animate-pulse" />;
      case 'pending':
        return <Calendar className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: ReviewStatus) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
    }
  };

  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors bg-card hover:bg-card/80"
    >
      {/* Header with Avatar and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm line-clamp-1">{name}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{position}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`flex-shrink-0 whitespace-nowrap gap-1.5 ${getStatusColor(reviewStatus)}`}
        >
          {getStatusIcon(reviewStatus)}
          {getStatusLabel(reviewStatus)}
        </Badge>
      </div>

      {/* Department and Stage */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="text-muted-foreground">{department}</span>
        {stageName && <span className="text-muted-foreground font-medium">{stageName}</span>}
      </div>

      {/* Score and Progress (if completed or in-progress) */}
      {currentScore !== undefined && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Overall Score</span>
            <span className="text-sm font-bold">{currentScore}%</span>
          </div>
          <Progress value={currentScore} className="h-2" />
        </div>
      )}

      {/* Review Date Info */}
      {nextReviewDate && (
        <div
          className={`mb-4 p-3 rounded-lg text-xs space-y-1 ${
            reviewStatus === 'overdue'
              ? 'bg-pipeline-rejected/10 border border-pipeline-rejected/20'
              : 'bg-muted/50'
          }`}
        >
          {probationEndDate && (
            <p className="text-muted-foreground">
              Probation ends: <span className="font-medium">{probationEndDate}</span>
            </p>
          )}
          {reviewStatus !== 'completed' && (
            <p className={reviewStatus === 'overdue' ? 'text-pipeline-rejected font-medium' : 'text-muted-foreground'}>
              Next review: <span className="font-medium">{nextReviewDate}</span>
              {daysUntilReview !== undefined && (
                <span className="ml-1">
                  ({daysUntilReview === 0 ? 'today' : `in ${daysUntilReview} days`})
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons - Dynamic based on status */}
      <div className="space-y-2">
        {reviewStatus === 'in-progress' && onStartReview && (
          <Button
            onClick={onStartReview}
            className="w-full gradient-primary text-primary-foreground text-sm h-9"
          >
            Start Review
          </Button>
        )}

        {reviewStatus === 'pending' && onScheduleReview && (
          <Button
            onClick={onScheduleReview}
            className="w-full gradient-primary text-primary-foreground text-sm h-9"
          >
            Schedule Review
          </Button>
        )}

        {reviewStatus === 'completed' && onViewDetails && (
          <Button
            onClick={onViewDetails}
            variant="outline"
            className="w-full text-sm h-9"
          >
            View Details
          </Button>
        )}

        {reviewStatus === 'overdue' && onStartReview && (
          <Button
            onClick={onStartReview}
            className="w-full bg-pipeline-rejected hover:bg-pipeline-rejected/90 text-white text-sm h-9"
          >
            Start Review (Overdue)
          </Button>
        )}

        {/* Employment Decision Buttons (shown for all statuses) */}
        {stageName === '90-Day Review' && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            {onConfirmPermanent && (
              <Button
                onClick={onConfirmPermanent}
                size="sm"
                variant="outline"
                className="text-pipeline-hired border-pipeline-hired/50 hover:bg-pipeline-hired/10 text-xs"
              >
                Confirm
              </Button>
            )}
            {onExtendProbation && (
              <Button
                onClick={onExtendProbation}
                size="sm"
                variant="outline"
                className="text-pipeline-screening border-pipeline-screening/50 hover:bg-pipeline-screening/10 text-xs"
              >
                Extend
              </Button>
            )}
            {onTerminate && (
              <Button
                onClick={onTerminate}
                size="sm"
                variant="outline"
                className="col-span-2 text-pipeline-rejected border-pipeline-rejected/50 hover:bg-pipeline-rejected/10 text-xs"
              >
                Terminate
              </Button>
            )}
          </div>
        )}

        {/* Extend/Terminate for other stages */}
        {stageName !== '90-Day Review' && (stageName === '30-Day Review' || stageName === '60-Day Review') && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            {onExtendProbation && (
              <Button
                onClick={onExtendProbation}
                size="sm"
                variant="outline"
                className="text-pipeline-screening border-pipeline-screening/50 hover:bg-pipeline-screening/10 text-xs"
              >
                Extend
              </Button>
            )}
            {onTerminate && (
              <Button
                onClick={onTerminate}
                size="sm"
                variant="outline"
                className="text-pipeline-rejected border-pipeline-rejected/50 hover:bg-pipeline-rejected/10 text-xs"
              >
                Terminate
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
