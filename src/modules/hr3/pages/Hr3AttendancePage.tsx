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
  CheckCircle,
  AlertCircle,
  Calendar,
  LogIn,
  LogOut,
  TrendingUp,
  Download,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  shift_id: string;
  shift_name: string;
  shift_start: string;
  shift_end: string;
  time_in?: string;
  time_out?: string;
  break_duration: number;
  total_hours: number;
  overtime_hours: number;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Overtime';
  notes?: string;
  approved_by?: string;
  correction_requested?: boolean;
  correction_reason?: string;
}

interface ClockSession {
  employee_id: string;
  employee_name: string;
  shift_id: string;
  shift_name: string;
  shift_start: string;
  shift_end: string;
  clock_in_time: string;
  break_start?: string;
  break_end?: string;
  remaining_seconds: number;
  is_overtime: boolean;
}

export default function Hr3AttendancePage() {
  const { toast } = useToast();

  const currentEmployee = {
    id: 'HOS-ENG-001',
    name: 'Benjo Sion',
    department: 'Clinical Information Technology',
  };

  const mockShifts = [
    { id: 'SHIFT-001', name: 'Morning Shift', start: '07:00', end: '15:00' },
    { id: 'SHIFT-002', name: 'Afternoon Shift', start: '15:00', end: '23:00' },
    { id: 'SHIFT-003', name: 'Night Shift', start: '23:00', end: '07:00' },
  ];

  const mockAttendanceRecords: AttendanceRecord[] = [
    {
      id: 'ATT-001',
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      date: '2026-05-06',
      shift_id: 'SHIFT-001',
      shift_name: 'Morning Shift',
      shift_start: '07:00',
      shift_end: '15:00',
      time_in: '07:05',
      time_out: '15:30',
      break_duration: 30,
      total_hours: 8,
      overtime_hours: 0.5,
      status: 'Overtime',
    },
    {
      id: 'ATT-002',
      employee_id: 'HOS-IT-002',
      employee_name: 'Dr. Sarah Mitchell',
      date: '2026-05-06',
      shift_id: 'SHIFT-001',
      shift_name: 'Morning Shift',
      shift_start: '07:00',
      shift_end: '15:00',
      time_in: '07:15',
      time_out: '15:00',
      break_duration: 30,
      total_hours: 7.75,
      overtime_hours: 0,
      status: 'Late',
    },
    {
      id: 'ATT-003',
      employee_id: 'HOS-IT-003',
      employee_name: 'Michael Chen',
      date: '2026-05-06',
      shift_id: 'SHIFT-001',
      shift_name: 'Morning Shift',
      shift_start: '07:00',
      shift_end: '15:00',
      time_in: '07:00',
      time_out: '15:00',
      break_duration: 30,
      total_hours: 8,
      overtime_hours: 0,
      status: 'Present',
    },
    {
      id: 'ATT-004',
      employee_id: 'HOS-IT-004',
      employee_name: 'Jessica Martinez',
      date: '2026-05-06',
      shift_id: 'SHIFT-002',
      shift_name: 'Afternoon Shift',
      shift_start: '15:00',
      shift_end: '23:00',
      status: 'Absent',
      break_duration: 0,
      total_hours: 0,
      overtime_hours: 0,
    },
  ];

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [clockSession, setClockSession] = useState<ClockSession | null>(null);
  const [timerDisplay, setTimerDisplay] = useState<string>('00:00:00');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);

  const [filterDate, setFilterDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [correctionReason, setCorrectionReason] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(format(now, 'EEEE, MMMM d, yyyy'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!clockSession) return;

    const timer = setInterval(() => {
      const now = new Date();
      const [endHour, endMin] = clockSession.shift_end.split(':').map(Number);
      const shiftEnd = new Date(now);
      shiftEnd.setHours(endHour, endMin, 0);

      if (endHour < 7) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }

      const diffMs = shiftEnd.getTime() - now.getTime();
      const totalSeconds = Math.floor(diffMs / 1000);

      if (totalSeconds <= 0) {
        setClockSession(prev => prev ? { ...prev, is_overtime: true, remaining_seconds: -Math.abs(totalSeconds) } : null);
        setTimerDisplay(formatSeconds(-Math.abs(totalSeconds)));
      } else {
        setClockSession(prev => prev ? { ...prev, remaining_seconds: totalSeconds } : null);
        setTimerDisplay(formatSeconds(totalSeconds));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [clockSession]);

  const formatSeconds = (seconds: number): string => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;
    const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return isNegative ? `-${formatted}` : formatted;
  };

  const getTodayAssignedShift = () => {
    return mockShifts[0];
  };

  const handleClockIn = () => {
    const shift = getTodayAssignedShift();
    const now = new Date();
    const clockInTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setClockSession({
      employee_id: currentEmployee.id,
      employee_name: currentEmployee.name,
      shift_id: shift.id,
      shift_name: shift.name,
      shift_start: shift.start,
      shift_end: shift.end,
      clock_in_time: clockInTime,
      remaining_seconds: 8 * 3600,
      is_overtime: false,
    });

    toast({
      title: 'Success',
      description: `Clocked in at ${clockInTime}`,
    });
  };

  const handleClockOut = () => {
    if (!clockSession) return;

    const now = new Date();
    const clockOutTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const [inHour, inMin] = clockSession.clock_in_time.split(':').map(Number);
    const [outHour, outMin] = clockOutTime.split(':').map(Number);

    const totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
    const totalHours = (totalMinutes - 30) / 60;

    const newRecord: AttendanceRecord = {
      id: `ATT-${attendanceRecords.length + 1}`,
      employee_id: currentEmployee.id,
      employee_name: currentEmployee.name,
      date: filterDate,
      shift_id: clockSession.shift_id,
      shift_name: clockSession.shift_name,
      shift_start: clockSession.shift_start,
      shift_end: clockSession.shift_end,
      time_in: clockSession.clock_in_time,
      time_out: clockOutTime,
      break_duration: 30,
      total_hours: Math.round(totalHours * 100) / 100,
      overtime_hours: Math.max(0, totalHours - 8),
      status: totalHours > 8 ? 'Overtime' : (parseInt(clockSession.clock_in_time) > parseInt(clockSession.shift_start) ? 'Late' : 'Present'),
    };

    setAttendanceRecords([...attendanceRecords, newRecord]);
    setClockSession(null);
    setTimerDisplay('00:00:00');

    toast({
      title: 'Success',
      description: `Clocked out at ${clockOutTime}. Total hours: ${newRecord.total_hours}`,
    });
  };

  const handleBreakStart = () => {
    setClockSession(prev => prev ? { ...prev, break_start: currentTime } : null);
    toast({
      title: 'Break Started',
      description: `Break started at ${currentTime}`,
    });
  };

  const handleBreakEnd = () => {
    setClockSession(prev => prev ? { ...prev, break_end: currentTime } : null);
    toast({
      title: 'Break Ended',
      description: `Break ended at ${currentTime}`,
    });
  };

  const handleRequestCorrection = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setCorrectionReason('');
    setCorrectionDialogOpen(true);
  };

  const handleSubmitCorrection = () => {
    if (!selectedRecord) return;

    setAttendanceRecords(
      attendanceRecords.map(r =>
        r.id === selectedRecord.id
          ? { ...r, correction_requested: true, correction_reason: correctionReason }
          : r
      )
    );
    setCorrectionReason('');
    setSelectedRecord(null);
    setCorrectionDialogOpen(false);

    toast({
      title: 'Success',
      description: 'Correction request submitted for approval',
    });
  };

  useEffect(() => {
    let filtered = attendanceRecords;

    if (filterDate) {
      filtered = filtered.filter(r => r.date === filterDate);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  }, [filterDate, filterStatus, searchTerm, attendanceRecords]);

  const getTimerColor = (): string => {
    if (!clockSession) return 'text-gray-500';
    if (clockSession.is_overtime) return 'text-red-600';
    const minutes = clockSession.remaining_seconds / 60;
    if (minutes < 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'Absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      case 'On Leave':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Overtime':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300';
    }
  };

  const summaryStats = {
    presentToday: attendanceRecords.filter(r => r.date === filterDate && r.status === 'Present').length,
    lateToday: attendanceRecords.filter(r => r.date === filterDate && r.status === 'Late').length,
    absentToday: attendanceRecords.filter(r => r.date === filterDate && r.status === 'Absent').length,
    onLeaveToday: attendanceRecords.filter(r => r.date === filterDate && r.status === 'On Leave').length,
    overtimeToday: attendanceRecords.filter(r => r.date === filterDate && r.status === 'Overtime').length,
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Management ⏰</h1>
        <p className="text-muted-foreground mt-1">Real-time clock-in/out system with attendance tracking</p>
      </div>

      <Card className="border-2 border-blue-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-800/50 dark:to-slate-800/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-slate-100">
            <Clock className="w-5 h-5" />
            Clock-In/Out Panel
          </CardTitle>
          <CardDescription className="dark:text-slate-400">Real-time attendance tracking for {currentEmployee.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="dark:bg-slate-700/40">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Employee</p>
                  <p className="text-lg font-bold text-foreground dark:text-slate-100">{currentEmployee.name}</p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">{currentEmployee.department}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-700/40">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Current Time</p>
                  <p className="text-2xl font-mono font-bold text-foreground dark:text-slate-100">{currentTime}</p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">{currentDate}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-700/40">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Assigned Shift</p>
                  <p className="text-lg font-bold text-foreground dark:text-slate-100">{getTodayAssignedShift().name}</p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">{getTodayAssignedShift().start} - {getTodayAssignedShift().end}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-slate-800/60 dark:border-slate-600 border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground dark:text-slate-300">
                  {clockSession ? 'Time Remaining' : 'No active session'}
                </p>
                <div className={`text-6xl font-mono font-bold ${getTimerColor()} dark:text-slate-100`}>
                  {timerDisplay}
                </div>
                {clockSession?.is_overtime && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">OVERTIME</Badge>
                )}
                {clockSession && (
                  <p className="text-sm text-muted-foreground dark:text-slate-400">
                    Clocked in at {clockSession.clock_in_time}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            {!clockSession ? (
              <Button
                onClick={handleClockIn}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Clock In
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleClockOut}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
                {!clockSession.break_start && (
                  <Button
                    onClick={handleBreakStart}
                    size="lg"
                    variant="outline"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Start Break
                  </Button>
                )}
                {clockSession.break_start && !clockSession.break_end && (
                  <Button
                    onClick={handleBreakEnd}
                    size="lg"
                    variant="outline"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    End Break
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4 dark:text-slate-100">Today's Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-slate-800/50 dark:border-slate-700" onClick={() => setFilterStatus('Present')}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Present</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summaryStats.presentToday}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-slate-800/50 dark:border-slate-700" onClick={() => setFilterStatus('Late')}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Late</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summaryStats.lateToday}</p>
                </div>
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-slate-800/50 dark:border-slate-700" onClick={() => setFilterStatus('Absent')}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Absent</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summaryStats.absentToday}</p>
                </div>
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-slate-800/50 dark:border-slate-700" onClick={() => setFilterStatus('On Leave')}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">On Leave</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summaryStats.onLeaveToday}</p>
                </div>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-slate-800/50 dark:border-slate-700" onClick={() => setFilterStatus('Overtime')}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Overtime</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summaryStats.overtimeToday}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-slate-100">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium dark:text-slate-100">Date</label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium dark:text-slate-100">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Overtime">Overtime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium dark:text-slate-100">Search Employee</label>
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterDate(format(new Date(), 'yyyy-MM-dd'));
                  setFilterStatus('all');
                  setSearchTerm('');
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">Attendance Records</CardTitle>
          <CardDescription className="dark:text-slate-400">
            Showing {filteredRecords.length} record(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-slate-600">
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Date</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Shift</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Time In</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Time Out</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Total Hours</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Overtime</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Status</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-slate-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-muted/50 dark:border-slate-700 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4 dark:text-slate-200">{record.employee_name}</td>
                    <td className="py-3 px-4 dark:text-slate-200">{record.date}</td>
                    <td className="py-3 px-4 dark:text-slate-200">{record.shift_name}</td>
                    <td className="py-3 px-4 dark:text-slate-200">{record.time_in || '-'}</td>
                    <td className="py-3 px-4 dark:text-slate-200">{record.time_out || '-'}</td>
                    <td className="py-3 px-4 dark:text-slate-200">{record.total_hours}h</td>
                    <td className="py-3 px-4 dark:text-slate-200">
                      {record.overtime_hours > 0 ? `${record.overtime_hours}h` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Dialog open={correctionDialogOpen && selectedRecord?.id === record.id} onOpenChange={setCorrectionDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestCorrection(record)}
                          >
                            Request Correction
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Attendance Correction</DialogTitle>
                            <DialogDescription>
                              {record.employee_name} - {record.date}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Current Record</label>
                              <p className="text-sm text-muted-foreground">
                                In: {record.time_in}, Out: {record.time_out}, Total: {record.total_hours}h
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Reason for Correction *</label>
                              <Textarea
                                value={correctionReason}
                                onChange={(e) => setCorrectionReason(e.target.value)}
                                placeholder="Explain why this correction is needed..."
                                rows={3}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setCorrectionDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSubmitCorrection}>
                                Submit Correction
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No attendance records found matching your filters.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
