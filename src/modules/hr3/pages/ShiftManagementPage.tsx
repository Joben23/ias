import { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  shift_type: 'Morning' | 'Afternoon' | 'Night' | 'Flexible';
  description: string;
  created_at: string;
}

interface ShiftAssignment {
  id: string;
  employee_id: string;
  employee_name: string;
  shift_id: string;
  shift_name: string;
  date: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export default function ShiftManagementPage() {
  // Mock data
  const mockShiftTemplates: ShiftTemplate[] = [
    {
      id: 'SHIFT-001',
      name: 'Morning Shift',
      start_time: '07:00',
      end_time: '15:00',
      break_duration: 30,
      shift_type: 'Morning',
      description: 'Standard morning shift with one 30-minute break',
      created_at: '2026-04-01',
    },
    {
      id: 'SHIFT-002',
      name: 'Afternoon Shift',
      start_time: '15:00',
      end_time: '23:00',
      break_duration: 30,
      shift_type: 'Afternoon',
      description: 'Standard afternoon shift with one 30-minute break',
      created_at: '2026-04-01',
    },
    {
      id: 'SHIFT-003',
      name: 'Night Shift',
      start_time: '23:00',
      end_time: '07:00',
      break_duration: 45,
      shift_type: 'Night',
      description: 'Overnight shift with two 30-minute breaks',
      created_at: '2026-04-01',
    },
  ];

  const mockShiftAssignments: ShiftAssignment[] = [
    {
      id: 'SA-001',
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      shift_id: 'SHIFT-001',
      shift_name: 'Morning Shift',
      date: '2026-05-06',
      status: 'Scheduled',
    },
    {
      id: 'SA-002',
      employee_id: 'HOS-IT-002',
      employee_name: 'Dr. Sarah Mitchell',
      shift_id: 'SHIFT-001',
      shift_name: 'Morning Shift',
      date: '2026-05-06',
      status: 'Scheduled',
    },
    {
      id: 'SA-003',
      employee_id: 'HOS-IT-003',
      employee_name: 'Michael Chen',
      shift_id: 'SHIFT-002',
      shift_name: 'Afternoon Shift',
      date: '2026-05-06',
      status: 'Scheduled',
    },
  ];

  const [shifts, setShifts] = useState<ShiftTemplate[]>(mockShiftTemplates);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>(mockShiftAssignments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftTemplate | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    start_time: string;
    end_time: string;
    break_duration: number;
    shift_type: 'Morning' | 'Afternoon' | 'Night' | 'Flexible';
    description: string;
  }>({
    name: '',
    start_time: '',
    end_time: '',
    break_duration: 30,
    shift_type: 'Morning',
    description: '',
  });
  const [assignmentForm, setAssignmentForm] = useState({
    employee_id: '',
    shift_id: '',
    date: '',
  });
  const { toast } = useToast();

  const handleAddShift = () => {
    setEditingShift(null);
    setFormData({
      name: '',
      start_time: '',
      end_time: '',
      break_duration: 30,
      shift_type: 'Morning',
      description: '',
    });
    setDialogOpen(true);
  };

  const handleSaveShift = () => {
    if (!formData.name || !formData.start_time || !formData.end_time) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingShift) {
      setShifts(shifts.map(s => s.id === editingShift.id
        ? { ...editingShift, ...formData }
        : s
      ));
      toast({
        title: 'Success',
        description: 'Shift template updated successfully',
      });
    } else {
      const newShift: ShiftTemplate = {
        id: `SHIFT-${shifts.length + 1}`,
        ...formData,
        created_at: new Date().toISOString().split('T')[0],
      };
      setShifts([...shifts, newShift]);
      toast({
        title: 'Success',
        description: 'Shift template created successfully',
      });
    }
    setDialogOpen(false);
  };

