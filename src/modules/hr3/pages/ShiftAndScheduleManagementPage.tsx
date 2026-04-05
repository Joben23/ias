import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
  BarChart3,
  Download,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

interface ShiftTemplate {
  id: string;
  name: string;
  department: 'Emergency' | 'Surgery' | 'ICU' | 'Pediatrics';
  startTime: string;
  endTime: string;
  breakDuration: number;
  color: string;
  assignedCount: number;
}

interface EmployeeSchedule {
  id: string;
  employeeName: string;
  employeeId: string;
  department: 'Emergency' | 'Surgery' | 'ICU' | 'Pediatrics';
  shiftId: string;
  shiftName: string;
  date: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Absent';
}

interface CoverageStats {
  department: string;
  assigned: number;
  required: number;
  status: 'Good' | 'Warning' | 'Critical';
}

const DEPARTMENTS: Array<'Emergency' | 'Surgery' | 'ICU' | 'Pediatrics'> = ['Emergency', 'Surgery', 'ICU', 'Pediatrics'];

const AVAILABLE_EMPLOYEES = [
  { id: 'EMP-001', name: 'Dr. Maria Santos', department: 'Emergency' as const },
  { id: 'EMP-002', name: 'Nurse Juan Dela Cruz', department: 'ICU' as const },
  { id: 'EMP-003', name: 'Dr. Luis Reyes', department: 'Surgery' as const },
  { id: 'EMP-004', name: 'Nurse Rosa Garcia', department: 'Pediatrics' as const },
  { id: 'EMP-005', name: 'Dr. Anna Chen', department: 'Emergency' as const },
  { id: 'EMP-006', name: 'Nurse Miguel Santos', department: 'Surgery' as const },
  { id: 'EMP-007', name: 'Dr. Patricia Lopez', department: 'ICU' as const },
  { id: 'EMP-008', name: 'Nurse James Wilson', department: 'Emergency' as const },
];

