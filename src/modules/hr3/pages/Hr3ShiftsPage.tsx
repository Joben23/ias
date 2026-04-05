import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

const mockShifts: Shift[] = [
  {
    id: 'SHIFT-001',
    name: 'Morning Shift',
    start_time: '07:00',
    end_time: '15:00',
    created_at: '2026-04-01',
  },
  {
    id: 'SHIFT-002',
    name: 'Afternoon Shift',
    start_time: '15:00',
    end_time: '23:00',
    created_at: '2026-04-01',
  },
  {
    id: 'SHIFT-003',
    name: 'Night Shift',
    start_time: '23:00',
    end_time: '07:00',
    created_at: '2026-04-01',
  },
];

export default function Hr3ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: '',
      start_time: '',
      end_time: '',
    });
    setEditingShift(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.start_time || !formData.end_time) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingShift) {
      // Update existing shift
      setShifts(shifts.map(s => s.id === editingShift.id
        ? {
            ...editingShift,
            name: formData.name,
            start_time: formData.start_time,
            end_time: formData.end_time,
          }
        : s
      ));
      toast({
        title: 'Success',
        description: 'Shift updated successfully',
      });
    } else {
      // Create new shift
      const newShift: Shift = {
        id: `SHIFT-${String(shifts.length + 1).padStart(3, '0')}`,
        name: formData.name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        created_at: new Date().toISOString().split('T')[0],
      };
      setShifts([...shifts, newShift]);
      toast({
        title: 'Success',
        description: 'Shift created successfully',
      });
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time,
    });
    setDialogOpen(true);
  };

  const handleDelete = (shiftId: string) => {
    setShifts(shifts.filter(s => s.id !== shiftId));
    toast({
      title: 'Success',
      description: 'Shift deleted successfully',
    });
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const getShiftColor = (shiftName: string) => {
    if (shiftName.toLowerCase().includes('morning')) {
      return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    } else if (shiftName.toLowerCase().includes('night')) {
      return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/20';
    } else if (shiftName.toLowerCase().includes('afternoon')) {
      return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
    } else {
      return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Shift Management</h1>
          <p className="text-muted-foreground">
            Create and manage work shifts for your organization
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Shift
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingShift ? 'Edit Shift' : 'Create New Shift'}
              </DialogTitle>
              <DialogDescription>
                {editingShift
                  ? 'Update the shift details below.'
                  : 'Add a new shift to your organization.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shift Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Morning Shift"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingShift ? 'Update Shift' : 'Create Shift'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Shifts</CardTitle>
          <CardDescription>
            All configured shifts in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No shifts configured yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first shift to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map((shift) => (
                <Card key={shift.id} className={`border-l-4 ${getShiftColor(shift.name)}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">{shift.name}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(shift)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Shift</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{shift.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(shift.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}