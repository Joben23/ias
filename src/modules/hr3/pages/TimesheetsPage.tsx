import { useState } from 'react';
import { Clock, Send, Edit2, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface TimesheetEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  week_start: string;
  week_end: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  total_hours: number;
  daily_hours: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  projects: {
    name: string;
    hours: number;
  }[];
  notes: string;
  submitted_date?: string;
  approved_by?: string;
  rejection_reason?: string;
}

export default function TimesheetsPage() {
  const mockTimesheets: TimesheetEntry[] = [
    {
      id: 'TS-001',
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      week_start: '2026-05-03',
      week_end: '2026-05-09',
      status: 'Submitted',
      total_hours: 40,
      daily_hours: {
        monday: 8,
        tuesday: 8,
        wednesday: 8,
        thursday: 8,
        friday: 8,
        saturday: 0,
        sunday: 0,
      },
      projects: [
        { name: 'Backend API Microservices', hours: 32 },
        { name: 'Database Optimization', hours: 8 },
      ],
      notes: 'Completed sprint tasks on time',
      submitted_date: '2026-05-09',
    },
    {
      id: 'TS-002',
      employee_id: 'HOS-IT-002',
      employee_name: 'Dr. Sarah Mitchell',
      week_start: '2026-05-03',
      week_end: '2026-05-09',
      status: 'Approved',
      total_hours: 40,
      daily_hours: {
        monday: 8,
        tuesday: 8,
        wednesday: 8,
        thursday: 8,
        friday: 8,
        saturday: 0,
        sunday: 0,
      },
      projects: [
        { name: 'Infrastructure Management', hours: 24 },
        { name: 'Security Audit', hours: 16 },
      ],
      notes: 'Security audit completed',
      submitted_date: '2026-05-09',
      approved_by: 'Manager Admin',
    },
    {
      id: 'TS-003',
      employee_id: 'HOS-IT-003',
      employee_name: 'Michael Chen',
      week_start: '2026-05-03',
      week_end: '2026-05-09',
      status: 'Draft',
      total_hours: 35,
      daily_hours: {
        monday: 7,
        tuesday: 7,
        wednesday: 8,
        thursday: 7,
        friday: 6,
        saturday: 0,
        sunday: 0,
      },
      projects: [
        { name: 'Mobile Development', hours: 25 },
        { name: 'Bug Fixes', hours: 10 },
      ],
      notes: '',
    },
    {
      id: 'TS-004',
      employee_id: 'HOS-IT-004',
      employee_name: 'Jessica Martinez',
      week_start: '2026-04-26',
      week_end: '2026-05-02',
      status: 'Rejected',
      total_hours: 42,
      daily_hours: {
        monday: 9,
        tuesday: 8,
        wednesday: 8,
        thursday: 9,
        friday: 8,
        saturday: 0,
        sunday: 0,
      },
      projects: [
        { name: 'QA Testing', hours: 32 },
        { name: 'Documentation', hours: 10 },
      ],
      notes: 'Hours exceeded normal working hours',
      rejection_reason: 'Daily hours exceed 8-hour limit on some days. Please adjust and resubmit.',
    },
  ];

  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(mockTimesheets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TimesheetEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const { toast } = useToast();

  const handleSubmitTimesheet = (id: string) => {
    setTimesheets(timesheets.map(ts => ts.id === id
      ? {
        ...ts,
        status: 'Submitted',
        submitted_date: new Date().toISOString().split('T')[0],
      }
      : ts
    ));
    toast({
      title: 'Success',
      description: 'Timesheet submitted for approval',
    });
  };

  const handleApproveTimesheet = (id: string) => {
    setTimesheets(timesheets.map(ts => ts.id === id
      ? {
        ...ts,
        status: 'Approved',
        approved_by: 'Current Manager',
      }
      : ts
    ));
    toast({
      title: 'Success',
      description: 'Timesheet approved',
    });
  };

  const handleRejectTimesheet = (id: string, reason: string) => {
    if (!reason) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }
    setTimesheets(timesheets.map(ts => ts.id === id
      ? {
        ...ts,
        status: 'Rejected',
        rejection_reason: reason,
      }
      : ts
    ));
    toast({
      title: 'Success',
      description: 'Timesheet rejected',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export',
      description: 'Timesheets exported to PDF/Excel',
    });
  };

  const filteredTimesheets = timesheets.filter(ts =>
    !filterStatus || ts.status === filterStatus
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    pending: timesheets.filter(ts => ts.status === 'Submitted').length,
    approved: timesheets.filter(ts => ts.status === 'Approved').length,
    rejected: timesheets.filter(ts => ts.status === 'Rejected').length,
    draft: timesheets.filter(ts => ts.status === 'Draft').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Timesheets</h1>
          <p className="text-muted-foreground mt-1">Track and manage employee timesheets</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {stats.approved}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              {stats.rejected}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timesheets List */}
      <div className="space-y-4">
        {filteredTimesheets.map(timesheet => (
          <Card key={timesheet.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{timesheet.employee_name}</CardTitle>
                  <CardDescription>
                    {timesheet.week_start} to {timesheet.week_end}
                  </CardDescription>
                </div>
                <Badge className={statusColor(timesheet.status)}>{timesheet.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Daily Hours */}
              <div>
                <h3 className="font-semibold mb-3">Daily Hours</h3>
                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(timesheet.daily_hours).map(([day, hours]) => (
                    <div key={day} className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground capitalize">{day.slice(0, 3)}</p>
                      <p className="font-semibold">{hours}h</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h3 className="font-semibold mb-3">Projects</h3>
                <div className="space-y-2">
                  {timesheet.projects.map((project, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>{project.name}</span>
                      <span className="font-semibold">{project.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Hours */}
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="font-semibold">Total Hours</span>
                <span className="text-2xl font-bold text-primary">{timesheet.total_hours}h</span>
              </div>

              {/* Notes and Rejection Reason */}
              {timesheet.notes && (
                <div>
                  <h3 className="font-semibold mb-1 text-sm">Notes</h3>
                  <p className="text-sm text-muted-foreground">{timesheet.notes}</p>
                </div>
              )}
              {timesheet.rejection_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold mb-1 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Rejection Reason
                  </h3>
                  <p className="text-sm text-red-700">{timesheet.rejection_reason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {timesheet.status === 'Draft' && (
                  <Button onClick={() => handleSubmitTimesheet(timesheet.id)}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </Button>
                )}
                {timesheet.status === 'Submitted' && (
                  <>
                    <Button onClick={() => handleApproveTimesheet(timesheet.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Timesheet</DialogTitle>
                          <DialogDescription>
                            Provide a reason for rejecting this timesheet
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea placeholder="Reason for rejection..." id="rejection-reason" />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button
                              onClick={() => {
                                const reason = (document.getElementById('rejection-reason') as HTMLTextAreaElement).value;
                                handleRejectTimesheet(timesheet.id, reason);
                              }}
                              variant="destructive"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
                {timesheet.status === 'Rejected' && (
                  <Button onClick={() => handleSubmitTimesheet(timesheet.id)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Resubmit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
