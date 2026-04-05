import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Edit3,
  Trash2,
  Plus,
  AlertCircle,
  Check,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface Schedule {
  id: string;
  employee_id: string;
  employee_name: string;
  position: string;
  date: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  status: 'Scheduled' | 'Changed' | 'Cancelled' | 'Completed';
  notes?: string;
}

interface ScheduleBlock {
  date: string;
  day_name: string;
  total_scheduled: number;
  morning_count: number;
  afternoon_count: number;
  night_count: number;
}

export default function ScheduleManagementPageNew() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'calendar' | 'bulk'>('schedule');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState('week1');

  // Sample data
  const schedules: Schedule[] = [
    {
      id: 'SCH001',
      employee_id: 'EMP001',
      employee_name: 'John Doe',
      position: 'Senior Developer',
      date: '2026-04-28',
      shift_name: 'Flexible Shift',
      start_time: '08:00',
      end_time: '17:00',
      status: 'Scheduled',
    },
    {
      id: 'SCH002',
      employee_id: 'EMP002',
      employee_name: 'Jane Smith',
      position: 'Product Manager',
      date: '2026-04-28',
      shift_name: 'Flexible Shift',
      start_time: '08:00',
      end_time: '17:00',
      status: 'Scheduled',
    },
    {
      id: 'SCH003',
      employee_id: 'EMP003',
      employee_name: 'Mike Johnson',
      position: 'Designer',
      date: '2026-04-28',
      shift_name: 'Morning Shift',
      start_time: '06:00',
      end_time: '14:00',
      status: 'Changed',
      notes: 'Changed from Afternoon to Morning',
    },
    {
      id: 'SCH004',
      employee_id: 'EMP004',
      employee_name: 'Sarah Wilson',
      position: 'QA Engineer',
      date: '2026-04-28',
      shift_name: 'Afternoon Shift',
      start_time: '14:00',
      end_time: '22:00',
      status: 'Scheduled',
    },
    {
      id: 'SCH005',
      employee_id: 'EMP005',
      employee_name: 'Alice Chen',
      position: 'DevOps Engineer',
      date: '2026-04-29',
      shift_name: 'Night Shift',
      start_time: '22:00',
      end_time: '06:00',
      status: 'Cancelled',
      notes: 'Employee requested day off',
    },
  ];

  const weekSchedule: ScheduleBlock[] = [
    {
      date: '2026-04-28',
      day_name: 'Monday',
      total_scheduled: 35,
      morning_count: 10,
      afternoon_count: 12,
      night_count: 8,
    },
    {
      date: '2026-04-29',
      day_name: 'Tuesday',
      total_scheduled: 33,
      morning_count: 9,
      afternoon_count: 11,
      night_count: 7,
    },
    {
      date: '2026-04-30',
      day_name: 'Wednesday',
      total_scheduled: 36,
      morning_count: 11,
      afternoon_count: 12,
      night_count: 8,
    },
    {
      date: '2026-05-01',
      day_name: 'Thursday',
      total_scheduled: 34,
      morning_count: 10,
      afternoon_count: 11,
      night_count: 8,
    },
    {
      date: '2026-05-02',
      day_name: 'Friday',
      total_scheduled: 32,
      morning_count: 9,
      afternoon_count: 11,
      night_count: 7,
    },
  ];

  const statusColors: Record<string, string> = {
    'Scheduled': 'bg-green-100 text-green-700',
    'Changed': 'bg-blue-100 text-blue-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Completed': 'bg-gray-100 text-gray-700',
  };

  const handleEditSchedule = (scheduleId: string) => {
    setEditingId(editingId === scheduleId ? null : scheduleId);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    alert(`Delete schedule ${scheduleId}`);
  };

  const handleGenerateSchedule = () => {
    alert('Generate next week schedule');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Schedule Management 📅
        </h1>
        <p className="text-muted-foreground mt-1">Create and manage employee work schedules</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border justify-between">
        <div className="flex gap-4">
          {['schedule', 'calendar', 'bulk'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-2 font-medium text-sm transition-colors capitalize ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'bulk' ? 'Bulk Actions' : tab}
            </button>
          ))}
        </div>
        {activeTab === 'schedule' && (
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Schedule
          </Button>
        )}
      </div>

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Calendar className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Week of April 28 - May 2, 2026 • {schedules.filter(s => s.status !== 'Cancelled').length} scheduled • {schedules.filter(s => s.status === 'Cancelled').length} cancelled
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {schedules.map(schedule => (
              <Card key={schedule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{schedule.employee_name}</h4>
                        <Badge className={statusColors[schedule.status]}>
                          {schedule.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{schedule.position}</p>

                      <div className="grid grid-cols-5 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-muted-foreground text-xs">Date</p>
                          <p className="font-semibold text-foreground">
                            {format(new Date(schedule.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Shift</p>
                          <p className="font-semibold text-foreground">{schedule.shift_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Time</p>
                          <p className="font-semibold text-foreground">
                            {schedule.start_time} - {schedule.end_time}
                          </p>
                        </div>
                        <div>
                          {schedule.notes && (
                            <>
                              <p className="text-muted-foreground text-xs">Notes</p>
                              <p className="text-foreground text-xs">{schedule.notes}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditSchedule(schedule.id)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-red-600 border-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={selectedWeek === 'week1' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWeek('week1')}
            >
              Week of Apr 28
            </Button>
            <Button
              variant={selectedWeek === 'week2' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWeek('week2')}
            >
              Week of May 5
            </Button>
          </div>

          <div className="space-y-3">
            {weekSchedule.map(day => (
              <Card key={day.date}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-semibold text-foreground">{day.day_name}</h4>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(day.date), 'MMM d, yyyy')}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="p-3 bg-yellow-50 rounded">
                          <p className="text-xs text-muted-foreground">Morning Shift</p>
                          <p className="font-bold text-yellow-700 text-lg">{day.morning_count}</p>
                          <p className="text-xs text-muted-foreground">employees</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded">
                          <p className="text-xs text-muted-foreground">Afternoon Shift</p>
                          <p className="font-bold text-blue-700 text-lg">{day.afternoon_count}</p>
                          <p className="text-xs text-muted-foreground">employees</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded">
                          <p className="text-xs text-muted-foreground">Night Shift</p>
                          <p className="font-bold text-purple-700 text-lg">{day.night_count}</p>
                          <p className="text-xs text-muted-foreground">employees</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-bold text-green-700 text-lg">{day.total_scheduled}</p>
                          <p className="text-xs text-muted-foreground">scheduled</p>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      View Day
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Actions Tab */}
      {activeTab === 'bulk' && (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Use bulk actions to generate, copy, or modify schedules for multiple employees at once
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" size="lg" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Generate Schedule</p>
                <p className="text-sm text-muted-foreground">Create next week's schedule automatically</p>
              </div>
            </Button>

            <Button variant="outline" size="lg" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Copy Schedule</p>
                <p className="text-sm text-muted-foreground">Copy this week to next week</p>
              </div>
            </Button>

            <Button variant="outline" size="lg" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Swap Shifts</p>
                <p className="text-sm text-muted-foreground">Swap shifts between employees</p>
              </div>
            </Button>

            <Button variant="outline" size="lg" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Balance Workload</p>
                <p className="text-sm text-muted-foreground">Optimize shift distribution</p>
              </div>
            </Button>

            <Button variant="outline" size="lg" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Export Schedule</p>
                <p className="text-sm text-muted-foreground">Download schedule as PDF/Excel</p>
              </div>
            </Button>

            <Button variant="outline" size="lg" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Send Notifications</p>
                <p className="text-sm text-muted-foreground">Notify employees of their schedule</p>
              </div>
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerateSchedule} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Next Week Schedule
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
