import { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Schedule {
  id: string;
  employee_id: string;
  employee_name: string;
  shift_name: string;
  date: string;
  start_time: string;
  end_time: string;
  notes: string;
  status: 'Scheduled' | 'Modified' | 'Completed';
}

export default function ScheduleManagementPage() {
  const mockSchedules: Schedule[] = [
    {
      id: 'SCH-001',
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      shift_name: 'Morning Shift',
      date: '2026-05-06',
      start_time: '07:00',
      end_time: '15:00',
      notes: 'Regular morning shift',
      status: 'Scheduled',
    },
    {
      id: 'SCH-002',
      employee_id: 'HOS-IT-002',
      employee_name: 'Dr. Sarah Mitchell',
      shift_name: 'Morning Shift',
      date: '2026-05-06',
      start_time: '07:00',
      end_time: '15:00',
      notes: 'Director schedule',
      status: 'Scheduled',
    },
    {
      id: 'SCH-003',
      employee_id: 'HOS-IT-003',
      employee_name: 'Michael Chen',
      shift_name: 'Afternoon Shift',
      date: '2026-05-06',
      start_time: '15:00',
      end_time: '23:00',
      notes: 'Regular afternoon shift',
      status: 'Scheduled',
    },
    {
      id: 'SCH-004',
      employee_id: 'HOS-IT-004',
      employee_name: 'Jessica Martinez',
      shift_name: 'Morning Shift',
      date: '2026-05-07',
      start_time: '07:00',
      end_time: '15:00',
      notes: 'Security specialist morning',
      status: 'Scheduled',
    },
  ];

  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    shift_name: '',
    date: '',
    start_time: '',
    end_time: '',
    notes: '',
  });
  const { toast } = useToast();

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setFormData({
      employee_id: '',
      shift_name: '',
      date: '',
      start_time: '',
      end_time: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleSaveSchedule = () => {
    if (!formData.employee_id || !formData.date || !formData.start_time || !formData.end_time) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const employees = [
      { id: 'HOS-ENG-001', name: 'Benjo Sion' },
      { id: 'HOS-IT-002', name: 'Dr. Sarah Mitchell' },
      { id: 'HOS-IT-003', name: 'Michael Chen' },
      { id: 'HOS-IT-004', name: 'Jessica Martinez' },
    ];
    const employee = employees.find(e => e.id === formData.employee_id);

    if (editingSchedule) {
      setSchedules(schedules.map(s => s.id === editingSchedule.id
        ? { ...editingSchedule, ...formData, employee_name: employee?.name || '' }
        : s
      ));
      toast({
        title: 'Success',
        description: 'Schedule updated',
      });
    } else {
      const newSchedule: Schedule = {
        id: `SCH-${schedules.length + 1}`,
        employee_id: formData.employee_id,
        employee_name: employee?.name || '',
        shift_name: formData.shift_name,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes,
        status: 'Scheduled',
      };
      setSchedules([...schedules, newSchedule]);
      toast({
        title: 'Success',
        description: 'Schedule created',
      });
    }
    setDialogOpen(false);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      employee_id: schedule.employee_id,
      shift_name: schedule.shift_name,
      date: schedule.date,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      notes: schedule.notes,
    });
    setDialogOpen(true);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('Delete this schedule entry?')) {
      setSchedules(schedules.filter(s => s.id !== id));
      toast({
        title: 'Success',
        description: 'Schedule deleted',
      });
    }
  };

  const handleExport = () => {
    toast({
      title: 'Export',
      description: 'Schedule exported to PDF/Excel',
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Modified':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage employee schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddSchedule} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Employee *</label>
                    <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOS-ENG-001">Benjo Sion</SelectItem>
                        <SelectItem value="HOS-IT-002">Dr. Sarah Mitchell</SelectItem>
                        <SelectItem value="HOS-IT-003">Michael Chen</SelectItem>
                        <SelectItem value="HOS-IT-004">Jessica Martinez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date *</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time *</label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time *</label>
                    <Input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Shift Name</label>
                    <Input
                      value={formData.shift_name}
                      onChange={(e) => setFormData({ ...formData, shift_name: e.target.value })}
                      placeholder="Morning/Afternoon/Night"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveSchedule}>{editingSchedule ? 'Update' : 'Create'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Employees Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(schedules.map(s => s.employee_id)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.filter(s => s.status === 'Modified').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold">Shift</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Time</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(schedule => (
                  <tr key={schedule.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{schedule.employee_name}</td>
                    <td className="py-3 px-4">{schedule.shift_name}</td>
                    <td className="py-3 px-4">{schedule.date}</td>
                    <td className="py-3 px-4">{schedule.start_time} - {schedule.end_time}</td>
                    <td className="py-3 px-4">
                      <Badge className={statusColor(schedule.status)}>{schedule.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditSchedule(schedule)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteSchedule(schedule.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
