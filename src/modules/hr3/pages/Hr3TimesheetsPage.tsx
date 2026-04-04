import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Clock, User, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Timesheet {
  id: string;
  employee_id: string;
  date: string;
  total_hours: number;
  overtime_hours: number;
  status: string;
  created_at: string;
  employees: {
    full_name: string;
  };
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function Hr3TimesheetsPage() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const fetchTimesheets = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('timesheets')
        .select(`
          *,
          employees:employee_id (
            full_name
          )
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTimesheets((data || []) as Timesheet[]);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load timesheets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  const handleStatusUpdate = async (timesheetId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', timesheetId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Timesheet ${newStatus} successfully`,
      });

      fetchTimesheets();
    } catch (error) {
      console.error('Error updating timesheet:', error);
      toast({
        title: 'Error',
        description: 'Failed to update timesheet',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 border-0">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-700 border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-700 border-0">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'approved':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
      case 'rejected':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Timesheet Management</h1>
          <p className="text-muted-foreground">
            Review and approve employee timesheets for payroll processing
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Filter by Status</label>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timesheets */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Timesheets</CardTitle>
          <CardDescription>
            Review and manage employee working hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading timesheets...</p>
            </div>
          ) : timesheets.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No timesheets found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Timesheets will be generated automatically from completed attendance records
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timesheets.map((timesheet) => (
                <Card key={timesheet.id} className={`border-l-4 ${getStatusColor(timesheet.status)}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">{timesheet.employees.full_name}</h3>
                      </div>
                      {getStatusBadge(timesheet.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(timesheet.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{timesheet.total_hours.toFixed(2)} hours total</span>
                      </div>
                      {timesheet.overtime_hours > 0 && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <Clock className="w-4 h-4" />
                          <span>{timesheet.overtime_hours.toFixed(2)} hours overtime</span>
                        </div>
                      )}
                    </div>

                    {timesheet.status === 'pending' && (
                      <div className="flex gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="flex-1 gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Timesheet</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve this timesheet for {timesheet.employees.full_name}?
                                This will mark {timesheet.total_hours.toFixed(2)} hours as approved.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleStatusUpdate(timesheet.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="flex-1 gap-1">
                              <XCircle className="w-3 h-3" />
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Timesheet</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject this timesheet for {timesheet.employees.full_name}?
                                This action can be reversed later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleStatusUpdate(timesheet.id, 'rejected')}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}