export default function ShiftAndScheduleManagementPage() {
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [shifts, setShifts] = useState<ShiftTemplate[]>([
    {
      id: 'SHIFT-001',
      name: 'Morning Shift',
      department: 'Emergency',
      startTime: '07:00',
      endTime: '15:00',
      breakDuration: 30,
      color: 'bg-amber-100 dark:bg-amber-900/30',
      assignedCount: 8,
    },
    {
      id: 'SHIFT-002',
      name: 'Afternoon Shift',
      department: 'ICU',
      startTime: '15:00',
      endTime: '23:00',
      breakDuration: 30,
      color: 'bg-blue-100 dark:bg-blue-900/30',
      assignedCount: 6,
    },
    {
      id: 'SHIFT-003',
      name: 'Night Shift',
      department: 'Surgery',
      startTime: '23:00',
      endTime: '07:00',
      breakDuration: 30,
      color: 'bg-purple-100 dark:bg-purple-900/30',
      assignedCount: 5,
    },
  ]);

  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([
    {
      id: 'SCHED-001',
      employeeName: 'Dr. Maria Santos',
      employeeId: 'EMP-001',
      department: 'Emergency',
      shiftId: 'SHIFT-001',
      shiftName: 'Morning Shift',
      date: today,
      status: 'Scheduled',
    },
    {
      id: 'SCHED-002',
      employeeName: 'Nurse Juan Dela Cruz',
      employeeId: 'EMP-002',
      department: 'ICU',
      shiftId: 'SHIFT-002',
      shiftName: 'Afternoon Shift',
      date: today,
      status: 'Scheduled',
    },
    {
      id: 'SCHED-003',
      employeeName: 'Dr. Luis Reyes',
      employeeId: 'EMP-003',
      department: 'Surgery',
      shiftId: 'SHIFT-003',
      shiftName: 'Night Shift',
      date: today,
      status: 'Scheduled',
    },
  ]);

  // Dialog states - Shift Management
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftTemplate | null>(null);
  const [shiftForm, setShiftForm] = useState<{
    name: string;
    department: 'Emergency' | 'Surgery' | 'ICU' | 'Pediatrics';
    startTime: string;
    endTime: string;
    breakDuration: number;
  }>({
    name: '',
    department: 'Emergency',
    startTime: '07:00',
    endTime: '15:00',
    breakDuration: 30,
  });

  // Dialog states - Schedule Assignment
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<EmployeeSchedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    employeeId: '',
    employeeName: '',
    shiftId: '',
    date: today,
  });

  // Calendar state
  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date()));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));

  // Filter state
  const [filterDepartment, setFilterDepartment] = useState('All');

  const handleAddShift = () => {
    setEditingShift(null);
    setShiftForm({ name: '', department: 'Emergency', startTime: '07:00', endTime: '15:00', breakDuration: 30 });
    setShiftDialogOpen(true);
  };

  const handleEditShift = (shift: ShiftTemplate) => {
    setEditingShift(shift);
    setShiftForm({
      name: shift.name,
      department: shift.department as 'Emergency' | 'Surgery' | 'ICU' | 'Pediatrics',
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
    });
    setShiftDialogOpen(true);
  };

  const handleSaveShift = () => {
    if (!shiftForm.name) {
      toast({ title: 'Error', description: 'Please enter shift name' });
      return;
    }

    if (editingShift) {
      setShifts(shifts.map(s => s.id === editingShift.id ? { ...s, ...shiftForm } : s));
      toast({ title: 'Success', description: 'Shift updated successfully' });
    } else {
      const newShift: ShiftTemplate = {
        id: `SHIFT-${Date.now()}`,
        ...shiftForm,
        color: 'bg-gray-100 dark:bg-gray-800/30',
        assignedCount: 0,
      };
      setShifts([...shifts, newShift]);
      toast({ title: 'Success', description: 'Shift created successfully' });
    }
    setShiftDialogOpen(false);
  };

  const handleDeleteShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
    toast({ title: 'Success', description: 'Shift deleted successfully' });
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm({ employeeId: '', employeeName: '', shiftId: '', date: today });
    setScheduleDialogOpen(true);
  };

  const handleEditSchedule = (schedule: EmployeeSchedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      employeeId: schedule.employeeId,
      employeeName: schedule.employeeName,
      shiftId: schedule.shiftId,
      date: schedule.date,
    });
    setScheduleDialogOpen(true);
  };

  const handleSaveSchedule = () => {
    if (!scheduleForm.employeeId || !scheduleForm.shiftId) {
      toast({ title: 'Error', description: 'Please select employee and shift' });
      return;
    }

    const selectedShift = shifts.find(s => s.id === scheduleForm.shiftId);
    if (!selectedShift) return;

    if (editingSchedule) {
      setSchedules(schedules.map(s => s.id === editingSchedule.id ? {
        ...s,
        employeeId: scheduleForm.employeeId,
        employeeName: scheduleForm.employeeName,
        shiftId: scheduleForm.shiftId,
        shiftName: selectedShift.name,
        date: scheduleForm.date,
      } : s));
      toast({ title: 'Success', description: 'Schedule updated' });
    } else {
      const newSchedule: EmployeeSchedule = {
        id: `SCHED-${Date.now()}`,
        employeeId: scheduleForm.employeeId,
        employeeName: scheduleForm.employeeName,
        department: AVAILABLE_EMPLOYEES.find(e => e.id === scheduleForm.employeeId)?.department || 'Emergency',
        shiftId: scheduleForm.shiftId,
        shiftName: selectedShift.name,
        date: scheduleForm.date,
        status: 'Scheduled',
      };
      setSchedules([...schedules, newSchedule]);
      toast({ title: 'Success', description: 'Schedule assigned successfully' });
    }
    setScheduleDialogOpen(false);
  };

  const handleRemoveSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
    toast({ title: 'Success', description: 'Schedule removed' });
  };

  const getCoverageStats = (): CoverageStats[] => {
    return DEPARTMENTS.map(dept => {
      const assigned = schedules.filter(s => s.department === dept).length;
      const required = 8; // Standard requirement
      const status = assigned >= required ? 'Good' : assigned >= required * 0.75 ? 'Warning' : 'Critical';
      return { department: dept, assigned, required, status };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300';
      case 'Absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftColor = (shiftName: string) => {
    if (shiftName.includes('Morning')) return 'text-amber-600 dark:text-amber-400';
    if (shiftName.includes('Afternoon')) return 'text-blue-600 dark:text-blue-400';
    if (shiftName.includes('Night')) return 'text-purple-600 dark:text-purple-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const filteredSchedules = filterDepartment === 'All' 
    ? schedules 
    : schedules.filter(s => s.department === filterDepartment);

  const coverageStats = getCoverageStats();

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground dark:text-slate-100">Shift & Schedule Management 📅</h1>
        <p className="text-muted-foreground dark:text-slate-400 mt-1">Create, manage, and assign work shifts for hospital employees</p>
      </div>

      {/* Section 1: Shift Templates Management */}
      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <div>
                <CardTitle className="dark:text-slate-100">Shift Templates</CardTitle>
                <CardDescription className="dark:text-slate-400">Define and manage hospital work shifts</CardDescription>
              </div>
            </div>
            <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddShift} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingShift ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium dark:text-slate-100">Shift Name *</label>
                    <Input
                      value={shiftForm.name}
                      onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                      placeholder="Morning Shift, Afternoon Shift, etc."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-slate-100">Department *</label>
                    <Select value={shiftForm.department} onValueChange={(value: any) => setShiftForm({ ...shiftForm, department: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium dark:text-slate-100">Start Time *</label>
                      <Input
                        type="time"
                        value={shiftForm.startTime}
                        onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium dark:text-slate-100">End Time *</label>
                      <Input
                        type="time"
                        value={shiftForm.endTime}
                        onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-slate-100">Break Duration (minutes)</label>
                    <Input
                      type="number"
                      value={shiftForm.breakDuration}
                      onChange={(e) => setShiftForm({ ...shiftForm, breakDuration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShiftDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveShift}>Save Shift</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Shift Name</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Department</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Time</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Break</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Assigned</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} className="border-b hover:bg-muted/50 dark:border-slate-700 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4 dark:text-slate-200 font-medium">{shift.name}</td>
                    <td className="py-3 px-4 dark:text-slate-200">{shift.department}</td>
                    <td className="py-3 px-4 dark:text-slate-200">{shift.startTime} - {shift.endTime}</td>
                    <td className="py-3 px-4 dark:text-slate-200">{shift.breakDuration} min</td>
                    <td className="py-3 px-4">
                      <Badge className="dark:bg-slate-700 dark:text-slate-200">{shift.assignedCount}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditShift(shift)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteShift(shift.id)}>
                          <Trash2 className="w-4 h-4" />
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

      {/* Section 2: Employee Schedule Assignment */}
      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <div>
                <CardTitle className="dark:text-slate-100">Employee Schedules</CardTitle>
                <CardDescription className="dark:text-slate-400">Assign employees to shifts and manage schedules</CardDescription>
              </div>
            </div>
            <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddSchedule} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Assign Employee Schedule'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium dark:text-slate-100">Employee *</label>
                    <Select value={scheduleForm.employeeId} onValueChange={(value) => {
                      const emp = AVAILABLE_EMPLOYEES.find(e => e.id === value);
                      setScheduleForm({ ...scheduleForm, employeeId: value, employeeName: emp?.name || '' });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_EMPLOYEES.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.department})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-slate-100">Shift *</label>
                    <Select value={scheduleForm.shiftId} onValueChange={(value) => setScheduleForm({ ...scheduleForm, shiftId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {shifts.map(shift => <SelectItem key={shift.id} value={shift.id}>{shift.name} ({shift.startTime}-{shift.endTime})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-slate-100">Date *</label>
                    <Input
                      type="date"
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveSchedule}>Save Schedule</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium dark:text-slate-100 block mb-2">Filter by Department</label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Departments</SelectItem>
                  {DEPARTMENTS.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Employee Name</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Department</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Shift Name</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Date</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Status</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b hover:bg-muted/50 dark:border-slate-700 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4 dark:text-slate-200 font-medium">{schedule.employeeName}</td>
                    <td className="py-3 px-4 dark:text-slate-200">{schedule.department}</td>
                    <td className={`py-3 px-4 font-medium ${getShiftColor(schedule.shiftName)}`}>{schedule.shiftName}</td>
                    <td className="py-3 px-4 dark:text-slate-200">{format(new Date(schedule.date), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(schedule.status)}>{schedule.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditSchedule(schedule)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleRemoveSchedule(schedule.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSchedules.length === 0 && (
              <Alert className="mt-4 dark:bg-slate-800/50 dark:border-slate-700">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="dark:text-slate-300">No schedules found for selected filters</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Coverage Stats & Reporting */}
      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <div>
                <CardTitle className="dark:text-slate-100">Coverage & Stats</CardTitle>
                <CardDescription className="dark:text-slate-400">Department coverage status and efficiency</CardDescription>
              </div>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {coverageStats.map((stat) => (
              <Card key={stat.department} className="dark:bg-slate-700/40 dark:border-slate-600">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium dark:text-slate-100">{stat.department}</p>
                      <Badge className={
                        stat.status === 'Good' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : stat.status === 'Warning'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      }>
                        {stat.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold dark:text-slate-100">
                      {stat.assigned}/{stat.required}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          stat.status === 'Good' 
                            ? 'bg-green-600'
                            : stat.status === 'Warning'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${(stat.assigned / stat.required) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground dark:text-slate-400">
                      {Math.round((stat.assigned / stat.required) * 100)}% coverage
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Weekly Calendar Overview */}
      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <div>
                <CardTitle className="dark:text-slate-100">Weekly Schedule Overview</CardTitle>
                <CardDescription className="dark:text-slate-400">
                  {format(weekStartDate, 'MMM dd')} - {format(addDays(weekStartDate, 6), 'MMM dd, yyyy')}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setWeekStartDate(addDays(weekStartDate, -7))}>← Prev</Button>
              <Button variant="outline" size="sm" onClick={() => setWeekStartDate(startOfWeek(new Date()))}>Today</Button>
              <Button variant="outline" size="sm" onClick={() => setWeekStartDate(addDays(weekStartDate, 7))}>Next →</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const daySchedules = schedules.filter(s => s.date === format(day, 'yyyy-MM-dd'));
              return (
                <Card key={format(day, 'yyyy-MM-dd')} className="dark:bg-slate-700/40 dark:border-slate-600">
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold dark:text-slate-100 mb-2">
                      {format(day, 'EEE, MMM dd')}
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {daySchedules.length > 0 ? (
                        daySchedules.map((schedule) => (
                          <div key={schedule.id} className="text-xs bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 text-blue-800 p-1 rounded">
                            <div className="font-medium truncate">{schedule.employeeName.split(' ')[0]}</div>
                            <div className="truncate">{schedule.shiftName}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground dark:text-slate-400 italic">No schedules</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Integration Notes */}
      <Alert className="dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="dark:text-slate-300">
          <strong>Integration Points:</strong> Shift data is automatically synced with Attendance Module for clock-in/out timers. Completed shifts are logged in Timesheets Module and hours are forwarded to Payroll (HR4) for processing.
        </AlertDescription>
      </Alert>
    </div>
  );
}
