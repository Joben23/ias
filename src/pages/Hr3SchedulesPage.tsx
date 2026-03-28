import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Edit, Trash2, Calendar, Clock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  full_name: string;
}

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface Schedule {
  id: string;
  employee_id: string;
  shift_id: string;
  date: string;
  status: string;
  created_at: string;
  employees: {
    full_name: string;
  };
  shifts: {
    name: string;
    start_time: string;
    end_time: string;
  };
}

export default function Hr3SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    shift_id: '',
    date: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch schedules with joined data
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select(`
          *,
          employees:employee_id (
            full_name
          ),
          shifts:shift_id (
            name,
            start_time,
            end_time
          )
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (schedulesError) throw schedulesError;

      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, full_name')
        .eq('status', 'Active')
        .order('full_name');

      if (employeesError) throw employeesError;

      // Fetch shifts
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .order('name');

      if (shiftsError) throw shiftsError;

      setSchedules((schedulesData || []) as Schedule[]);
      setEmployees(employeesData || []);
      setShifts(shiftsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schedules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData({
      employee_id: '',
      shift_id: '',
      date: '',
    });
    setEditingSchedule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employee_id || !formData.shift_id || !formData.date) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingSchedule) {
        // Update existing schedule
        const { error } = await supabase
          .from('schedules')
          .update({
            employee_id: formData.employee_id,
            shift_id: formData.shift_id,
            date: formData.date,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSchedule.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Schedule updated successfully',
        });
      } else {
        // Create new schedule
        const { error } = await supabase
          .from('schedules')
          .insert({
            employee_id: formData.employee_id,
            shift_id: formData.shift_id,
            date: formData.date,
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Schedule created successfully',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save schedule',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      employee_id: schedule.employee_id,
      shift_id: schedule.shift_id,
      date: schedule.date,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Schedule deleted successfully',
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-700 border-0';
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-0';
      default:
        return 'bg-gray-500/10 text-gray-700 border-0';
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground">
            Assign shifts to employees and manage work schedules
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              Assign Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Edit Schedule' : 'Assign New Schedule'}
              </DialogTitle>
              <DialogDescription>
                {editingSchedule
                  ? 'Update the schedule assignment below.'
                  : 'Assign a shift to an employee for a specific date.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select
                  value={formData.shift_id}
                  onValueChange={(value) => setFormData({ ...formData, shift_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.name} ({formatTime(shift.start_time)} - {formatTime(shift.end_time)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSchedule ? 'Update Schedule' : 'Assign Schedule'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Schedules</CardTitle>
          <CardDescription>
            Current shift assignments for all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading schedules...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No schedules assigned yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Assign your first schedule to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className={`border-l-4 ${getShiftColor(schedule.shifts.name)}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {schedule.employees.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {schedule.shifts.name}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
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
                              <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this schedule assignment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(schedule.id)}
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
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(schedule.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(schedule.shifts.start_time)} - {formatTime(schedule.shifts.end_time)}
                        </span>
                      </div>
                      <div className="pt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(schedule.status)}`}>
                          {schedule.status}
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