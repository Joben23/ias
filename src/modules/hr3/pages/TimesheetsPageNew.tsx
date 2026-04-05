import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Edit3,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

interface TimesheetEntry {
  date: string;
  day_name: string;
  clock_in: string;
  clock_out: string;
  total_hours: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  notes?: string;
}

interface TimesheetSummary {
  week_start: string;
  week_end: string;
  total_hours: number;
  scheduled_hours: number;
  overtime_hours: number;
  status: 'Approved' | 'Pending Review' | 'Submitted';
  last_updated: string;
}

export default function TimesheetsPageNew() {
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'stats'>('current');
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);

  // Sample data
  const currentTimesheet: TimesheetEntry[] = [
    {
      date: '2026-04-28',
      day_name: 'Monday',
      clock_in: '08:05',
      clock_out: '17:10',
      total_hours: 9.08,
      status: 'Approved',
    },
    {
      date: '2026-04-29',
      day_name: 'Tuesday',
      clock_in: '07:55',
      clock_out: '17:00',
      total_hours: 9.08,
      status: 'Approved',
    },
    {
      date: '2026-04-30',
      day_name: 'Wednesday',
      clock_in: '08:00',
      clock_out: '17:05',
      total_hours: 9.08,
      status: 'Approved',
    },
    {
      date: '2026-05-01',
      day_name: 'Thursday',
      clock_in: '08:10',
      clock_out: '18:15',
      total_hours: 10.08,
      status: 'Pending',
      notes: 'Worked overtime for project deadline',
    },
    {
      date: '2026-05-02',
      day_name: 'Friday',
      clock_in: '08:00',
      clock_out: '17:00',
      total_hours: 9.0,
      status: 'Pending',
    },
  ];

  const timesheet: TimesheetSummary = {
    week_start: '2026-04-28',
    week_end: '2026-05-02',
    total_hours: 46.32,
    scheduled_hours: 40,
    overtime_hours: 6.32,
    status: 'Pending Review',
    last_updated: '2026-05-02T18:00:00',
  };

  const previousTimesheets = [
    {
      week: '2026-04-21 to 2026-04-25',
      hours: 40.5,
      status: 'Approved',
    },
    {
      week: '2026-04-14 to 2026-04-18',
      hours: 40.0,
      status: 'Approved',
    },
    {
      week: '2026-04-07 to 2026-04-11',
      hours: 42.25,
      status: 'Approved',
    },
    {
      week: '2026-03-31 to 2026-04-04',
      hours: 40.0,
      status: 'Approved',
    },
  ];

  const statusColors: Record<string, string> = {
    'Approved': 'bg-green-100 text-green-700',
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Pending Review': 'bg-yellow-100 text-yellow-700',
    'Submitted': 'bg-blue-100 text-blue-700',
  };

  const handleSubmitTimesheet = () => {
    alert('Submit timesheet for approval');
  };

  const handleEditEntry = (entryDate: string) => {
    setEditingEntry(editingEntry === entryDate ? null : entryDate);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Timesheets ⏱️
        </h1>
        <p className="text-muted-foreground mt-1">Track your work hours and submit timesheets for approval</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {['current', 'history', 'stats'].map(tab => (
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

      {/* Current Tab */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Timesheet Header Summary */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Week Total Hours</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{timesheet.total_hours}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled Hours</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{timesheet.scheduled_hours}h</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overtime Hours</p>
                    <p className="text-2xl font-bold text-orange-700 mt-1">+{timesheet.overtime_hours}h</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusColors[timesheet.status]} style={{ marginTop: '8px' }}>
                      {timesheet.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert */}
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Timesheet pending review. 2 entries still pending manager approval. Click Submit to finalize.
            </AlertDescription>
          </Alert>

          {/* Daily Entries */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">
                Week of {format(new Date(timesheet.week_start), 'MMM d')} - {format(new Date(timesheet.week_end), 'MMM d, yyyy')}
              </h3>
              <div className="text-xs text-muted-foreground">
                Last updated: {format(new Date(timesheet.last_updated), 'MMM d, h:mm a')}
              </div>
            </div>

            <div className="space-y-3">
              {currentTimesheet.map(entry => (
                <Card key={entry.date}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">{entry.day_name}</h4>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.date), 'MMM d, yyyy')}
                          </span>
                          <Badge className={statusColors[entry.status]}>
                            {entry.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-5 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-muted-foreground text-xs">Clock In</p>
                            <p className="font-semibold text-foreground">{entry.clock_in}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Clock Out</p>
                            <p className="font-semibold text-foreground">{entry.clock_out}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Total Hours</p>
                            <p className="font-bold text-foreground text-lg">{entry.total_hours}h</p>
                          </div>
                          {entry.notes && (
                            <div className="col-span-2">
                              <p className="text-muted-foreground text-xs">Notes</p>
                              <p className="text-foreground text-xs">{entry.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditEntry(entry.date)}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action */}
          <Button onClick={handleSubmitTimesheet} size="lg" className="w-full">
            <CheckCircle className="w-4 h-4 mr-2" />
            Submit Timesheet for Approval
          </Button>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {previousTimesheets.map((ts, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{ts.week}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{ts.hours}h</p>
                      <Badge className={statusColors[ts.status]} style={{ marginTop: '8px' }}>
                        {ts.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Hours Summary</CardTitle>
              <CardDescription>April 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-3xl font-bold text-blue-700 mt-2">162.5h</p>
                  <p className="text-xs text-muted-foreground mt-1">Regular + overtime</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-muted-foreground">Regular Hours</p>
                  <p className="text-3xl font-bold text-green-700 mt-2">160h</p>
                  <p className="text-xs text-muted-foreground mt-1">4 weeks × 40h</p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-muted-foreground">Overtime Hours</p>
                  <p className="text-3xl font-bold text-orange-700 mt-2">+2.5h</p>
                  <p className="text-xs text-muted-foreground mt-1">1.6% above target</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Weekly Breakdown</h4>
                <div className="space-y-2">
                  {previousTimesheets.map((ts, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-muted-foreground">{ts.week}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(ts.hours / 44) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-foreground w-12 text-right">{ts.hours}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export */}
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Monthly Report
          </Button>
        </div>
      )}
    </div>
  );
}
