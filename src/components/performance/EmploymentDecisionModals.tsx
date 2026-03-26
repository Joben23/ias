import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

// ====== CONFIRM PERMANENT POSITION ======
interface ConfirmPermanentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  onConfirm: (data: ConfirmData) => void;
}

export interface ConfirmData {
  effectiveDate: string;
  managerApproval: boolean;
}

export function ConfirmPermanentModal({
  open,
  onOpenChange,
  employeeName,
  onConfirm,
}: ConfirmPermanentModalProps) {
  const [effectiveDate, setEffectiveDate] = useState('');
  const [managerApproval, setManagerApproval] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (!effectiveDate || !managerApproval) {
      toast({
        title: 'Required',
        description: 'Please fill all fields and confirm manager approval',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onConfirm({ effectiveDate, managerApproval });
      setLoading(false);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-pipeline-hired" />
            Confirm Permanent Position
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-pipeline-hired/10 border border-pipeline-hired/20 p-4 rounded-lg">
            <p className="text-sm text-foreground">
              Are you sure you want to confirm <strong>{employeeName}</strong> for a permanent position?
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Effective Date</Label>
            <Input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="manager-approval"
              checked={managerApproval}
              onChange={(e) => setManagerApproval(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="manager-approval" className="text-sm text-muted-foreground cursor-pointer">
              I confirm this confirmation is approved by the manager
            </label>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-pipeline-hired hover:bg-pipeline-hired/90 text-white"
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Permanent'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ====== EXTEND PROBATION ======
interface ExtendProbationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  onExtend: (data: ExtendData) => void;
}

export interface ExtendData {
  extensionDuration: number;
  reason: string;
  newReviewDate: string;
}

export function ExtendProbationModal({
  open,
  onOpenChange,
  employeeName,
  onExtend,
}: ExtendProbationModalProps) {
  const [extensionDuration, setExtensionDuration] = useState(30);
  const [reason, setReason] = useState('');
  const [newReviewDate, setNewReviewDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExtend = () => {
    if (!reason.trim() || !newReviewDate) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide reason and new review date',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onExtend({ extensionDuration, reason, newReviewDate });
      setLoading(false);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-pipeline-screening" />
            Extend Probation Period
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-pipeline-screening/10 border border-pipeline-screening/20 p-4 rounded-lg">
            <p className="text-sm text-foreground">
              Extending probation period for <strong>{employeeName}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Extension Duration (Days)</Label>
            <select
              value={extensionDuration}
              onChange={(e) => setExtensionDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Reason for Extension *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the probation period is being extended..."
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">New Review Date *</Label>
            <Input
              type="date"
              value={newReviewDate}
              onChange={(e) => setNewReviewDate(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleExtend}
              className="flex-1 gradient-primary text-primary-foreground"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Extension Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ====== TERMINATE EMPLOYMENT ======
interface TerminateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  onTerminate: (data: TerminateData) => void;
}

export interface TerminateData {
  reason: string;
  notes: string;
  confirmed: boolean;
}

export function TerminateModal({
  open,
  onOpenChange,
  employeeName,
  onTerminate,
}: TerminateModalProps) {
  const [reason, setReason] = useState('Performance');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTerminate = () => {
    if (!confirmed || !notes.trim()) {
      toast({
        title: 'Required',
        description: 'Please confirm and provide detailed notes',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onTerminate({ reason, notes, confirmed });
      setLoading(false);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-pipeline-rejected" />
            Initiate Termination
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
              ⚠️ Warning: This action cannot be undone
            </p>
            <p className="text-sm text-red-800 dark:text-red-300">
              You're about to terminate employment for <strong>{employeeName}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Termination Reason</Label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option>Performance</option>
              <option>Attendance</option>
              <option>Misconduct</option>
              <option>Resignation</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Detailed Notes *</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide detailed reasons and documentation..."
              rows={4}
              className="text-sm"
            />
          </div>

          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
            <input
              type="checkbox"
              id="termination-confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 mt-1 flex-shrink-0"
            />
            <label htmlFor="termination-confirm" className="text-sm text-red-900 dark:text-red-200 cursor-pointer">
              I confirm this termination is approved and documented properly
            </label>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleTerminate}
              className="flex-1 bg-pipeline-rejected hover:bg-pipeline-rejected/90 text-white"
              disabled={loading || !confirmed}
            >
              {loading ? 'Processing...' : 'Confirm Termination'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
