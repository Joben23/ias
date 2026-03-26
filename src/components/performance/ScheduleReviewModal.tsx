import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock } from 'lucide-react';

interface ScheduleReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  onSchedule: (data: ScheduleData) => void;
}

export interface ScheduleData {
  reviewType: string;
  scheduledDate: string;
  reviewer: string;
}

export function ScheduleReviewModal({
  open,
  onOpenChange,
  employeeName,
  onSchedule,
}: ScheduleReviewModalProps) {
  const [reviewType, setReviewType] = useState('30-Day Review');
  const [scheduledDate, setScheduledDate] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSchedule = () => {
    if (!scheduledDate || !reviewer) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onSchedule({ reviewType, scheduledDate, reviewer });
      setLoading(false);
      onOpenChange(false);
    }, 500);
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Performance Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Scheduling review for</p>
            <p className="font-semibold text-foreground">{employeeName}</p>
          </div>

          {/* Review Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Review Type</Label>
            <select
              value={reviewType}
              onChange={(e) => setReviewType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option>30-Day Review</option>
              <option>60-Day Review</option>
              <option>90-Day Review</option>
            </select>
          </div>

          {/* Scheduled Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Scheduled Date *
            </Label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={getMinDate()}
              className="text-sm"
            />
          </div>

          {/* Reviewer */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Assigned Reviewer *</Label>
            <input
              type="text"
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              placeholder="Name of the reviewer"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
            <p className="text-xs text-blue-900 dark:text-blue-200">
              📧 Automated reminder email will be sent to the reviewer
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              className="flex-1 gradient-primary text-primary-foreground"
              disabled={loading}
            >
              {loading ? 'Scheduling...' : 'Schedule Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
