import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  LogIn,
  LogOut,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceRecord {
  date: string;
  time_in?: string;
  time_out?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Leave';
  total_hours?: number;
  notes?: string;
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'stats'>('today');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);

  // Sample data
  useEffect(() => {
    // Update current time
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Sample today's attendance
    const today = new Date().toISOString().split('T')[0];
    setTodayAttendance({
      date: today,
      time_in: '09:05',
      status: 'Late',
    });
    setIsCheckedIn(true);

    // Sample history
    const history: AttendanceRecord[] = [
      {
        date: '2026-04-04',
        time_in: '09:00',
        time_out: '17:30',
        status: 'Present',
        total_hours: 8.5,
      },
      {
        date: '2026-04-03',
        time_in: '09:15',
        time_out: '17:45',
        status: 'Late',
        total_hours: 8.5,
      },
      {
        date: '2026-04-02',
        status: 'Leave',
        notes: 'Annual Leave',
      },
      {
        date: '2026-04-01',
        time_in: '08:55',
        time_out: '17:15',
        status: 'Present',
        total_hours: 8.33,
      },
    ];
    setAttendanceHistory(history);

    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setIsCheckedIn(true);
    setTodayAttendance(prev => prev ? { ...prev, time_in: time, status: time > '09:00' ? 'Late' : 'Present' } : null);
    alert(`Checked in at ${time}`);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const [inHour, inMin] = (todayAttendance?.time_in || '09:00').split(':').map(Number);
    const [outHour, outMin] = time.split(':').map(Number);
    const hours = outHour - inHour + (outMin - inMin) / 60;

    setTodayAttendance(prev => prev ?
      { ...prev, time_out: time, total_hours: Math.round(hours * 100) / 100 }
      : null
    );
    setIsCheckedIn(false);
    alert(`Checked out at ${time}`);
  };

  const presentCount = attendanceHistory.filter(r => r.status === 'Present').length;
  const lateCount = attendanceHistory.filter(r => r.status === 'Late').length;
  const leaveCount = attendanceHistory.filter(r => r.status === 'Leave').length;
  const totalHours = attendanceHistory
    .filter(r => r.total_hours)
    .reduce((sum, r) => sum + (r.total_hours || 0), 0);

  const statusColors: Record<string, string> = {
    'Present': 'bg-green-100 text-green-700',
    'Late': 'bg-orange-100 text-orange-700',
    'Absent': 'bg-red-100 text-red-700',
    'Leave': 'bg-blue-100 text-blue-700',
  };

  const statusIcons: Record<string, any> = {
    'Present': <CheckCircle className="w-5 h-5 text-green-600" />,
    'Late': <AlertCircle className="w-5 h-5 text-orange-600" />,
    'Absent': <AlertCircle className="w-5 h-5 text-red-600" />,
    'Leave': <Calendar className="w-5 h-5 text-blue-600" />,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Attendance Tracking ⏱️
        </h1>
        <p className="text-muted-foreground mt-1">Track your daily attendance and work hours</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {['today', 'history', 'stats'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 px-2 font-medium text-sm transition-colors capitalize ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Today Tab */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Current Time */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Time</p>
                <p className="text-4xl font-bold text-foreground mt-2">{currentTime}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Today's Attendance */}
          {todayAttendance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {statusIcons[todayAttendance.status]}
                  Today's Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={statusColors[todayAttendance.status]}>
                    {todayAttendance.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Time In</p>
                    <div className="flex items-center gap-2 mt-2">
                      <LogIn className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-foreground">
                        {todayAttendance.time_in || '—'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Out</p>
                    <div className="flex items-center gap-2 mt-2">
                      <LogOut className="w-5 h-5 text-red-600" />
                      <p className="font-semibold text-foreground">
                        {todayAttendance.time_out || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Hours Worked</p>
                  <p className="font-semibold text-foreground mt-2">
                    {todayAttendance.total_hours || '—'} hours
                  </p>
                </div>

                {todayAttendance.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium text-foreground mt-2">{todayAttendance.notes}</p>
                  </div>
                )}

                {/* Check In/Out Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCheckIn}
                    disabled={isCheckedIn}
                    className="flex-1"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Check In
                  </Button>
                  <Button
                    onClick={handleCheckOut}
                    disabled={!isCheckedIn}
                    variant="outline"
                    className="flex-1"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Check Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Alert */}
          {todayAttendance?.status === 'Late' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You clocked in at {todayAttendance.time_in}. Remember to notify your manager if there are any issues.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {attendanceHistory.map((record, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold text-foreground">
                          {format(new Date(record.date), 'MMM d, yyyy')}
                        </p>
                        <Badge className={statusColors[record.status]}>
                          {record.status}
                        </Badge>
                      </div>

                      <div className="flex gap-4 text-sm text-muted-foreground mt-3 ml-6">
                        {record.time_in && (
                          <div className="flex items-center gap-1">
                            <LogIn className="w-4 h-4" />
                            {record.time_in}
                          </div>
                        )}
                        {record.time_out && (
                          <div className="flex items-center gap-1">
                            <LogOut className="w-4 h-4" />
                            {record.time_out}
                          </div>
                        )}
                        {record.total_hours && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {record.total_hours}h
                          </div>
                        )}
                      </div>

                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-2 ml-6">Note: {record.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Present Days</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{presentCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Late Days</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{lateCount}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Leave Days</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{leaveCount}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {Math.round(totalHours * 10) / 10}h
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary (Last 10 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className="font-semibold text-foreground">
                    {Math.round((presentCount / attendanceHistory.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(presentCount / attendanceHistory.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
