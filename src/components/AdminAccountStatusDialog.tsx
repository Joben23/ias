import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, UserCog } from 'lucide-react';

interface AdminAccountStatusDialogProps {
  employeeId: string;
  employeeName: string;
  currentStatus?: AccountStatus;
  onStatusChange?: () => void;
}

export type AccountStatus = 'Active' | 'Inactive' | 'Probation';

const statusOptions: { value: AccountStatus; label: string; description: string }[] = [
  {
    value: 'Active',
    label: 'Active',
    description: 'Employee can log in and access the system normally',
  },
  {
    value: 'Inactive',
    label: 'Inactive',
    description: 'Employee account is inactive (e.g., on leave, terminated)',
  },
  {
    value: 'Probation',
    label: 'Probation',
    description: 'Employee is on probationary period',
  },
];

export function AdminAccountStatusDialog({
  employeeId,
  employeeName,
  currentStatus = 'Active',
  onStatusChange,
}: AdminAccountStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus>(currentStatus as AccountStatus);

  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus) {
      toast({
        title: 'Info',
        description: 'No status change made',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({ status: selectedStatus } as any)
        .eq('id', employeeId);

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        const statusLabel = statusOptions.find(s => s.value === selectedStatus)?.label;
        toast({
          title: 'Success',
          description: `${employeeName}'s account status has been changed to ${statusLabel}`,
        });

        setOpen(false);
        if (onStatusChange) {
          onStatusChange();
        }
      }
    } catch (error) {
      console.error('Error updating account status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update account status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const warningStatus = selectedStatus !== 'Active' && selectedStatus !== currentStatus;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserCog className="w-4 h-4" />
          Account Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Account Status</DialogTitle>
          <DialogDescription>
            Update the account status for <span className="font-semibold text-foreground">{employeeName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Select Status</Label>
            <RadioGroup value={selectedStatus} onValueChange={(val) => setSelectedStatus(val as AccountStatus)}>
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {warningStatus && (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-orange-800 dark:text-orange-300">
                {selectedStatus === 'Inactive' && 'This employee will be unable to access their account.'}
                {selectedStatus === 'Probation' && 'This employee is under probationary review.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleStatusChange}
              disabled={loading || selectedStatus === currentStatus}
              className="flex-1 gradient-primary text-primary-foreground"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
