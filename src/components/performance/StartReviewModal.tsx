import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

interface StartReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  employeePosition: string;
  reviewType: string;
  onSubmit: (data: ReviewData) => void;
}

export interface ReviewData {
  workPerformance: number;
  skillsAssessment: number;
  behaviorScore: number;
  comments: string;
  reviewerName: string;
}

export function StartReviewModal({
  open,
  onOpenChange,
  employeeName,
  employeePosition,
  reviewType,
  onSubmit,
}: StartReviewModalProps) {
  const [workPerformance, setWorkPerformance] = useState(75);
  const [skillsAssessment, setSkillsAssessment] = useState(75);
  const [behaviorScore, setBehaviorScore] = useState(75);
  const [comments, setComments] = useState('');
  const [reviewerName, setReviewerName] = useState('Current User');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!comments.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please add review comments',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onSubmit({
        workPerformance,
        skillsAssessment,
        behaviorScore,
        comments,
        reviewerName,
      });
      setLoading(false);
      onOpenChange(false);
      // Reset form
      setWorkPerformance(75);
      setSkillsAssessment(75);
      setBehaviorScore(75);
      setComments('');
    }, 500);
  };

  const handleSaveDraft = () => {
    toast({
      title: 'Draft Saved',
      description: 'Review draft has been saved. You can continue later.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Performance Review - {reviewType}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <div className="bg-muted p-4 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Employee</p>
              <p className="font-semibold text-foreground">{employeeName}</p>
              <p className="text-sm text-muted-foreground">{employeePosition}</p>
            </div>
          </div>

          {/* Work Performance Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Work Performance Score</Label>
              <span className="text-lg font-bold text-primary">{workPerformance}/100</span>
            </div>
            <Slider
              value={[workPerformance]}
              onValueChange={(val) => setWorkPerformance(val[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">How well does the employee perform their core job responsibilities?</p>
          </div>

          {/* Skills Assessment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Skills Assessment Score</Label>
              <span className="text-lg font-bold text-primary">{skillsAssessment}/100</span>
            </div>
            <Slider
              value={[skillsAssessment]}
              onValueChange={(val) => setSkillsAssessment(val[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Assessment of technical and professional skills</p>
          </div>

          {/* Behavior Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Behavior & Attitude Score</Label>
              <span className="text-lg font-bold text-primary">{behaviorScore}/100</span>
            </div>
            <Slider
              value={[behaviorScore]}
              onValueChange={(val) => setBehaviorScore(val[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Professionalism, teamwork, and attitude</p>
          </div>

          {/* Reviewer Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Reviewer Name</Label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder="Your name"
            />
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Review Comments *</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide detailed feedback and comments..."
              rows={4}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">{comments.length} characters</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="flex-1"
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 gradient-primary text-primary-foreground"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