  const handleEditShift = (shift: ShiftTemplate) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      break_duration: shift.break_duration,
      shift_type: shift.shift_type as typeof formData.shift_type,
      description: shift.description,
    });
    setDialogOpen(true);
  };

  const handleDeleteShift = (id: string) => {
    if (confirm('Are you sure you want to delete this shift template?')) {
      setShifts(shifts.filter(s => s.id !== id));
      toast({
        title: 'Success',
        description: 'Shift template deleted',
      });
    }
  };

  const handleAssignShift = () => {
    if (!assignmentForm.employee_id || !assignmentForm.shift_id || !assignmentForm.date) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const selectedShift = shifts.find(s => s.id === assignmentForm.shift_id);
    const employees = [
      { id: 'HOS-ENG-001', name: 'Benjo Sion' },
      { id: 'HOS-IT-002', name: 'Dr. Sarah Mitchell' },
      { id: 'HOS-IT-003', name: 'Michael Chen' },
      { id: 'HOS-IT-004', name: 'Jessica Martinez' },
    ];
    const employee = employees.find(e => e.id === assignmentForm.employee_id);

    if (selectedShift && employee) {
      const newAssignment: ShiftAssignment = {
        id: `SA-${assignments.length + 1}`,
        employee_id: assignmentForm.employee_id,
        employee_name: employee.name,
        shift_id: assignmentForm.shift_id,
        shift_name: selectedShift.name,
        date: assignmentForm.date,
        status: 'Scheduled',
      };
      setAssignments([...assignments, newAssignment]);
      setAssignmentForm({ employee_id: '', shift_id: '', date: '' });
      setAssignDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Shift assigned successfully',
      });
    }
  };

  const handleCancelAssignment = (id: string) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
    toast({
      title: 'Success',
      description: 'Shift assignment cancelled',
    });
  };

  const shiftTypeColor = (type: string) => {
    switch (type) {
      case 'Morning':
        return 'bg-yellow-100 text-yellow-800';
      case 'Afternoon':
        return 'bg-blue-100 text-blue-800';
      case 'Night':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shift Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage shift templates, assign shifts to employees</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddShift} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Shift Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingShift ? 'Edit Shift Template' : 'Create New Shift Template'}</DialogTitle>
              <DialogDescription>
                Define a shift template with start/end times and breaks
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Shift Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Morning Shift"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Shift Type *</label>
                  <Select value={formData.shift_type} onValueChange={(value) => setFormData({ ...formData, shift_type: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Afternoon">Afternoon</SelectItem>
                      <SelectItem value="Night">Night</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div>
                <label className="text-sm font-medium">Break Duration (minutes)</label>
                <Input
                  type="number"
                  value={formData.break_duration}
                  onChange={(e) => setFormData({ ...formData, break_duration: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveShift}>{editingShift ? 'Update' : 'Create'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shift Templates */}
      <div>
        <h2 className="text-xl font-bold mb-4">Shift Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map(shift => (
            <Card key={shift.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{shift.name}</CardTitle>
                    <Badge className={shiftTypeColor(shift.shift_type)}>{shift.shift_type}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEditShift(shift)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteShift(shift.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{shift.start_time} - {shift.end_time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{shift.description}</p>
                  <p className="text-xs text-muted-foreground">Break: {shift.break_duration} mins</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Shift Assignments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Shift Assignments</h2>
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Assign Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Shift to Employee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Employee *</label>
                  <Select value={assignmentForm.employee_id} onValueChange={(value) => setAssignmentForm({ ...assignmentForm, employee_id: value })}>
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
                  <label className="text-sm font-medium">Shift *</label>
                  <Select value={assignmentForm.shift_id} onValueChange={(value) => setAssignmentForm({ ...assignmentForm, shift_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map(shift => (
                        <SelectItem key={shift.id} value={shift.id}>{shift.name} ({shift.start_time}-{shift.end_time})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date *</label>
                  <Input
                    type="date"
                    value={assignmentForm.date}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, date: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAssignShift}>Assign</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Employee</th>
                <th className="text-left py-3 px-4 font-semibold">Shift</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{assignment.employee_name}</td>
                  <td className="py-3 px-4">{assignment.shift_name}</td>
                  <td className="py-3 px-4">{assignment.date}</td>
                  <td className="py-3 px-4">
                    <Badge className={statusColor(assignment.status)}>{assignment.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {assignment.status === 'Scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelAssignment(assignment.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
