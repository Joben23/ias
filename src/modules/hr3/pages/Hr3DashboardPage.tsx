import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  averageHoursWorked: number;
}

interface TodayAttendance {
  employee_id: string;
  full_name: string;
  time_in: string | null;
  time_out: string | null;
  status: string;
  total_hours: number | null;
}

export default function Hr3DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    averageHoursWorked: 0,
  });
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all employees
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, full_name')
        .eq('status', 'Active');

      if (empError) throw empError;

      const totalEmployees = employees?.length || 0;

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's attendance logs
      const { data: attendance, error: attError } = await (supabase
        .from('attendance_logs' as any)
        .select('*')
        .eq('date', today) as any);

      if (attError) throw attError;

      // Calculate stats
      let presentCount = 0;
      let lateCount = 0;
      let totalHours = 0;
      const attendanceMap: Record<string, TodayAttendance> = {};

      attendance?.forEach((log: any) => {
        if (log.status === 'present') presentCount++;
        if (log.status === 'late') lateCount++;
        if (log.total_hours) totalHours += log.total_hours;

        attendanceMap[log.employee_id] = {
          employee_id: log.employee_id,
          full_name: log.full_name || '',
          time_in: log.time_in,
          time_out: log.time_out,
          status: log.status,
          total_hours: log.total_hours,
        };
      });

      const absentCount = totalEmployees - presentCount - lateCount;
      const avgHours = attendance && attendance.length > 0 ? totalHours / attendance.length : 0;

      // Enrich with employee names
      if (employees) {
        employees.forEach((emp) => {
          if (!attendanceMap[emp.id]) {
            attendanceMap[emp.id] = {
              employee_id: emp.id,
              full_name: emp.full_name,
              time_in: null,
              time_out: null,
              status: 'absent',
              total_hours: null,
            };
          }
        });
      }

      setStats({
        totalEmployees,
        presentToday: presentCount,
        lateToday: lateCount,
        absentToday: absentCount,
        averageHoursWorked: avgHours,
      });

      setTodayAttendance(Object.values(attendanceMap).slice(0, 10));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500/10 text-green-700 border-0">Present</Badge>;
      case 'late':
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-0">Late</Badge>;
      case 'absent':
        return <Badge className="bg-red-500/10 text-red-700 border-0">Absent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'late':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'absent':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Dashboard</h1>
        <p className="text-muted-foreground">
          Track employee time and attendance in real-time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEmployees > 0
                ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
                : 0}
              % attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Today</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lateToday}</div>
            <p className="text-xs text-muted-foreground">Arrived after 9:00 AM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absentToday}</div>
            <p className="text-xs text-muted-foreground">No check-in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.averageHoursWorked.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Hours worked today</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>Real-time attendance status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading attendance data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAttendance.length > 0 ? (
                <div className="space-y-3">
                  {todayAttendance.map((record) => (
                    <div key={record.employee_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(record.status)}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{record.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.time_in ? new Date(record.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not checked in'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(record.status)}
                        {record.total_hours && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {record.total_hours.toFixed(1)} hrs
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
