import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  AlertCircle,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequest {
  id: string;
  leave_type: 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Unpaid';
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  submitted_date: string;
  approved_by?: string;
  approved_date?: string;
}

export default function LeaveManagementPage() {
  const [activeTab, setActiveTab] = useState<'my-requests' | 'available-balance'>('my-requests');
  const [isApplyingLeave, setIsApplyingLeave] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  // Sample data
  const leaveRequests_: LeaveRequest[] = [
    {
      id: '1',
      leave_type: 'Annual',
      start_date: '2026-04-15',
      end_date: '2026-04-17',
      total_days: 3,
      reason: 'Vacation',
      status: 'Approved',
      submitted_date: '2026-04-01',
      approved_by: 'John Manager',
      approved_date: '2026-04-02',
    },
    {
      id: '2',
      leave_type: 'Sick',
      start_date: '2026-04-10',
      end_date: '2026-04-10',
      total_days: 1,
      reason: 'Medical appointment',
      status: 'Approved',
      submitted_date: '2026-04-09',
      approved_by: 'John Manager',
      approved_date: '2026-04-09',
    },
    {
      id: '3',
      leave_type: 'Annual',
      start_date: '2026-05-20',
      end_date: '2026-05-30',
      total_days: 10,
      reason: 'Summer vacation with family',
      status: 'Pending',
      submitted_date: '2026-03-15',
    },
    {
      id: '4',
      leave_type: 'Casual',
      start_date: '2026-04-08',
      end_date: '2026-04-08',
      total_days: 1,
      reason: 'Personal matter',
      status: 'Rejected',
      submitted_date: '2026-04-07',
      approved_by: 'John Manager',
      approved_date: '2026-04-07',
    },
  ];

  const leaveBalance = {
    Annual: { total: 20, used: 4, available: 16 },
    Sick: { total: 10, used: 1, available: 9 },
    Casual: { total: 5, used: 1, available: 4 },
    Maternity: { total: 90, used: 0, available: 90 },
  };

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Approved': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Cancelled': 'bg-gray-100 text-gray-700',
  };

  const statusIcons: Record<string, any> = {
    'Pending': <Clock className="w-5 h-5 text-yellow-600" />,
    'Approved': <CheckCircle className="w-5 h-5 text-green-600" />,
    'Rejected': <AlertCircle className="w-5 h-5 text-red-600" />,
    'Cancelled': <AlertCircle className="w-5 h-5 text-gray-600" />,
  };

  const handleApplyLeave = () => {
    setIsApplyingLeave(true);
    alert('Leave application form would open here');
  };

  const handleCancelRequest = (id: string) => {
    alert(`Cancel leave request ${id}`);
  };

  const approvedRequests = leaveRequests_.filter(r => r.status === 'Approved');
  const pendingRequests = leaveRequests_.filter(r => r.status === 'Pending');
  const totalLeavePlanned = leaveRequests_
    .filter(r => r.status === 'Approved' || r.status === 'Pending')
    .reduce((sum, r) => sum + r.total_days, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Leave Management 🏖️
        </h1>
        <p className="text-muted-foreground mt-1">Apply for and manage your leave requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border justify-between">
        <div className="flex gap-4">
          {['my-requests', 'available-balance'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'my-requests' ? 'My Requests' : 'Available Balance'}
            </button>
          ))}
        </div>
        <Button onClick={handleApplyLeave} className="mb-3">
          <Plus className="w-4 h-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* My Requests Tab */}
      {activeTab === 'my-requests' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{pendingRequests.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{approvedRequests.length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Days Planned</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{totalLeavePlanned} days</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leave Requests */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">All Leave Requests</h3>
            <div className="space-y-3">
              {leaveRequests_.map(request => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-2">
                              {request.leave_type} Leave
                              <Badge className={statusColors[request.status]}>
                                {request.status}
                              </Badge>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mt-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide opacity-75">Date Range</p>
                            <p className="font-medium text-foreground mt-1">
                              {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide opacity-75">Duration</p>
                            <p className="font-medium text-foreground mt-1">{request.total_days} day{request.total_days !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs uppercase tracking-wide opacity-75">Reason</p>
                            <p className="font-medium text-foreground mt-1">{request.reason}</p>
                          </div>
                        </div>

                        {request.approved_by && (
                          <div className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3" />
                            {request.status === 'Rejected' ? 'Rejected' : 'Approved'} by {request.approved_by} on {format(new Date(request.approved_date!), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-col ml-4">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        {request.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelRequest(request.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Leave requests are typically approved within 2 business days. Contact your manager for urgent matters.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Available Balance Tab */}
      {activeTab === 'available-balance' && (
        <div className="space-y-4">
          {Object.entries(leaveBalance).map(([leaveType, balance]) => (
            <Card key={leaveType}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{leaveType} Leave</h3>
                    <Badge variant="outline">{balance.available} available</Badge>
                  </div>

                  {/* Balance Visual */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Used</span>
                      <span className="font-medium text-foreground">{balance.used} / {balance.total} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${(balance.used / balance.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-muted-foreground text-xs">Total</p>
                      <p className="font-semibold text-foreground mt-1">{balance.total} days</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded">
                      <p className="text-muted-foreground text-xs">Used</p>
                      <p className="font-semibold text-orange-700 mt-1">{balance.used} days</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-muted-foreground text-xs">Available</p>
                      <p className="font-semibold text-green-700 mt-1">{balance.available} days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unused leave may be carried over to the next year as per company policy. Check your employment contract for details.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
