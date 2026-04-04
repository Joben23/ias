import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  full_name: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  total_hours: number | null;
  status: string;
}

type FilterPeriod = 'today' | 'week';

export default function Hr3AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);

      let query = (supabase.from('attendance_logs' as any).select('*') as any);

      // Apply date filter
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterPeriod === 'today') {
        const dateStr = today.toISOString().split('T')[0];
        query = query.eq('date', dateStr);
      } else if (filterPeriod === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 6);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];
        query = query
          .gte('date', weekAgoStr)
          .lte('date', todayStr);
      }

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query.order('date', { ascending: false }).order('full_name');

      if (error) throw error;

      setRecords((data || []) as AttendanceRecord[]);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [filterPeriod, filterStatus]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

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

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const exportData = () => {
    const headers = ['Employee Name', 'Date', 'Time In', 'Time Out', 'Total Hours', 'Status'];
    const rows = records.map((r) => [
      r.full_name,
      formatDate(r.date),
      formatTime(r.time_in),
      formatTime(r.time_out),
      r.total_hours ? r.total_hours.toFixed(2) : 'N/A',
      r.status,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${filterPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Logs</h1>
        <p className="text-muted-foreground">
          View and manage employee attendance records
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Filter by Period</label>
          <Select value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as FilterPeriod)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Filter by Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={exportData} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {filterPeriod === 'today' && 'Today\'s attendance'}
            {filterPeriod === 'week' && 'This week\'s attendance'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading attendance records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-medium text-sm">Employee Name</th>
                    <th className="text-center py-3 px-3 font-medium text-sm">Date</th>
                    <th className="text-center py-3 px-3 font-medium text-sm">Time In</th>
                    <th className="text-center py-3 px-3 font-medium text-sm">Time Out</th>
                    <th className="text-center py-3 px-3 font-medium text-sm">Total Hours</th>
                    <th className="text-center py-3 px-3 font-medium text-sm">Status</th>
                    <th className="text-right py-3 px-3 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length > 0 ? (
                    records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-3 text-sm">{record.full_name}</td>
                        <td className="py-3 px-3 text-sm text-center">{formatDate(record.date)}</td>
                        <td className="py-3 px-3 text-sm text-center">{formatTime(record.time_in)}</td>
                        <td className="py-3 px-3 text-sm text-center">{formatTime(record.time_out)}</td>
                        <td className="py-3 px-3 text-sm text-center">
                          {record.total_hours ? `${record.total_hours.toFixed(2)} hrs` : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-sm text-center flex items-center justify-center gap-2">
                          {getStatusIcon(record.status)}
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem disabled>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                Edit Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
