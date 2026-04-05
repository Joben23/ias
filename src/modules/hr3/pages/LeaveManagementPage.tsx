import { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, X, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: 'Annual' | 'Sick' | 'Maternity' | 'Compassionate' | 'Unpaid';
  start_date: string;
  end_date: string;
  days_requested: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason: string;
  approver?: string;
  rejection_reason?: string;
  requested_date: string;
}

export default function LeaveManagementPage() {
  const mockLeaveRequests: LeaveRequest[] = [
    {
      id: 'LR-001',
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      leave_type: 'Annual',
      start_date: '2026-05-15',
      end_date: '2026-05-19',
      days_requested: 5,
      status: 'Pending',
      reason: 'Personal vacation',
      requested_date: '2026-05-06',
    },
    {
      id: 'LR-002',
      employee_id: 'HOS-IT-002',
      employee_name: 'Dr. Sarah Mitchell',
      leave_type: 'Sick',
      start_date: '2026-05-10',
      end_date: '2026-05-10',
      days_requested: 1,
      status: 'Approved',
      reason: 'Medical appointment',
      approver: 'Manager Admin',
      requested_date: '2026-05-09',
    },
    {
      id: 'LR-003',
      employee_id: 'HOS-IT-003',
      employee_name: 'Michael Chen',
      leave_type: 'Annual',
      start_date: '2026-06-01',
      end_date: '2026-06-07',
      days_requested: 7,
      status: 'Pending',
      reason: 'Summer vacation',
      requested_date: '2026-05-06',
    },
    {
      id: 'LR-004',
      employee_id: 'HOS-IT-004',
      employee_name: 'Jessica Martinez',
      leave_type: 'Maternity',
      start_date: '2026-05-20',
      end_date: '2026-09-19',
      days_requested: 120,
      status: 'Approved',
      reason: 'Maternity leave',
      approver: 'Manager Admin',
      requested_date: '2026-04-01',
    },
    {
      id: 'LR-005',
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      leave_type: 'Annual',
      start_date: '2026-04-10',
      end_date: '2026-04-12',
      days_requested: 3,
      status: 'Rejected',
      reason: 'Easter holiday',
      rejection_reason: 'Overlaps with critical project deadline',
      requested_date: '2026-03-20',
    },
  ];

  const leaveTypeColors: Record<string, string> = {
    'Annual': 'bg-blue-100 text-blue-800',
    'Sick': 'bg-red-100 text-red-800',
    'Maternity': 'bg-pink-100 text-pink-800',
    'Compassionate': 'bg-purple-100 text-purple-800',
    'Unpaid': 'bg-gray-100 text-gray-800',
  };

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-gray-100 text-gray-800',
  };

  const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [newLeaveDialog, setNewLeaveDialog] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leave_type: 'Annual' as const,
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [filterStatus, setFilterStatus] = useState('');
  const { toast } = useToast();

  const calculateLeaveDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleRequestLeave = () => {
    if (!newLeave.start_date || !newLeave.end_date || !newLeave.reason) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    const newRequest: LeaveRequest = {
      id: `LR-${String(leaves.length + 1).padStart(3, '0')}`,
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      leave_type: newLeave.leave_type,
      start_date: newLeave.start_date,
      end_date: newLeave.end_date,
      days_requested: calculateLeaveDays(newLeave.start_date, newLeave.end_date),
      status: 'Pending',
      reason: newLeave.reason,
      requested_date: new Date().toISOString().split('T')[0],
    };

    setLeaves([newRequest, ...leaves]);
    setNewLeave({ leave_type: 'Annual', start_date: '', end_date: '', reason: '' });
    setNewLeaveDialog(false);
    toast({
      title: 'Success',
      description: 'Leave request submitted',
    });
  };

  const handleApproveLeave = (id: string) => {
    setLeaves(leaves.map(l => l.id === id
      ? { ...l, status: 'Approved', approver: 'Current Manager' }
      : l
    ));
    toast({
      title: 'Success',
      description: 'Leave request approved',
    });
  };

  const handleRejectLeave = (id: string, reason: string) => {
    if (!reason) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }
    setLeaves(leaves.map(l => l.id === id
      ? { ...l, status: 'Rejected', rejection_reason: reason }
      : l
    ));
    toast({
      title: 'Success',
      description: 'Leave request rejected',
    });
  };

  const handleCancelLeave = (id: string) => {
    setLeaves(leaves.map(l => l.id === id
      ? { ...l, status: 'Cancelled' }
      : l
    ));
    toast({
      title: 'Success',
      description: 'Leave request cancelled',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export',
      description: 'Leave requests exported to PDF/Excel',
    });
  };

  const filteredLeaves = leaves.filter(l =>
    !filterStatus || l.status === filterStatus
  );

  const leaveBalance = {
    'Annual': 20 - leaves.filter(l => l.leave_type === 'Annual' && l.status === 'Approved').reduce((sum, l) => sum + l.days_requested, 0),
    'Sick': 10 - leaves.filter(l => l.leave_type === 'Sick' && l.status === 'Approved').reduce((sum, l) => sum + l.days_requested, 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1">Manage leave requests and approvals</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newLeaveDialog} onOpenChange={setNewLeaveDialog}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Leave Type *</label>
                  <Select value={newLeave.leave_type} onValueChange={(value) => setNewLeave({ ...newLeave, leave_type: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual">Annual Leave</SelectItem>
                      <SelectItem value="Sick">Sick Leave</SelectItem>
                      <SelectItem value="Maternity">Maternity Leave</SelectItem>
                      <SelectItem value="Compassionate">Compassionate Leave</SelectItem>
                      <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date *</label>
                    <Input
                      type="date"
                      value={newLeave.start_date}
                      onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date *</label>
                    <Input
                      type="date"
                      value={newLeave.end_date}
                      onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
                    />
                  </div>
                </div>
                {newLeave.start_date && newLeave.end_date && (
                  <div className="p-2 bg-muted rounded">
                    <p className="text-sm">
                      <span className="font-semibold">Total Leave Days:</span> {calculateLeaveDays(newLeave.start_date, newLeave.end_date)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Reason *</label>
                  <Textarea
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    placeholder="Please provide a reason for your leave request"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewLeaveDialog(false)}>Cancel</Button>
                  <Button onClick={handleRequestLeave}>Submit Request</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Annual Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{leaveBalance['Annual']} days</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 20 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Sick Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{leaveBalance['Sick']} days</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 10 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{leaves.filter(l => l.status === 'Pending').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
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
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <div className="space-y-4">
        {filteredLeaves.map(leave => (
          <Card key={leave.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {leave.employee_name}
                  </CardTitle>
                  <CardDescription>
                    {leave.start_date} to {leave.end_date} • {leave.days_requested} days
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={leaveTypeColors[leave.leave_type]}>{leave.leave_type}</Badge>
                  <Badge className={statusColors[leave.status]}>{leave.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reason
                </h4>
                <p className="text-sm text-muted-foreground">{leave.reason}</p>
              </div>

              {leave.rejection_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    Rejection Reason
                  </h4>
                  <p className="text-sm text-red-700">{leave.rejection_reason}</p>
                </div>
              )}

              {leave.approver && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold">Approved by:</span> {leave.approver}
                </div>
              )}

              {/* Actions */}
              {leave.status === 'Pending' && (
                <div className="flex gap-2 pt-4">
                  <Button size="sm" onClick={() => handleApproveLeave(leave.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Leave Request</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea placeholder="Reason for rejection..." id="rejection-reason" />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button
                            onClick={() => {
                              const reason = (document.getElementById('rejection-reason') as HTMLTextAreaElement).value;
                              handleRejectLeave(leave.id, reason);
                            }}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {leave.status === 'Approved' && (
                <div className="flex gap-2 pt-4">
                  <Button size="sm" variant="outline" onClick={() => handleCancelLeave(leave.id)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel Leave
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
