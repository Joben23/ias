import { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Edit, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  clock_in: string;
  clock_out: string;
  hours_worked: number;
  status: 'Present' | 'Absent' | 'Late' | 'Early Leave' | 'Correction Pending';
  notes: string;
}

export default function AttendancePage() {
  const mockAttendance: AttendanceRecord[] = [
    {
      id: 'ATT-001',
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      date: '2026-05-06',
      clock_in: '07:05',
      clock_out: '15:30',
      hours_worked: 8.25,
      status: 'Late',
      notes: 'Traffic delay',
    },
    {
      id: 'ATT-002',
      employee_id: 'HOS-IT-002',
      employee_name: 'Dr. Sarah Mitchell',
      date: '2026-05-06',
      clock_in: '07:00',
      clock_out: '15:00',
      hours_worked: 8,
      status: 'Present',
      notes: '',
    },
    {
      id: 'ATT-003',
      employee_id: 'HOS-IT-003',
      employee_name: 'Michael Chen',
      date: '2026-05-06',
      clock_in: '15:00',
      clock_out: '23:00',
      hours_worked: 8,
      status: 'Present',
      notes: '',
    },
    {
      id: 'ATT-004',
      employee_id: 'HOS-IT-004',
      employee_name: 'Jessica Martinez',
      date: '2026-05-05',
      clock_in: '07:00',
      clock_out: '14:30',
      hours_worked: 7.5,
      status: 'Early Leave',
      notes: 'Medical appointment',
    },
  ];

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [correctionForm, setCorrectionForm] = useState({
    clock_in: '',
    clock_out: '',
    reason: '',
  });
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const { toast } = useToast();

  const handleClockIn = () => {
    toast({
      title: 'Clock In',
      description: `You clocked in at ${new Date().toLocaleTimeString()}`,
    });
  };

  const handleClockOut = () => {
    toast({
      title: 'Clock Out',
      description: `You clocked out at ${new Date().toLocaleTimeString()}`,
    });
  };

  const handleRequestCorrection = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setCorrectionForm({
      clock_in: record.clock_in,
      clock_out: record.clock_out,
      reason: '',
    });
    setCorrectionDialogOpen(true);
  };

  const handleSubmitCorrection = () => {
    if (!correctionForm.reason) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for correction',
        variant: 'destructive',
      });
      return;
    }

    if (selectedRecord) {
      setAttendance(attendance.map(a => a.id === selectedRecord.id
        ? { ...a, status: 'Correction Pending' }
        : a
      ));
      toast({
        title: 'Success',
        description: 'Correction request submitted',
      });
      setCorrectionDialogOpen(false);
    }
  };

  const handleApproveCorrection = (id: string) => {
    setAttendance(attendance.map(a => a.id === id
      ? { ...a, status: 'Present' }
      : a
    ));
    toast({
      title: 'Success',
      description: 'Correction approved',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export',
      description: 'Attendance data exported to PDF/Excel',
    });
  };

  const filteredAttendance = attendance.filter(record => {
    return (!filterEmployee || record.employee_id === filterEmployee) &&
           (!filterDate || record.date === filterDate);
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'Early Leave':
        return 'bg-orange-100 text-orange-800';
      case 'Correction Pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    present: attendance.filter(a => a.status === 'Present').length,
    absent: attendance.filter(a => a.status === 'Absent').length,
    late: attendance.filter(a => a.status === 'Late').length,
    totalHours: Math.round(attendance.reduce((sum, a) => sum + a.hours_worked, 0) * 10) / 10,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">Track employee attendance and manage corrections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClockIn}>
            <Clock className="h-4 w-4 mr-2" />
            Clock In
          </Button>
          <Button variant="outline" onClick={handleClockOut}>
            <Clock className="h-4 w-4 mr-2" />
            Clock Out
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {stats.present}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              {stats.absent}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Filter by Employee</label>
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All employees</SelectItem>
                  <SelectItem value="HOS-ENG-001">Benjo Sion</SelectItem>
                  <SelectItem value="HOS-IT-002">Dr. Sarah Mitchell</SelectItem>
                  <SelectItem value="HOS-IT-003">Michael Chen</SelectItem>
                  <SelectItem value="HOS-IT-004">Jessica Martinez</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Filter by Date</label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Clock In</th>
                  <th className="text-left py-3 px-4 font-semibold">Clock Out</th>
                  <th className="text-left py-3 px-4 font-semibold">Hours</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map(record => (
                  <tr key={record.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{record.employee_name}</td>
                    <td className="py-3 px-4">{record.date}</td>
                    <td className="py-3 px-4">{record.clock_in}</td>
                    <td className="py-3 px-4">{record.clock_out}</td>
                    <td className="py-3 px-4">{record.hours_worked}h</td>
                    <td className="py-3 px-4">
                      <Badge className={statusColor(record.status)}>{record.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {record.status === 'Correction Pending' && (
                        <Button size="sm" onClick={() => handleApproveCorrection(record.id)}>
                          Approve
                        </Button>
                      )}
                      {record.status !== 'Correction Pending' && (
                        <Dialog open={correctionDialogOpen} onOpenChange={setCorrectionDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestCorrection(record)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Correction</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Clock In</label>
                                  <Input
                                    type="time"
                                    value={correctionForm.clock_in}
                                    onChange={(e) => setCorrectionForm({ ...correctionForm, clock_in: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Clock Out</label>
                                  <Input
                                    type="time"
                                    value={correctionForm.clock_out}
                                    onChange={(e) => setCorrectionForm({ ...correctionForm, clock_out: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Reason for Correction *</label>
                                <Input
                                  value={correctionForm.reason}
                                  onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                                  placeholder="Brief explanation..."
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setCorrectionDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSubmitCorrection}>Submit</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
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
