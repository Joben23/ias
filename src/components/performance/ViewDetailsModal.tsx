import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Eye } from 'lucide-react';

interface ReviewData {
  id: string;
  employeeName: string;
  reviewDate: string;
  reviewerName: string;
  reviewType: string;
  workPerformance: number;
  skillsAssessment: number;
  behaviorAttitude: number;
  comments: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface ViewDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ReviewData | null;
  onDownload?: (reviewId: string) => void;
  onPrint?: (reviewId: string) => void;
}

export function ViewDetailsModal({
  open,
  onOpenChange,
  review,
  onDownload,
  onPrint,
}: ViewDetailsModalProps) {
  if (!review) return null;

  const averageScore = Math.round((review.workPerformance + review.skillsAssessment + review.behaviorAttitude) / 3);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-pipeline-hired';
    if (score >= 60) return 'text-pipeline-selected';
    return 'text-pipeline-rejected';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-pipeline-hired/10';
    if (score >= 60) return 'bg-pipeline-selected/10';
    return 'bg-pipeline-rejected/10';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Performance Review Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">EMPLOYEE</p>
              <p className="text-sm font-semibold">{review.employeeName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">REVIEW TYPE</p>
              <p className="text-sm font-semibold">{review.reviewType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">REVIEWER</p>
              <p className="text-sm font-semibold">{review.reviewerName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">DATE</p>
              <p className="text-sm font-semibold">{review.reviewDate}</p>
            </div>
          </div>

          {/* Average Score Card */}
          <div className={`${getScoreBg(averageScore)} border border-border rounded-lg p-6 text-center`}>
            <p className="text-xs text-muted-foreground font-medium mb-2">OVERALL SCORE</p>
            <p className={`text-4xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</p>
            <p className="text-xs text-muted-foreground mt-2">
              {averageScore >= 80 ? 'Excellent' : averageScore >= 60 ? 'Good' : 'Needs Improvement'}
            </p>
          </div>

          {/* Individual Scores */}
          <div className="space-y-3">
            <p className="font-semibold text-sm">Performance Scores</p>
            
            <ScoreBar 
              label="Work Performance" 
              score={review.workPerformance}
              color="bg-gradient-primary"
            />
            <ScoreBar 
              label="Skills Assessment" 
              score={review.skillsAssessment}
              color="bg-gradient-warm"
            />
            <ScoreBar 
              label="Behavior & Attitude" 
              score={review.behaviorAttitude}
              color="bg-gradient-cool"
            />
          </div>

          {/* Comments Section */}
          <div className="space-y-2">
            <p className="font-semibold text-sm">Review Comments</p>
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">{review.comments}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onPrint?.(review.id)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Print
            </Button>
            <Button
              onClick={() => onDownload?.(review.id)}
              className="flex-1 flex items-center justify-center gap-2 gradient-primary text-primary-foreground"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ====== HELPER COMPONENT: SCORE BAR ======
interface ScoreBarProps {
  label: string;
  score: number;
  color?: string;
}

function ScoreBar({ label, score, color = 'bg-primary' }: ScoreBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-muted-foreground min-w-[140px]">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-semibold min-w-[40px] text-right">{score}%</span>
    </div>
  );
}
